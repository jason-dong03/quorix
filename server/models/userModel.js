import { query } from "../db.js";

export async function getUserById(id) {
  const res = await query(
    `SELECT id, email, name, picture
     FROM users
     WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function findOrCreateUserFromGoogle(profile) {

  let res = await query(
    `SELECT id, google_id, email, name, picture
     FROM users
     WHERE google_id = $1`,
    [profile.id]
  );
  if (res.rows.length > 0) return {user: res.rows[0], isNewUser: false};

  res = await query(
    `INSERT INTO users (google_id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     RETURNING id, google_id, email, name, picture`,
    [profile.id, profile.email, profile.name, profile.picture]
  );
  return {user: res.rows[0], isNewUser: true};
}

export async function completedOnboarding(uid){
  const sql = `SELECT COUNT(*) FROM portfolios WHERE user_id = $1`;
  
  const res = await query(sql, [uid]);

  return parseInt(res.rows[0].count) === 0;
}
export async function addPortfolio(uid,name, desc){
  const checkDefault = `SELECT id FROM portfolios WHERE user_id = $1 AND is_default = true LIMIT 1`;
  const checkRes = await query(checkDefault, [uid]);

  const hasDefault = checkRes.rows.length >0;
  const isDefault = !hasDefault;

  const sql = `INSERT INTO portfolios (user_id, name, description, is_default) VALUES ($1, $2, $3, $4)`;
  const res = await query(sql, [uid, name, desc, isDefault]);
  
  return res.rows[0];
}
export async function fetchUserPortfolios(uid){
  const sql = `SELECT * FROM portfolios WHERE user_id = $1`;
  const res = await query(sql, [uid]);
  return res.rows;
}
export async function updatePortfolio(uid, portfolio_id, name, description){
  const sql =`UPDATE portfolios SET name = $1, description = $2 WHERE id = $3 AND user_id = $4`;
  const res = await query(sql, [name, description, portfolio_id, uid]);

  return res.rows[0] ?? null;
}
export async function deletePortfolio(uid, portfolio_id){
  const res = await query(`DELETE FROM portfolios WHERE id = $1 AND user_id = $2`, [portfolio_id, uid]);

  return res.rowCount > 0;
}
export async function setUserDefaultPortfolio(uid, portfolioId) {
  try {
    await client.query( `UPDATE portfolios SET is_default = false WHERE uid = $1`,[uid]);
    // set this one as default
    const result = await query(
      `UPDATE portfolios
       SET is_default = true
       WHERE id = $1 AND uid = $2
       RETURNING id`,
      [portfolioId, uid]
    );
    return result.rowCount > 0;
  } catch (err) {
    throw err;
  } 
}
