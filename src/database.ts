import { Pool } from 'pg';

const { PG_URI } = process.env;

export const pool = new Pool({
  connectionString: PG_URI,
  ssl: { rejectUnauthorized: false },
});
