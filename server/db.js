import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
});
console.log("Connected to", process.env.PG_DB);

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
