import assert from 'node:assert/strict';
import { test } from 'node:test';
import { and, eq, isNull } from 'drizzle-orm';
import { appMetadata, migrateDatabase, openDatabase, seedDatabase } from '../src/index.js';

// Live or shared databases must NEVER be used for integration tests.
if (process.env.BDA_DB_TEST !== '1') {
  throw new Error('Refusing database tests: BDA_DB_TEST=1 is mandatory');
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const dbUrl = new URL(connectionString);
if (!['localhost', '127.0.0.1'].includes(dbUrl.hostname) || dbUrl.pathname !== '/bda_test') {
  throw new Error('Refusing to run outside localhost/bda_test');
}

test('migrations run on fresh PostgreSQL and rerun safely; seed and soft delete are durable', async () => {
  const connection = openDatabase(connectionString);
  try {
    // Fresh PostgreSQL instance supplied by GitHub Actions service.
    await migrateDatabase(connection);
    const first = await connection.pool.query(
      'select count(*)::integer as count from drizzle.__drizzle_migrations',
    );
    assert.equal(first.rows[0].count, 4, 'baseline, domain, auth and lease-queue migration journal entries');
    await migrateDatabase(connection);
    const second = await connection.pool.query(
      'select count(*)::integer as count from drizzle.__drizzle_migrations',
    );
    assert.equal(second.rows[0].count, 4, 'all four migrations are idempotent');

    await seedDatabase(connection);
    await seedDatabase(connection);
    const active = await connection.db
      .select()
      .from(appMetadata)
      .where(and(eq(appMetadata.key, 'application'), isNull(appMetadata.deletedAt)));
    assert.equal(active.length, 1, 'seed must not create duplicates');
    assert.equal(active[0]?.value, 'BlueDotAtlas');
    assert.match(String(active[0]?.id), /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i);
    assert.ok(active[0]?.createdAt instanceof Date);
    assert.ok(active[0]?.updatedAt instanceof Date);

    // Soft-delete contract: row remains present, active queries exclude it.
    await connection.db
      .update(appMetadata)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(appMetadata.key, 'application'));
    const stillPresent = await connection.db
      .select()
      .from(appMetadata)
      .where(eq(appMetadata.key, 'application'));
    const visible = await connection.db
      .select()
      .from(appMetadata)
      .where(and(eq(appMetadata.key, 'application'), isNull(appMetadata.deletedAt)));
    assert.equal(stillPresent.length, 1, 'soft delete must retain audit history');
    assert.ok(stillPresent[0]?.deletedAt instanceof Date);
    assert.equal(visible.length, 0, 'soft deleted rows are not active');
  } finally {
    await connection.pool.end();
  }
});
