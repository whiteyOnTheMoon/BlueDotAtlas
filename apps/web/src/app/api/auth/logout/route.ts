import { NextResponse, type NextRequest } from 'next/server';
import { revokeAdminSession } from '@bluedotatlas/db/auth';
import { adminCookieName, sameOrigin } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const cookie = adminCookieName();
  const token = request.cookies.get(cookie)?.value;
  try {
    await revokeAdminSession(token);
  } catch {
    // Server check remains fail-closed. Do not falsely claim DB revocation.
    return NextResponse.json({ error: 'logout_unavailable' }, { status: 503 });
  }
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.set(cookie, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
