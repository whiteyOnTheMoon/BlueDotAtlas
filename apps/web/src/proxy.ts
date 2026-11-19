import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-bda-session' : 'bda-session-dev';

/** Fast anonymous rejection only. The protected layout and each API verify DB sessions. */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/admin/login') return NextResponse.next();

  if (!request.cookies.get(COOKIE)?.value) {
    if (path.startsWith('/api/admin/')) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
