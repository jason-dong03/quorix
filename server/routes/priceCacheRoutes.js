import express from "express";
import jwt from "jsonwebtoken";
import { getHistoricalPrices,fetchUserTransactions } from "../models/priceCacheModel.js";
import { fetchUserHoldingsByDate } from "../models/marketDataModel.js";
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
    const start = new Date(etNow); 
    start.setDate(start.getDate() - 7);
    return { startISO: toUtcIso(start), endISO: toUtcIso(etNow), apiTf: "1Hour" };
  }

  if (timeframe === "1M") {
    const start = new Date(etNow);
    start.setMonth(start.getMonth() - 1);
    return { startISO: toUtcIso(start), endISO: toUtcIso(etNow), apiTf: "1Day" };
  }

  const start = new Date(etNow); 
  start.setMonth(start.getMonth() - 1);
  return { startISO: toUtcIso(start), endISO: toUtcIso(etNow), apiTf: "1Day" };
}
//TREAT SELL FEATURE AS NEGATIVE NOT DELETE FROM DB AND MARK IT AS SOLD 
router.get("/api/portfolio-history", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(404).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.uid;
    const { timeframe = "1M" } = req.query;

    const holdings = await fetchUserHoldingsByDate(userID);

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
        const prices = await getHistoricalPrices(h.symbol, startISO, endISO, apiTf);
        return { symbol: h.symbol, prices };
      })
    );
    const transactions = await fetchUserTransactions(userID, endISO);
    //console.log("transaction result: ", transactions);

  
    const tsSet = new Set();
    for (const { prices } of priceHistories) {
      for (const p of prices || []) {
        const tsRaw = p.t || p.timestamp || p.date;
        if (!tsRaw) continue;
        const ms = new Date(tsRaw).getTime();
        if (!Number.isNaN(ms)) tsSet.add(ms);
      }
    }
    if (tsSet.size === 0) return res.json({ history: [] });

    const timeline = Array.from(tsSet).sort((a, b) => a - b);

   
    const priceMap = new Map(); 
    for (const { symbol, prices } of priceHistories) {
      const m = new Map();
      for (const p of prices || []) {
        const tsRaw = p.t || p.timestamp || p.date;
        const ms = new Date(tsRaw).getTime();
        const close = Number(p.close ?? p.c); 
        if (Number.isFinite(ms) && Number.isFinite(close)) {
          m.set(ms, close);
        }
      }
      priceMap.set(symbol, m);
    }
    //console.log("🟢 priceMap symbols:", [...priceMap.keys()]);
    for (const [symbol, m] of priceMap.entries()) {
      //console.log(`${symbol} barCount = ${m.size}`);
      let last;
      for (const ts of timeline) {
        if (m.has(ts)) last = m.get(ts);
        else if (last != null) m.set(ts, last);
        else m.set(ts, 0); 
      }
    }

    const priceSymbols = new Set(priceMap.keys());
    const txs = transactions
      .filter((t) => priceSymbols.has(t.symbol))
      .map((t) => ({
        symbol: t.symbol,
        shares: Number(t.shares), 
        ms: new Date(t.updated_at).getTime(),
      }))
      .filter((t) => Number.isFinite(t.ms) && Number.isFinite(t.shares))
      .sort((a, b) => a.ms - b.ms); 

    //console.log("tx count:", txs.length);
    //console.log("timeline points:", timeline.length);

   
    const holdingsNow = new Map();
    let txIdx = 0;

    const history = [];
    for (const ts of timeline) {
      while (txIdx < txs.length && txs[txIdx].ms <= ts) {
        const { symbol, shares } = txs[txIdx];
        const prev = holdingsNow.get(symbol) || 0;
        holdingsNow.set(symbol, prev + shares);
        txIdx++;
      }

      let total = 0;
      for (const [symbol, shares] of holdingsNow.entries()) {
        if (!shares) continue;
        const m = priceMap.get(symbol);
        const price = m ? m.get(ts) ?? 0 : 0;
        total += shares * price;
      }

      history.push({
        timestamp: ts,
        date:
          timeframe === "1D"
            ? new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(total * 100) / 100,
      });
    }

    return res.json({ history });
  } catch (err) {
    console.error("Portfolio history error:", err);
    return res.status(500).json({ error: "Failed to fetch portfolio history" });
  }
});

// GET /api/benchmarks?timeframe=1M&symbols=SPY,QQQ,DIA&mode=percent
router.get("/api/benchmarks", async (req, res) => {
  const { timeframe = "1M", symbols = "SPY,QQQ,DIA", mode = "percent" } = req.query;
  const list = symbols.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);

  const { startISO, endISO, apiTf } = buildRange(timeframe);
  const series = {};

  for (const sym of list) {
    const bars = await getHistoricalPrices(sym, startISO, endISO, apiTf); // same as portfolio
   
    if (!bars?.length) { series[sym] = []; continue; }

    const first = bars[0].close;
    const mapped = bars.map(b => ({
      timestamp: new Date(b.t || b.date).getTime(),
      value: mode === "percent" ? ((b.close / first) - 1) * 100 : b.close,
    }));
    series[sym] = mapped;
  }

  res.json({ series, mode });
});


export default router;
