import express from "express";


import {getNewsFromCache, addNewsToCache, getNewsFromClaude} from '../models/newsCacheModel.js';

const router = express.Router();

router.get("/api/ai-news", async (req, res)=>{
    const token = req.cookies.session;
    if (!token) 
        return res.status(401).json({ user: null });
    try {
        const { symbols } = req.query; // "AAPL,NVDA"
        const symbolArray = symbols.split(',');
        //check first if its in cache, if not fetch a batch from API 
        //API fetches : a batch of 6 
        console.log(symbolArray);
        const allNews = [];
        const fetchNewsFromClaudeList = [] ;
        for(const s of symbolArray){
            console.log(`Fetching news for ${s}...`);
            const news = await getNewsFromCache(s);
            if(news.length > 0){//cache hit
                console.log(`news cache hit for ${s}!`);
                allNews.push(...news);
            }else{
                console.log(`news cache missed for ${s}, adding ${s} to list that fetches from claude...`);
                //fetch from claude, then add to news
                fetchNewsFromClaudeList.push(s);
            }
        }
        if(fetchNewsFromClaudeList.length>0){
            const freshNews = await getNewsFromClaude(fetchNewsFromClaudeList);

            for (const n of freshNews) {   
                await addNewsToCache(n);
            }
                    
            allNews.push(...freshNews);
            console.log("successully fetched from claude ai!");
        }
        const topNews = allNews.sort((a, b) => b.relevance - a.relevance).slice(0, 6);
        return res.json({ news: topNews });
    } catch {
        return res.status(500).json({ error: "Fetching data failed!" });
    }
});

export default router;