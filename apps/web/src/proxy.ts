import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth';

// UX-level gating only: authorization is enforced by the API on every proxied
// request. See docs/adr/0001-admin-auth-httponly-cookie-bff.md.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const hasToken = request.cookies.has(ADMIN_TOKEN_COOKIE);

  if (!hasToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/news', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
