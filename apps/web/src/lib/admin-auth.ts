import { cookies } from 'next/headers';
import { hasAdminSession } from '@bluedotatlas/db/auth';
import type { NextRequest } from 'next/server';

/** Production requires HTTPS to receive __Host- cookie; no insecure fallback. */
export function adminCookieName() {
  return process.env.NODE_ENV === 'production' ? '__Host-bda-session' : 'bda-session-dev';
}

/** Server-side DB validation; no cookie alone grants access. */
export async function signedInAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value;
  try {
    return await hasAdminSession(token);
  } catch {
    return false; // Fail closed if DB is absent or unreachable.
  }
}

/** Never trust forwarding headers or unverified cross-origin form submissions. */
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    const source = new URL(origin);
    if (source.origin !== origin || source.host.toLowerCase() !== host.toLowerCase()) return false;
    if (source.protocol === 'https:') return true;
    // Production HTTP is permitted only for isolated loopback integration checks.
    return (
      source.protocol === 'http:' &&
      (process.env.NODE_ENV !== 'production' ||
        source.hostname === '127.0.0.1' ||
        source.hostname === 'localhost')
    );
  } catch {
    return false;
  }
}
