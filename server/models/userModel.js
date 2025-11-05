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
  if (res.rows.length > 0) return res.rows[0];

  res = await query(
    `INSERT INTO users (google_id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     RETURNING id, google_id, email, name, picture`,
    [profile.id, profile.email, profile.name, profile.picture]
  );
  return res.rows[0];
}
