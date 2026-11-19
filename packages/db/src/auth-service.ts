import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { openDatabase } from './client.js';
import { adminLoginState, adminSessions } from './schema.js';
import { verifyPassword } from './password.js';

export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const SINGLE_ADMIN_KEY = 'single_admin';

export class AdminAuthUnavailable extends Error {
  constructor() {
    super('Admin authentication is not configured');
    this.name = 'AdminAuthUnavailable';
  }
}

function configuredAdmin() {
  const email = process.env.BDA_ADMIN_EMAIL;
  const hash = process.env.BDA_ADMIN_PASSWORD_HASH;
  if (!email || !hash || !/^scrypt\$16384\$8\$1\$[\da-f]{32}\$[\da-f]{128}$/i.test(hash)) {
    throw new AdminAuthUnavailable();
  }
  return { email: email.trim().toLowerCase(), hash };
}
function digest(value: string) {
  return createHash('sha256').update(value).digest();
}
function tokenHash(token: string) {
  return digest(token).toString('hex');
}
function sameEmail(left: string, right: string) {
  return timingSafeEqual(digest(left.trim().toLowerCase()), digest(right));
}

/** Login has a persistent, cross-process failure counter and locked window.
 * Bad email and bad password share the same response, without account enumeration.
 */
export async function loginAdmin(email: string, password: string) {
  const admin = configuredAdmin();
  const connection = openDatabase();

  try {
    return await connection.db.transaction(async (tx) => {
      await tx.insert(adminLoginState).values({ key: SINGLE_ADMIN_KEY }).onConflictDoNothing();
      const [state] = await tx
        .select()
        .from(adminLoginState)
        .where(eq(adminLoginState.key, SINGLE_ADMIN_KEY))
        .for('update');
      if (!state) throw new AdminAuthUnavailable();

      const now = new Date();
      if (state.lockedUntil && state.lockedUntil > now) return null;
      // Serialize expensive scrypt verification under the account row lock.
      // Locked accounts do not keep consuming CPU on every bad request.
      const passwordMatches = await verifyPassword(password, admin.hash);
      const valid = sameEmail(email, admin.email) && passwordMatches;
      if (!valid) {
        const failures = state.lockedUntil ? 1 : state.failedAttempts + 1;
        await tx
          .update(adminLoginState)
          .set({
            failedAttempts: failures,
            lockedUntil:
              failures >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000) : null,
            updatedAt: now,
          })
          .where(eq(adminLoginState.key, SINGLE_ADMIN_KEY));
        return null;
      }

      await tx
        .update(adminLoginState)
        .set({ failedAttempts: 0, lockedUntil: null, updatedAt: now })
        .where(eq(adminLoginState.key, SINGLE_ADMIN_KEY));
      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(now.getTime() + ADMIN_SESSION_SECONDS * 1000);
      await tx.insert(adminSessions).values({ tokenHash: tokenHash(token), expiresAt });
      return { token, expiresAt };
    });
  } finally {
    await connection.pool.end();
  }
}

/** Every protected page/API checks a nonrevoked, unexpired database session. */
export async function hasAdminSession(token: string | undefined): Promise<boolean> {
  if (!token || !/^[a-zA-Z0-9_-]{43}$/.test(token)) return false;
  const connection = openDatabase();
  try {
    const [row] = await connection.db
      .select({ id: adminSessions.id })
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.tokenHash, tokenHash(token)),
          isNull(adminSessions.revokedAt),
          gt(adminSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return !!row;
  } finally {
    await connection.pool.end();
  }
}

/** Revocation prevents reuse even if the browser retains a cookie. */
export async function revokeAdminSession(token: string | undefined): Promise<void> {
  if (!token || !/^[a-zA-Z0-9_-]{43}$/.test(token)) return;
  const connection = openDatabase();
  try {
    await connection.db
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(adminSessions.tokenHash, tokenHash(token)), isNull(adminSessions.revokedAt)));
  } finally {
    await connection.pool.end();
  }
}
