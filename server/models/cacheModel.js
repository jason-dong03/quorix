import { query } from "../db.js";
import dotenv from "dotenv";

dotenv.config();




export async function getHistoricalPrices(symbol, startDate, endDate, timeframe = '1Day'){
    if (timeframe !== '1Day') {
       // console.log(`⚡ Fetching intraday data for ${symbol} (${timeframe}) - bypassing cache`);
        try {
            return await fetchFromAlpaca(symbol, startDate, endDate, timeframe);
        } catch (error) {
            console.error(`Error fetching intraday data for ${symbol}:`, error);
            return [];
        }
    }
    
    const cachedPrices = await query(`SELECT date, close, open, high, low, volume
    FROM price_cache WHERE symbol = $1 AND date >= $2 AND date <= $3
    AND EXTRACT(DOW FROM date) NOT IN (0,6) ORDER BY date ASC`, [symbol, startDate,endDate]);


    const cachedDates = new Set(cachedPrices.rows.map(row => row.date.toISOString().split('T')[0]));
    const missingDates = getMissingTradingDays(startDate,endDate, cachedDates);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const isAfterMarketClose = now.getHours() >= 16; 
    const isTodayMissing = !cachedDates.has(today) && isAfterMarketClose;

    if (isTodayMissing && missingDates.length === 0) {
        missingDates.push(today);
    }
    if(cachedDates.size >0 && missingDates.length === 0){ 
        console.log("no missing dates, returning cache data");
        return cachedPrices.rows;
    }
    console.log(`⚠ Cache MISS for ${symbol}: fetching from Alpaca`); 
    try {
       // console.log(`🔷 Fetching ${symbol} from Alpaca...`);
        const data = await fetchFromAlpaca(symbol, startDate, endDate, timeframe);
        if (data.length > 0 && timeframe == "1Day") {
            await savePricesToCache(symbol, data);
        }
        const allPrices = await query(`
            SELECT date, close, open, high, low, volume
            FROM price_cache
            WHERE symbol = $1 
                AND date >= $2
                AND date <= $3
            ORDER BY date ASC
            `, [symbol, startDate, endDate]);
            
        return allPrices.rows;
    } catch (error) {
        console.error(`Error fetching from API for ${symbol}:`, error);        
        if (cachedPrices.rows.length > 0) {
            console.log(`⚠ Using stale cache data for ${symbol}`);
            return cachedPrices.rows;
        }
        console.warn(`⚠ No data available for ${symbol} - returning empty array`);
        return [];
    }  
}
async function fetchFromAlpaca(symbol, startDate, endDate, timeframe = '1Day') {
  try {
    const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=${timeframe}&start=${startDate}&end=${endDate}&limit=1000&adjustment=raw&feed=iex&sort=asc`;
    
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET
      }
    });
    
    const data = await response.json();
    
    if (!data.bars || !data.bars[symbol] || data.bars[symbol].length === 0) {
      console.warn(`No data from Alpaca for ${symbol}`);
      return [];
    }
    
    return data.bars[symbol].map(bar => ({
        date: timeframe === '1Day' ? bar.t.split('T')[0] : bar.t,
        t: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
    }));
    
  } catch (error) {
    console.error(`Error fetching ${symbol} from Alpaca:`, error);
    throw error;
  }
}
async function savePricesToCache(symbol, prices) {
    if (prices.length === 0) return;
    
    const values = prices.map(p => 
        `('${symbol}', '${p.date}', ${p.open}, ${p.high}, ${p.low}, ${p.close}, ${p.volume})`
    ).join(',');
    
    await query(`
        INSERT INTO price_cache (symbol, date, open, high, low, close, volume)
        VALUES ${values}
        ON CONFLICT (symbol, date) 
        DO UPDATE SET 
        close = EXCLUDED.close,
        open = EXCLUDED.open,
        high = EXCLUDED.high,
        low = EXCLUDED.low,
        volume = EXCLUDED.volume,
        cached_at = NOW()
    `);
    
    console.log(`✓ Cached ${prices.length} prices for ${symbol}`);
}

function getMissingTradingDays(startDate,endDate, cachedDates){
    const missing = []
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current<=end){
        const dayOfWeek = current.getDay();
        const dateString = current.toISOString().split('T')[0];

        if (dayOfWeek!=0 && dayOfWeek !=6){
            if(!cachedDates.has(dateString)){
                missing.push(dateString);
            }
        }
        current.setDate(current.getDate() + 1);
    }
    return missing;
}
