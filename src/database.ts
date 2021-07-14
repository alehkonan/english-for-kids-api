import { Pool } from 'pg';
import { pgUri } from './config';

export const pool = new Pool({
  connectionString: pgUri,
  ssl: { rejectUnauthorized: false },
});
