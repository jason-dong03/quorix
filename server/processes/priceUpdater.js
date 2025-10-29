import { getAllSymbols, upsertQuotes } from "../models/marketDataModel.js";

import cron from "node-cron";
import finnhubClient from "../finnhubClient.js";

function fetchSingleQuote(symbol) {
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

// start scheduler
export function startPriceUpdater() {
  refreshMarketDataOnce();

  // run every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    refreshMarketDataOnce();
  });
}

import { query } from "../db.js";

export async function insertEODData() {
  try {
    const symbols = await getAllSymbols();

    const results = [];

    for (const symbol of symbols) {
      const data = await new Promise((res) => {
        finnhubClient.quote(symbol, (_, d) => res(d || null));
      });

      if (data && !data.error && data.c) {
        results.push({
          symbol,
          last_price: data.c,
          last_change_pct: data.dp,
        });
      }
    }

    if (!results.length) return;

    const values = [];
    const params = [];
    let i = 1;
    for (const r of results) {
      values.push(`($${i}, $${i + 1}, $${i + 2}, NOW())`);
      params.push(r.symbol, r.last_price, r.last_change_pct);
      i += 3;
    }

    await query(
      `
      INSERT INTO market_data_updates (symbol,last_price,last_change_pct,last_updated)
      VALUES ${values.join(",")}
      ON CONFLICT (symbol)
      DO UPDATE SET
        last_price=EXCLUDED.last_price,
        last_change_pct=EXCLUDED.last_change_pct,
        last_updated=EXCLUDED.last_updated;
    `,
      params
    );

    console.log(`[EOD] updated ${results.length} symbols`);
  } catch (err) {
    console.error("[EOD] error inserting EOD data", err);
  }
}
