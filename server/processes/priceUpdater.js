import { getAllSymbols, upsertQuotes } from "../models/marketDataModel.js";

import cron from "node-cron";
import finnhubClient from "../finnhubClient.js";

export function fetchSingleQuote(symbol) {
  console.log(`fetching ${symbol}...`);
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (err, data) => {
      if (err) return reject(err);
      resolve({
        symbol,
        last_price: data.c,
        last_change_pct: data.dp,
      });
    });
  });
}

// fetch quotes for many symbols
async function fetchQuotesForSymbols(symbols) {
  const BATCH_SIZE = 20;

  const allResults = [];
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const chunk = symbols.slice(i, i + BATCH_SIZE);

    const chunkResults = await Promise.all(
      chunk.map((sym) => fetchSingleQuote(sym).catch(() => null))
    );

    for (const r of chunkResults) {
      if (r) allResults.push(r);
    }
  }

  return allResults;
}

// helper: is US market open right now?
function marketOpenNowEastern() {
  const now = new Date();

  const day = now.getDay(); // 0-6
  if (day === 0 || day === 6) return false; // weekend

  const hour = now.getHours(); // 0-23
  const min = now.getMinutes(); // 0-59

  // after 9:30 and before 16:00
  const afterOpen = hour > 9 || (hour === 9 && min >= 30);
  const beforeClose = hour < 16;

  return afterOpen && beforeClose;
}

export async function refreshMarketDataOnce() {
  // rule:
  // - if market open: get fresh quotes from Finnhub
  // - if market closed: skip the API call (keep last snapshot)
  //   optionally: do a single EOD call at ~16:05, but that's optional.

  if (!marketOpenNowEastern()) {
    console.log("[market-data] market closed, skipping live pull");
    return;
  }

  try {
    const symbols = await getAllSymbols();
    const quotes = await fetchQuotesForSymbols(symbols);
    await upsertQuotes(quotes);
    console.log(`[market-data] updated ${quotes.length} symbols`);
  } catch (err) {
    console.error("[market-data] refresh error", err);
  }
}

export function startPriceUpdater() {
  refreshMarketDataOnce();

  // run every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    refreshMarketDataOnce();
  });
}

import { query } from "../db.js";
import { performance } from "node:perf_hooks";

const VERBOSE = process.env.EOD_VERBOSE === "1";

function now() {
  return new Date().toISOString();
}
function log(msg, extra) {
  if (extra !== undefined) console.log(`[${now()}] ${msg}`, extra);
  else console.log(`[${now()}] ${msg}`);
}
function warn(msg, extra) {
  console.warn(`[${now()}] WARN ${msg}`, extra ?? "");
}
function errlog(msg, extra) {
  console.error(`[${now()}] ERROR ${msg}`, extra ?? "");
}

function fetchQuote(symbol, { timeoutMs = 5000, retries = 2 } = {}) {
  return new Promise((resolve) => {
    let finished = false;

    const done = (ok, payload) => {
      if (finished) return;
      finished = true;
      resolve({ ok, ...payload });
    };

    const to = setTimeout(() => done(false, { error: new Error("timeout") }), timeoutMs);

    try {
      finnhubClient.quote(symbol, (e, d) => {
        clearTimeout(to);
        if (e) return done(false, { error: e });
        return done(true, { data: d ?? null });
      });
    } catch (e) {
      clearTimeout(to);
      done(false, { error: e });
    }
  }).then(async (r) => {
    if (!r.ok && retries > 0) {
      if (VERBOSE) warn(`retrying ${symbol}, left=${retries}`, r.error?.message ?? r.error);
      await new Promise((res) => setTimeout(res, 300 + Math.random() * 300));
      return fetchQuote(symbol, { timeoutMs, retries: retries - 1 });
    }
    return r;
  });
}

export async function insertEODData() {
  const t0 = performance.now();
  log("[EOD] start");

  try {
    const symbols = await getAllSymbols();
    if (!Array.isArray(symbols) || symbols.length === 0) {
      warn("[EOD] no symbols returned from getAllSymbols()");
      return;
    }
    log(`[EOD] symbols=${symbols.length}`);

    let okCount = 0;
    let errCount = 0;
    const results = [];

    for (const symbol of symbols) {
      const tSym0 = performance.now();
      const r = await fetchQuote(symbol);
      const dt = (performance.now() - tSym0).toFixed(0);

      if (!r.ok) {
        errCount++;
        if (VERBOSE) errlog(`[EOD] ${symbol} quote failed in ${dt}ms`, r.error?.message ?? r.error);
        continue;
      }

      const data = r.data;
      const price = Number(data?.c);
      const chgPct = data?.dp == null ? null : Number(data.dp);

      const valid = Number.isFinite(price);
      if (!valid) {
        errCount++;
        if (VERBOSE) warn(`[EOD] ${symbol} invalid payload in ${dt}ms`, data);
        continue;
      }

      results.push({
        symbol,
        last_price: price,
        last_change_pct: Number.isFinite(chgPct) ? chgPct : null,
      });
      okCount++;

      if (VERBOSE) log(`[EOD] ${symbol} ok in ${dt}ms @ ${price} dp=${chgPct}`);
    }

    if (results.length === 0) {
      warn("[EOD] no valid quotes collected; skipping DB upsert");
      return;
    }

    const values = [];
    const params = [];
    let i = 1;
    for (const r of results) {
      values.push(`($${i}, $${i + 1}, $${i + 2}, NOW())`);
      params.push(r.symbol, r.last_price, r.last_change_pct);
      i += 3;
    }

    const tDb0 = performance.now();
    const sql = `
      INSERT INTO market_data_updates (symbol,last_price,last_change_pct,last_updated)
      VALUES ${values.join(",")}
      ON CONFLICT (symbol)
      DO UPDATE SET
        last_price = EXCLUDED.last_price,
        last_change_pct = EXCLUDED.last_change_pct,
        last_updated = EXCLUDED.last_updated
    `;
    const res = await query(sql, params);
    const dbMs = (performance.now() - tDb0).toFixed(0);

    log(`[EOD] upserted rowCount=${res?.rowCount ?? "n/a"} in ${dbMs}ms`);
    log(`[EOD] sample(5)`, results.slice(0, 5));
    const totalMs = (performance.now() - t0).toFixed(0);
    log(`[EOD] done ok=${okCount} err=${errCount} wrote=${results.length} total=${totalMs}ms`);
  } catch (e) {
    errlog("[EOD] fatal error", e);
  }
}
