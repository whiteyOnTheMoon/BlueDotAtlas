import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { appMetadata } from './schema.js';

export function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) {
    throw new Error('DATABASE_URL is required for server-side database access');
  }
  return url;
}

/** Caller must always end the pool. Never expose this package to a client bundle. */
export function openDatabase(connectionString = databaseUrl()) {
  const pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 5000 });
  const db = drizzle({ client: pool, schema: { appMetadata } });
  return { pool, db };
}
