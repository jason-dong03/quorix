import express from "express";
import jwt from "jsonwebtoken";
import {
  fetchLatestMarketData,
  fetchUserWatchlist,
  fetchUserHoldings,
  addStockToUserHolding,
  addStockToUserWatchlist,
  deleteStockFromUserWatchlist,
  deleteStockFromUserHolding,
  getSentimentFromCache,
  addSentimentToCache
} from "../models/marketDataModel.js";
import {fetchSingleQuote} from "../processes/priceUpdater.js";
const router = express.Router();

router.get("/api/market_data", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ user: null });

  try {
    const data = await fetchLatestMarketData();
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ error: "Fetching data failed!" });
  }
});
router.get("/api/watchlist", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(404).json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const watchlist = await fetchUserWatchlist(decoded.uid);

    return res.json({ watchlist });
  } catch (err) {
    console.log("error: ", err);
    return res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});
router.get("/api/holdings", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(404).json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const holdings = await fetchUserHoldings(decoded.uid);
    
    return res.json({ holdings });
  } catch (err) {
    console.log("error: ", err);
    return res.status(500).json({ error: "Failed to fetch holdings" });
  }
});
router.get('/api/market-sentiment', async (req, res) => {
  const token = req.cookies.session;
  if (!token) 
      return res.status(401).json({ user: null });
  try {
    const indices = ['SPY', 'QQQ', 'DIA'];
    const sentiment = {};
    
    for (const symbol of indices) {
      //try fetching from cache first
      const cached = await getSentimentFromCache(symbol);
      if(cached ){
      //  console.log(`cached hit for ${symbol}`);
        sentiment[symbol]={
          symbol,
          last_change_pct: cached.last_change_pct,
          last_price: cached.last_price
        }
      }else{
        const quote = await fetchSingleQuote(symbol); //fetch from API
        if(quote){ //save to cache
          await addSentimentToCache(quote);
        //  console.log(`fetched ${symbol}, added to cache`);
        }
        sentiment[symbol] = {
          symbol,
          last_change_pct: quote.last_change_pct, 
          last_price: quote.last_price
        };
      }
    }
    
    res.json({
      sp500: sentiment.SPY,
      nasdaq: sentiment.QQQ,
      dow: sentiment.DIA,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch market sentiment:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

/* POST ROUTES */
router.post("/api/holdings", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { symbol, bought_at, shares, avg_cost } = req.body;

    await addStockToUserHolding(
      decoded.uid,
      symbol,
      bought_at,
      shares,
      avg_cost
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("add stock error:", err);
    return res.status(500).json({ error: "Failed to add stock" });
  }
});
router.post("/api/watchlist", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { symbol } = req.body;
    await addStockToUserWatchlist(decoded.uid, symbol);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("add stock error:", err);
    return res.status(500).json({ error: "Failed to add stock" });
  }
});
router.delete("/api/watchlist/:symbol", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { symbol } = req.params;
    await deleteStockFromUserWatchlist(decoded.uid, symbol);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete stock error:", err);
    return res.status(500).json({ error: "Failed to delete stock" });
  }
});

router.delete("/api/sell_holding", async(req,res)=>{
  const token = req.cookies.session;
  if(!token){
    return res.status(401).json({error: "Not authenticated"});
  }
  try{  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { s, sh, ba } = req.body;
    await deleteStockFromUserHolding(decoded.uid, s, sh, ba);
    return res.status(200).json({ success: true });

  }catch(err){
    console.error("delete stock error:", err);
    return res.status(500).json({ error: "Failed to delete stock" });
  }
});
export default router;
