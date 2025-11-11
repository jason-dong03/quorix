import { query } from "../db.js";
import dotenv from "dotenv";

dotenv.config();


export async function fetchUserTransactions(userID, endISO) {
    const sql = `
    SELECT symbol, shares, updated_at
    FROM holdings
    WHERE user_id = $1
      AND updated_at <= $2
    ORDER BY updated_at ASC
    `;
    const res = await query(sql, [userID, endISO]);
    return res.rows;
}

export async function getHistoricalPrices(symbol, startDateISO, endDateISO, timeframe = "1Day") {
  // intraday: bypass cache
  if (timeframe !== "1Day") {
    try {
      const bars = await fetchFromAlpaca(symbol, startDateISO, endDateISO, timeframe);
      return normalizeBars(timeframe, bars);
    } catch (error) {
      console.error(`Error fetching intraday for ${symbol}:`, error);
      return [];
    }
  }

  // pull from cache first
  const cached = await query(
    `
    SELECT date, close, open, high, low, volume
    FROM price_cache
    WHERE symbol = $1
      AND date >= $2::date
      AND date <= $3::date
      AND EXTRACT(DOW FROM date) NOT IN (0,6)
    ORDER BY date ASC
    `,
    [symbol, startDateISO, endDateISO]
  );

  // figure out missing weekdays (holidays not handled here)
  const cachedDates = new Set(
    cached.rows.map(r => toYMD(r.date)) // r.date is a JS Date
  );
  const missingDates = getMissingTradingDays(startDateISO, endDateISO, cachedDates);

  const totalExpected = getMissingTradingDays(startDateISO, endDateISO, new Set()).length;
  const missThreshold = totalExpected * 0.2;

  if (missingDates.length <= missThreshold && cached.rows.length > 0) {
    //need normalizing lat9r
    return normalizeBars("1Day", cached.rows);
  }

  // cache miss: fetch daily from Alpaca, save, then return merged from DB
  try {
    const apiBars = await fetchFromAlpaca(symbol, startDateISO, endDateISO, "1Day");
    if (apiBars.length > 0) {
      await savePricesToCache(symbol, apiBars);
    }

    const merged = await query(
      `
      SELECT date, close, open, high, low, volume
      FROM price_cache
      WHERE symbol = $1
        AND date >= $2::date
        AND date <= $3::date
      ORDER BY date ASC
      `,
      [symbol, startDateISO, endDateISO]
    );

    return normalizeBars("1Day", merged.rows);
  } catch (error) {
    console.error(`Error fetching daily API for ${symbol}:`, error);
    if (cached.rows.length > 0) {
      console.log(`Using stale cache for ${symbol}`);
      return normalizeBars("1Day", cached.rows);
    }
    return [];
  }
}

async function fetchFromAlpaca(symbol, startISO, endISO, timeframe = "1Day") {
  const url =
    `https://data.alpaca.markets/v2/stocks/bars` +
    `?symbols=${encodeURIComponent(symbol)}` +
    `&timeframe=${encodeURIComponent(timeframe)}` +
    `&start=${encodeURIComponent(startISO)}` +
    `&end=${encodeURIComponent(endISO)}` +
    `&limit=10000&adjustment=raw&feed=iex&sort=asc`;

  const response = await fetch(url, {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Alpaca ${response.status}: ${body}`);
  }

  const data = await response.json();
  const list = data?.bars?.[symbol] || [];
  if (!Array.isArray(list) || list.length === 0) return [];

  // Return raw bars with 't' and OHLCV; we'll normalize later
  return list.map(bar => ({
    t: bar.t,   
    o: bar.o,
    h: bar.h,
    l: bar.l,
    c: bar.c,
    v: bar.v,
  }));
}


function normalizeBars(timeframe, rowsOrBars) {
  // input db rows ({date: Date, open, high, low, close, volume})
  // alpaca results: ({t: ISO, o,h,l,c,v})
  const out = rowsOrBars.map(rec => {
    if ("t" in rec) {
      // Alpaca bar
      return {
        t: rec.t, 
        date: timeframe === "1Day" ? toYMD(rec.t) : rec.t,
        open: rec.o,
        high: rec.h,
        low: rec.l,
        close: rec.c,
        volume: rec.v,
      };
    } else {
      // DB row
      const isoMidnight = ymdToMidnightISO(rec.date);
      return {
        t: isoMidnight,                
        date: toYMD(rec.date),            // YYYY-MM-DD
        open: Number(rec.open),
        high: Number(rec.high),
        low: Number(rec.low),
        close: Number(rec.close),
        volume: Number(rec.volume),
      };
    }
  });

  out.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  return out;
}

async function savePricesToCache(symbol, prices) {
  if (!prices.length) return;

  const valuesSql = prices
    .map(p => {
      const ymd = toYMD(p.t); 
      return `('${symbol}', '${ymd}', ${p.o}, ${p.h}, ${p.l}, ${p.c}, ${p.v})`;
    })
    .join(",");

  await query(`
    INSERT INTO price_cache (symbol, date, open, high, low, close, volume)
    VALUES ${valuesSql}
    ON CONFLICT (symbol, date)
    DO UPDATE SET
      open = EXCLUDED.open,
      high = EXCLUDED.high,
      low  = EXCLUDED.low,
      close = EXCLUDED.close,
      volume = EXCLUDED.volume,
      cached_at = NOW()
  `);

  console.log(`✓ Cached ${prices.length} prices for ${symbol}`);
}


function toYMD(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toISOString().slice(0, 10); //yyyy-mm-dd format gng
}
function ymdToMidnightISO(d) {
  const ymd = toYMD(d);
  return `${ymd}T00:00:00.000Z`;
}

function getMissingTradingDays(startISO, endISO, cachedDates) {
  const missing = [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const ymd = toYMD(d);
    if (!cachedDates.has(ymd)) missing.push(ymd);
  }
  return missing;
}
