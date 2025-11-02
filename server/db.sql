DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS market_data_updates CASCADE;
DROP TABLE IF EXISTS tickers CASCADE;

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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
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

CREATE TABLE IF NOT EXISTS prices (
  symbol TEXT NOT NULL REFERENCES tickers(symbol) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL,
  close NUMERIC(18,4) NOT NULL,
  PRIMARY KEY (symbol, ts)
);

CREATE INDEX IF NOT EXISTS idx_prices_symbol_ts
  ON prices(symbol, ts DESC);

CREATE TABLE IF NOT EXISTS market_data_updates (
  symbol TEXT PRIMARY KEY REFERENCES tickers(symbol) ON DELETE CASCADE,
  last_price NUMERIC(18,4) NOT NULL,
  last_change_pct NUMERIC(6,3),         -- +3.05 etc
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source TEXT
);
ALTER TABLE users OWNER TO ppf3jn;
ALTER TABLE holdings OWNER TO ppf3jn;
ALTER TABLE watchlist OWNER TO ppf3jn;
ALTER TABLE tickers OWNER TO ppf3jn;
ALTER TABLE prices OWNER TO ppf3jn;
ALTER TABLE market_data_updates OWNER TO ppf3jn;
