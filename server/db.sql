DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS market_data_updates CASCADE;
DROP TABLE IF EXISTS tickers CASCADE;
DROP TABLE IF EXISTS price_cache CASCADE;
DROP TABLE IF EXISTS news_cache CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE tickers(
    symbol TEXT UNIQUE NOT NULL,
    sector TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES tickers(symbol) ON DELETE CASCADE,
  shares NUMERIC(18,6) NOT NULL,
  bought_at NUMERIC(18, 4) NOT NULL,
  avg_cost NUMERIC(18,4) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);

CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES tickers(symbol) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);


CREATE TABLE IF NOT EXISTS market_data_updates (
  symbol TEXT PRIMARY KEY REFERENCES tickers(symbol) ON DELETE CASCADE,
  last_price NUMERIC(18,4) NOT NULL,
  last_change_pct NUMERIC(6,3),         -- +3.05 etc
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source TEXT
);
CREATE TABLE IF NOT EXISTS price_cache (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  open NUMERIC(10,2),
  high NUMERIC(10,2),
  low NUMERIC(10,2),
  close NUMERIC(10,2),
  volume BIGINT,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, date)
);
CREATE INDEX idx_price_cache_symbol_date ON price_cache(symbol, date DESC);

CREATE TABLE IF NOT EXISTS news_cache (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL, 
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT,
  source_url TEXT NOT NULL,
  relevance REAL NOT NULL,
  impact NUMERIC NOT NULL, --0 neg, 1 pos
  news_date TIMESTAMPTZ NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);


ALTER TABLE users OWNER TO ppf3jn;
ALTER TABLE holdings OWNER TO ppf3jn;
ALTER TABLE watchlist OWNER TO ppf3jn;
ALTER TABLE tickers OWNER TO ppf3jn;
ALTER TABLE market_data_updates OWNER TO ppf3jn;
ALTER TABLE price_cache OWNER TO ppf3jn;
ALTER TABLE news_cache OWNER TO ppf3jn;