import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) throw new Error('DATABASE_URL is required for server-side database access');
  return url;
}

/** Server-only DB pool; callers must always close it. Max two connections per process. */
export function openDatabase(connectionString = databaseUrl()) {
  const pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 5000 });
  const db = drizzle({ client: pool, schema });
  return { pool, db };
}
