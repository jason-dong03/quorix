import { query } from "../db.js";
import dotenv from "dotenv";
import Anthropic from '@anthropic-ai/sdk';


dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are a financial news relevancy analyzer. Find the top 6 REAL news articles for the user's stock holdings.

RELEVANCY SCORING:
relevance = (ticker_coverage) × (recency_decay) × (price_impact)

Where:
- ticker_coverage = (relevant mentions) / (total nouns in article)
- recency_decay = exp(−hours_old / 12)
- price_impact = 1 + (price_change_magnitude / 10)

Boost articles with: exact tickers (AAPL), company names (Apple Inc.), executives (Tim Cook), products (iPhone), and price movements ("rises 3%", "drops 7%", "beat estimates").

IMPACT:
- 0 = negative news (stock drop, bad earnings, lawsuit, investigation)
- 1 = positive news (stock rise, beat estimates, new product, partnership)

OUTPUT (JSON array only, no markdown):
[
  {
    "symbol": "AAPL",
    "title": "Article title here",
    "summary": "Concise 1-2 sentence summary",
    "source": "Reuters",
    "source_url": "https://reuters.com/article/...",
    "relevance": 0.85,
    "impact": 1,
    "news_date": "2025-11-05T14:30:00Z"
  }
]

CRITICAL RULES:
1. Return ONLY valid JSON array, no markdown code blocks
2. All source URLs must be real, verifiable, publicly accessible
3. news_date must be ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
4. Sort by relevance descending
5. Return exactly 6 articles `;

export async function addNewsToCache(news){
    const sql = `INSERT INTO news_cache (symbol, title, summary, source, source_url, relevance,impact, news_date, expires_at) VALUES ($1, $2, $3, $4,
    $5, $6, $7, $8, NOW() + INTERVAL '1 hour' )`;

    await query(sql, [news.symbol, news.title, news.summary, news.source, news.source_url, news.relevance, news.impact, news.news_date]);

    return true;
}

export async function getNewsFromCache(symbol){
    const sql = `SELECT symbol, title, summary, source, source_url, relevance, impact, news_date FROM news_cache WHERE symbol = $1 AND expires_at > NOW()
    ORDER BY relevance DESC LIMIT 6`;

    const res = await query(sql,[symbol]);
    return res.rows;
}
export async function getNewsFromClaude(symbols) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Find news for: ${symbols.join(', ')}`
        }
      ]
    });

    const responseText = message.content[0].text;
    
    const news = JSON.parse(responseText);
    
    return news;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}