import express from "express";
import jwt from "jsonwebtoken";
import { getHistoricalPrices } from "../models/cacheModel.js";
import { fetchUserHoldings } from "../models/marketDataModel.js";
const router = express.Router();

function nowET() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}

function previousBusinessDayET(d) {
  const out = new Date(d);
  do { out.setDate(out.getDate() - 1); } while ([0,6].includes(out.getDay()));
  return out;
}

function startOfSessionET(d) {
  const s = new Date(d);
  s.setHours(9, 30, 0, 0);           
  return s;
}

function endOfSessionET(d) {
  const e = new Date(d);
  e.setHours(15, 55, 0, 0);          
  return e;
}

function toUtcIso(d) { return new Date(d.getTime()).toISOString(); }

function buildRange(timeframe) {
  const etNow = nowET();

  if (timeframe === "1D") {
    const sessionStart = startOfSessionET(etNow);
    const sessionEnd   = endOfSessionET(etNow);

    if (etNow < sessionStart) {
      const prev = previousBusinessDayET(etNow);
      const s = startOfSessionET(prev);
      const e = endOfSessionET(prev);
      return { startISO: toUtcIso(s), endISO: toUtcIso(e), apiTf: "5Min" };
    }

    if (etNow > sessionEnd) {
      return { startISO: toUtcIso(sessionStart), endISO: toUtcIso(sessionEnd), apiTf: "5Min" };
    }

    return { startISO: toUtcIso(sessionStart), endISO: toUtcIso(etNow), apiTf: "5Min" };
  }

  if (timeframe === "5D") {
    const start = new Date(etNow); start.setDate(start.getDate() - 7);
    return { startISO: toUtcIso(start), endISO: toUtcIso(etNow), apiTf: "1Hour" };
  }

  const start = new Date(etNow); start.setDate(start.getDate() - 35);
  return { startISO: toUtcIso(start), endISO: toUtcIso(etNow), apiTf: "1Day" };
}
router.get("/api/portfolio-history", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(404).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.uid;
    const { timeframe = "1M" } = req.query;

    const holdings = await fetchUserHoldings(userID);

    const groupedHoldings = Object.values(
      holdings.reduce((acc, h) => {
        if (!acc[h.symbol]) acc[h.symbol] = { ...h, shares: 0 };
        acc[h.symbol].shares = (
          parseFloat(acc[h.symbol].shares) + parseFloat(h.shares)
        ).toString();
        return acc;
      }, {})
    );

    if (!groupedHoldings.length) {
      return res.status(404).json({ groupedHoldings: [] });
    }

    const { startISO, endISO, apiTf } = buildRange(timeframe);
    //console.log(`📅 TF=${timeframe} API_TF=${apiTf} Range=${startISO} → ${endISO}`);

    const priceHistories = await Promise.all(
      groupedHoldings.map(async (h) => {
        console.log(`Fetching ${h.symbol} x ${h.shares} ...`);
        // IMPORTANT: pass datetime ISO strings, not date-only
        const prices = await getHistoricalPrices(h.symbol, startISO, endISO, apiTf);
        return { symbol: h.symbol, shares: h.shares, prices };
      })
    );

    const portfolioHistory = calculatePortfolioValues(priceHistories, timeframe);
    //console.log("PORTFOLIO_HISTORY", JSON.stringify(portfolioHistory.slice(0, 5), null, 2));
    return res.json({ history: portfolioHistory });
  } catch (err) {
    //console.error("Portfolio history error:", err);
    return res.status(500).json({ error: "Failed to fetch portfolio history" });
  }
});

function calculatePortfolioValues(priceHistories, mode = "1D") {
  const valid = (priceHistories || []).filter((s) => s?.prices?.length > 0);
  if (!valid.length) return [];

  if (mode === "1D") {
    // intraday: sum by raw bar timestamp (no normalizing)
    const buckets = new Map(); // ts(ms) -> total
    for (const stock of valid) {
      const shares = parseFloat(stock.shares) || 0;
      if (shares <= 0) continue;
      for (const p of stock.prices) {
        const tsRaw = p.t || p.date; if (!tsRaw) continue;
        const close = +p.close; if (!Number.isFinite(close)) continue;
        const ts = new Date(tsRaw).getTime();
        buckets.set(ts, (buckets.get(ts) || 0) + shares * close);
      }
    }
    const keys = Array.from(buckets.keys()).sort((a, b) => a - b);
    return keys.map((ms) => ({
      timestamp: ms,
      date: new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      value: Math.round(buckets.get(ms) * 100) / 100,
    }));
  }

  // 5D / 1M: use LAST bar of each UTC day per symbol, then sum
  const perSymDay = new Map(); // symbol -> Map<dayMsUTC, { ts, close }>
  for (const stock of valid) {
    const shares = parseFloat(stock.shares) || 0;
    if (shares <= 0) continue;
    const dayMap = new Map();
    for (const p of stock.prices) {
      const tsRaw = p.t || p.date; if (!tsRaw) continue;
      const close = +p.close; if (!Number.isFinite(close)) continue;
      const ts = new Date(tsRaw).getTime();
      const d = new Date(ts); d.setUTCHours(0, 0, 0, 0);
      const dayKey = d.getTime();
      const prev = dayMap.get(dayKey);
      if (!prev || ts > prev.ts) dayMap.set(dayKey, { ts, close });
    }
    perSymDay.set(stock.symbol || Symbol(), { shares, dayMap });
  }

  const allDays = new Set();
  for (const { dayMap } of perSymDay.values()) for (const k of dayMap.keys()) allDays.add(k);
  const days = Array.from(allDays).sort((a, b) => a - b);

  return days.map((dayMs) => {
    let total = 0;
    for (const { shares, dayMap } of perSymDay.values()) {
      const rec = dayMap.get(dayMs);
      if (rec) total += shares * rec.close;
    }
    return {
      timestamp: dayMs,
      date: new Date(dayMs).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(total * 100) / 100,
    };
  });
}

export default router;
