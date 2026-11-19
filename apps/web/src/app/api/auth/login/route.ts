import { NextResponse, type NextRequest } from 'next/server';
import { loginAdmin, ADMIN_SESSION_SECONDS } from '@bluedotatlas/db/auth';
import { adminCookieName, sameOrigin } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (
    !request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded') &&
    !request.headers.get('content-type')?.startsWith('multipart/form-data')
  ) {
    return NextResponse.json({ error: 'unsupported_media_type' }, { status: 415 });
  }

  let email: FormDataEntryValue | null;
  let password: FormDataEntryValue | null;
  try {
    const form = await request.formData();
    email = form.get('email');
    password = form.get('password');
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.length > 254 ||
    password.length > 256
  ) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  let authenticated: Awaited<ReturnType<typeof loginAdmin>>;
  try {
    authenticated = await loginAdmin(email, password);
  } catch {
    return NextResponse.json(
      { error: 'authentication_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!authenticated) {
    const denied = NextResponse.redirect(new URL('/admin/login?error=invalid', request.url), 303);
    denied.headers.set('Cache-Control', 'no-store');
    return denied;
  }
  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.cookies.set(adminCookieName(), authenticated.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
