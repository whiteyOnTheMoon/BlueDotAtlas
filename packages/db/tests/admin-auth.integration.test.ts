import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eq } from 'drizzle-orm';
import {
  ADMIN_SESSION_SECONDS,
  adminLoginState,
  adminSessions,
  generatePasswordHash,
  hasAdminSession,
  loginAdmin,
  migrateDatabase,
  openDatabase,
  revokeAdminSession,
  verifyPassword,
} from '../src/index.js';

if (process.env.BDA_DB_TEST !== '1') throw new Error('DB auth tests require BDA_DB_TEST=1');
const url = process.env.DATABASE_URL;
if (
  !url ||
  !['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
  new URL(url).pathname !== '/bda_test'
) {
  throw new Error('Refusing to run auth tests outside localhost/bda_test');
}

test('scrypt hashes never expose passwords; sessions have TTL, revocation and durable lockout', async () => {
  const password = 'Synthetic-test-password-025!';
  const encoded = await generatePasswordHash(password);
  assert.match(encoded, /^scrypt\$16384\$8\$1\$/);
  assert.ok(!encoded.includes(password));
  assert.equal(await verifyPassword(password, encoded), true);
  assert.equal(await verifyPassword('Synthetic-test-password-WRONG', encoded), false);
  assert.equal(await verifyPassword(password, 'not-a-hash'), false);
  await assert.rejects(generatePasswordHash('weak'), /between 12 and 256/);

  process.env.BDA_ADMIN_EMAIL = 'admin-ci@bluedotatlas.invalid';
  process.env.BDA_ADMIN_PASSWORD_HASH = encoded;
  const db = openDatabase(url);
  try {
    await migrateDatabase(db); // Test order independent: create 0000–0002 before auth state.
    await db.db.insert(adminLoginState).values({ key: 'single_admin' }).onConflictDoNothing();
    await db.db
      .update(adminLoginState)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(adminLoginState.key, 'single_admin'));

    assert.equal(await loginAdmin('other-ci@bluedotatlas.invalid', password), null);
    for (let i = 0; i < 4; i++) {
      assert.equal(
        await loginAdmin('admin-ci@bluedotatlas.invalid', 'wrong-password-for-test'),
        null,
      );
    }
    const [locked] = await db.db
      .select()
      .from(adminLoginState)
      .where(eq(adminLoginState.key, 'single_admin'));
    assert.equal(locked?.failedAttempts, 5);
    assert.ok(locked?.lockedUntil instanceof Date);
    assert.equal(
      await loginAdmin('admin-ci@bluedotatlas.invalid', password),
      null,
      'valid credential blocked during lockout',
    );
    await db.db
      .update(adminLoginState)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(adminLoginState.key, 'single_admin'));

    const first = await loginAdmin('ADMIN-CI@BLUEDOTATLAS.INVALID', password);
    assert.ok(first?.token);
    assert.match(first.token, /^[a-zA-Z0-9_-]{43}$/);
    assert.ok(first.expiresAt.getTime() > Date.now() + (ADMIN_SESSION_SECONDS - 30) * 1000);
    assert.equal(await hasAdminSession('fabricated-token'), false);
    assert.equal(await hasAdminSession(first.token), true);

    const records = await db.db.select().from(adminSessions);
    const active = records.find((x) => x.tokenHash !== null && x.revokedAt === null);
    assert.ok(active);
    assert.notEqual(active.tokenHash, first.token, 'DB must never contain the bearer token');

    await revokeAdminSession(first.token);
    assert.equal(await hasAdminSession(first.token), false, 'logout must revoke immediately');

    const second = await loginAdmin('admin-ci@bluedotatlas.invalid', password);
    assert.ok(second);
    assert.equal(await hasAdminSession(second.token), true, 'a new DB pool can validate session');
    const secondHash = createHash('sha256').update(second.token).digest('hex');
    const record = (await db.db.select().from(adminSessions)).find(
      (x) => x.tokenHash === secondHash,
    );
    assert.ok(record);
    await db.db
      .update(adminSessions)
      .set({
        createdAt: new Date(Date.now() - 3600 * 1000),
        expiresAt: new Date(Date.now() - 1000),
      })
      .where(eq(adminSessions.id, record.id));
    assert.equal(
      await hasAdminSession(second.token),
      false,
      'expired session is rejected at DB lookup',
    );
  } finally {
    await db.pool.end();
    delete process.env.BDA_ADMIN_PASSWORD_HASH;
    delete process.env.BDA_ADMIN_EMAIL;
  }
});
