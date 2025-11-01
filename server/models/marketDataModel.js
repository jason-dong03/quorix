import { query } from "../db.js";

export async function getAllSymbols() {
  const res = await query("SELECT symbol FROM tickers");
  return res.rows.map((r) => r.symbol);
}
export async function upsertQuotes(quotes) {
  if (!quotes.length) return;

  const values = [];
  const params = [];
  let i = 1;

  for (const q of quotes) {
    values.push(`($${i}, $${i + 1}, $${i + 2}, NOW())`);
    params.push(q.symbol, q.last_price, q.last_change_pct);
    i += 3;
  }

  const sql = `
    INSERT INTO market_data_updates
      (symbol, last_price, last_change_pct, last_updated)
    VALUES ${values.join(", ")}
    ON CONFLICT (symbol)
    DO UPDATE SET
      last_price = EXCLUDED.last_price,
      last_change_pct = EXCLUDED.last_change_pct,
      last_updated = EXCLUDED.last_updated;
  `;

  await query(sql, params);
}

export async function fetchLatestMarketData() {
  const sql = `SELECT 
  t.name,
  m.symbol,
  m.last_price,
  m.last_change_pct,
  m.last_updated
  FROM market_data_updates AS m
  JOIN tickers AS t
  ON m.symbol = t.symbol;`;
  const res = await query(sql);
  return res.rows;
}
export async function fetchUserWatchlist(userId) {
  const sql = `
    SELECT 
      t.name,
      t.symbol,
      m.last_price,
      m.last_change_pct,
      m.last_updated
    FROM watchlist w
    JOIN tickers t ON w.symbol = t.symbol
    LEFT JOIN market_data_updates m ON m.symbol = t.symbol
    WHERE w.user_id = $1;
  `;
  const res = await query(sql, [userId]);
  return res.rows;
}
export async function fetchUserHoldings(userId) {
  const sql = `
    SELECT 
      t.name,
      t.symbol,
      m.last_price,
      m.last_change_pct,
      m.last_updated,
      h.shares,
      h.avg_cost,
      h.updated_at,
      h.bought_at
    FROM holdings h
    JOIN tickers t
      ON h.symbol = t.symbol
    LEFT JOIN market_data_updates m
      ON m.symbol = t.symbol
    WHERE h.user_id = $1;
  `;
  const res = await query(sql, [userId]);
  return res.rows;
}

export async function updateUserHoldings(
  userID,
  symbol,
  bought_at,
  shares,
  avg_cost
) {
  await query(
    `INSERT INTO holdings (user_id, symbol, bought_at, shares, avg_cost)
   VALUES ($1, $2, $3, $4, $5);`,
    [userID, symbol, bought_at, shares, avg_cost]
  );
}

export async function updateUserWatchlist(userID, symbol) {
  await query(
    `INSERT INTO watchlist (user_id, symbol)
   VALUES ($1, $2);`,
    [userID, symbol]
  );
}
