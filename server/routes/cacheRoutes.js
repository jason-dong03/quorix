import express from "express";
import jwt from "jsonwebtoken";
import {
    getHistoricalPrices
} from "../models/cacheModel.js";

import {fetchUserHoldings} from "../models/marketDataModel.js";
const router = express.Router();

router.get('/api/portfolio-history', async (req, res) =>{
    const token = req.cookies.session;
    if (!token) 
        return res.status(404).json({ user: null });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.uid;
        const {timeframe = '1D'} = req.query;
        
        const holdings = await fetchUserHoldings(userID);
        //console.log("Holding recieved: ", holdings);
        if (!holdings || holdings.length === 0) {
            return res.status(404).json({ holdings: [] });
        }
         let numDays;
        switch(timeframe) {
            case '1D':
                numDays = 1;
                break;
            case '5D':
                numDays = 5;
                break;      
            default:
                numDays = 30;
        }
        
        let apiTimeframe;
        if (numDays <= 1) {
            apiTimeframe = '5Min';
        } else if (numDays <= 5) {
            apiTimeframe = '1Hour';
        } else {
            apiTimeframe = '1Day';
        }
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 0;
        const endDate = new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const calendarDaysToGoBack = Math.ceil(numDays * 1.4) + daysToSubtract;
        const startDate = new Date(Date.now() - calendarDaysToGoBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        //console.log(`📅 Timeframe: ${timeframe}, Days: ${numDays}, API Timeframe: ${apiTimeframe}, Range: ${startDate} to ${endDate}`);
        
        const priceHistories = await Promise.all(
            holdings.map(async (h) =>{
                console.log(`Fetching prices for ${h.symbol}...`);
                const prices = await getHistoricalPrices(h.symbol, startDate,endDate, apiTimeframe);
                return {symbol: h.symbol, shares: h.shares, prices: prices};
            })
        );
        const portfolioHistory = calculatePortfolioValues(priceHistories);
      
        return res.json({ history: portfolioHistory });
    
    } catch (err) {
      console.error('❌ Portfolio history error:');
      console.error('Message:', err);
      return res.status(500).json({ error: "Failed to fetch portfolio history" });
    }
});
function calculatePortfolioValues(priceHistories) {
    const validHistories = priceHistories.filter(stock => stock.prices && stock.prices.length > 0);
    
    if (validHistories.length === 0) {
        console.warn('No valid price histories available');
        return [];
    }

    // Collect all unique timestamps/dates
    const allTimestamps = new Set();
    validHistories.forEach(stock => {
        stock.prices.forEach(price => {
            // For intraday data, we need the full timestamp, not just date
            // Alpaca returns timestamp in 't' field or date string
            const timestamp = price.t || price.date;
            allTimestamps.add(timestamp);
        });
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    return sortedTimestamps.map(timestamp => {
        let totalValue = 0;
        
        validHistories.forEach(stock => {
            const priceAtTime = stock.prices.find(p => {
                const priceTimestamp = p.t || p.date;
                return priceTimestamp === timestamp;
            });
            
            if (priceAtTime) {
                const shares = parseFloat(stock.shares) || 0;
                const close = parseFloat(priceAtTime.close) || 0;
                totalValue += shares * close;
            }
        });
        
        // Format timestamp for display
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: sortedTimestamps.length > 50 ? 'numeric' : undefined, // Show time for intraday
            minute: sortedTimestamps.length > 50 ? '2-digit' : undefined
        });
        
        return {
            date: dateStr,
            value: Math.round(totalValue * 100) / 100
        };
    });
}



export default router;