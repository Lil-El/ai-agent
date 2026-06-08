import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.PG_URL,
});

async function query(text, params) {
  return pool.query(text, params);
}

export { pool, query };
