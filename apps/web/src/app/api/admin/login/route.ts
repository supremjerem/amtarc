import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email !== 'string' || typeof body?.password !== 'string') {
    return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: 'no-store',
  });
  if (!upstream.ok) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const { accessToken, admin } = await upstream.json();
  const response = NextResponse.json({ admin });
  // Session cookie: the API rejects expired JWTs, and adminFetch redirects to
  // the login page on 401, so no client-side expiry tracking is needed.
  response.cookies.set(ADMIN_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return response;
}
