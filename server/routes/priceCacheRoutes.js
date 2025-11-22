import express from "express";
import jwt from "jsonwebtoken";
import { getHistoricalPrices,fetchUserTransactions } from "../models/priceCacheModel.js";
import { fetchUserHoldingsByDate } from "../models/marketDataModel.js";
import { DateTime } from "luxon";
const router = express.Router();


function nowET() {
  return DateTime.now().setZone('America/New_York');
}

function previousBusinessDayET(dt) {
  // dt is already a Luxon DateTime
  let current = dt;
  do {
    current = current.minus({ days: 1 });
  } while ([0, 6].includes(current.weekday % 7)); // Luxon uses 1-7, not 0-6
  return current;
}

function startOfSessionET(dt) {
  // dt is already a Luxon DateTime
  return dt.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
}

function endOfSessionET(dt) {
  // dt is already a Luxon DateTime  
  return dt.set({ hour: 15, minute: 55, second: 0, millisecond: 0 });
}

function toUtcIso(dt) {
  // dt is a Luxon DateTime, convert to UTC ISO string
  return dt.toUTC().toISO();
}

function buildRange(timeframe) {
  const etNow = nowET(); // Returns DateTime

  if (timeframe === "1D") {
    const sessionStart = startOfSessionET(etNow);
    const sessionEnd = endOfSessionET(etNow);

    if (etNow < sessionStart) {
      const prev = previousBusinessDayET(etNow);
      const s = startOfSessionET(prev);
      const e = endOfSessionET(prev);
      return { startISO: toUtcIso(s), endISO: toUtcIso(e), apiTf: "5Min" };
    }

    if (etNow > sessionEnd) {
      return { 
        startISO: toUtcIso(sessionStart), 
        endISO: toUtcIso(sessionEnd), 
        apiTf: "5Min" 
      };
    }

    return { 
      startISO: toUtcIso(sessionStart), 
      endISO: toUtcIso(etNow), 
      apiTf: "5Min" 
    };
  }

  if (timeframe === "5D") {
    const start = etNow.minus({ days: 7 });
    return { 
      startISO: toUtcIso(start), 
      endISO: toUtcIso(etNow), 
      apiTf: "1Hour" 
    };
  }

  if (timeframe === "1M") {
    const start = etNow.minus({ months: 1 });
    return { 
      startISO: toUtcIso(start), 
      endISO: toUtcIso(etNow), 
      apiTf: "1Day" 
    };
  }
  const { startISO, endISO, apiTf } = buildRange(timeframe);
  // Default case
  const start = etNow.minus({ months: 1 });
  return { 
    startISO: toUtcIso(start), 
    endISO: toUtcIso(etNow), 
    apiTf: "1Day" 
  };
}
//TREAT SELL FEATURE AS NEGATIVE NOT DELETE FROM DB AND MARK IT AS SOLD 
// priceCacheRoutes.js
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
      return res.json({ history: [] });
    }

    const { startISO, endISO, apiTf } = buildRange(timeframe);
    console.log(`\n========== ${timeframe} REQUEST ==========`);
    console.log(`📅 Range: ${startISO} → ${endISO}`);
    console.log(`📅 API Timeframe: ${apiTf}`);

    // Fetch all price histories
    const priceHistories = await Promise.all(
      groupedHoldings.map(async (h) => {
        const prices = await getHistoricalPrices(h.symbol, startISO, endISO, apiTf);
        console.log(`📊 ${h.symbol}: ${prices.length} bars`);
        if (prices.length > 0) {
          console.log(`   First: ${new Date(prices[0].t).toISOString()}`);
          console.log(`   Last: ${new Date(prices[prices.length - 1].t).toISOString()}`);
        }
        return { symbol: h.symbol, prices };
      })
    );

    const transactions = await fetchUserTransactions(userID, endISO);

    // === BUILD CANONICAL TIMELINE ===
    // Use the symbol with the most bars as the reference
    let referenceSymbol = priceHistories[0];
    for (const ph of priceHistories) {
      if ((ph.prices?.length || 0) > (referenceSymbol.prices?.length || 0)) {
        referenceSymbol = ph;
      }
    }

    if (!referenceSymbol.prices?.length) {
      return res.json({ history: [] });
    }

    // Build timeline from reference symbol only
    const timeline = referenceSymbol.prices
      .map(p => new Date(p.t || p.timestamp || p.date).getTime())
      .filter(ms => !isNaN(ms))
      .sort((a, b) => a - b);

    console.log(`⏰ Reference: ${referenceSymbol.symbol} with ${timeline.length} bars`);
    console.log(`⏰ Timeline: ${new Date(timeline[0])} → ${new Date(timeline[timeline.length - 1])}`);

    // === BUILD PRICE MAPS WITH ALIGNMENT ===
    const priceMap = new Map();
    
    for (const { symbol, prices } of priceHistories) {
      const m = new Map();
      
      // Index by timestamp
      for (const p of prices || []) {
        const ms = new Date(p.t || p.timestamp || p.date).getTime();
        const close = Number(p.close ?? p.c);
        if (Number.isFinite(ms) && Number.isFinite(close)) {
          m.set(ms, close);
        }
      }

      // Forward-fill ONLY on canonical timeline
      let lastPrice = null;
      const aligned = new Map();
      for (const ts of timeline) {
        if (m.has(ts)) {
          lastPrice = m.get(ts);
        }
        if (lastPrice !== null) {
          aligned.set(ts, lastPrice);
        }
      }
      
      priceMap.set(symbol, aligned);
      console.log(`📊 ${symbol}: ${m.size} raw bars → ${aligned.size} aligned bars`);
    }

    // === PROCESS TRANSACTIONS ===
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

    // === CALCULATE PORTFOLIO VALUE ===
    const holdingsNow = new Map();
    let txIdx = 0;
    const history = [];

    for (const ts of timeline) {
      // Apply transactions
      while (txIdx < txs.length && txs[txIdx].ms <= ts) {
        const { symbol, shares } = txs[txIdx];
        const prev = holdingsNow.get(symbol) || 0;
        holdingsNow.set(symbol, prev + shares);
        txIdx++;
      }

      // Calculate value
      let total = 0;
      let hasData = false;
      for (const [symbol, shares] of holdingsNow.entries()) {
        if (!shares) continue;
        const price = priceMap.get(symbol)?.get(ts);
        if (price !== undefined) {
          total += shares * price;
          hasData = true;
        }
      }

      // Only include points where we have price data
      if (hasData) {
        history.push({
          timestamp: ts,
          value: Math.round(total * 100) / 100,
        });
      }
    }

    console.log(`✅ Returning ${history.length} portfolio points`);
    console.log(`   First: ${new Date(history[0].timestamp).toISOString()} = $${history[0].value}`);
    console.log(`   Last: ${new Date(history[history.length - 1].timestamp).toISOString()} = $${history[history.length - 1].value}`);
    console.log(`========================================\n`)
    return res.json({ history });

  } catch (err) {
    console.error("Portfolio history error:", err);
    return res.status(500).json({ error: "Failed to fetch portfolio history" });
  }
});

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
