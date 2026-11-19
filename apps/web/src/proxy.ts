import { NextResponse, type NextRequest } from 'next/server';

// Fail closed until a validated session exists in Roadmap 025.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = { matcher: ['/admin/:path*'] };
