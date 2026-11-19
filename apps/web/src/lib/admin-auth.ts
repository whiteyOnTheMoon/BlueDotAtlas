import { cookies } from 'next/headers';
import { hasAdminSession } from '@bluedotatlas/db';
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
  return !!origin && origin === request.nextUrl.origin;
}
