import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { ReturnTypeOfOpenDatabase } from './types.js';

// Resolves correctly from both src/ (tsx) and dist/ (compiled JS).
const migrationsFolder = fileURLToPath(new URL('../drizzle/', import.meta.url));

/** Migration history is tracked by Drizzle in drizzle.__drizzle_migrations. */
export async function migrateDatabase({ db }: ReturnTypeOfOpenDatabase) {
  await migrate(db, { migrationsFolder });
}
