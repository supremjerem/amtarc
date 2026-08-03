import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Only these admin endpoints may be proxied; anything else is a 404.
const ALLOWED_ROUTES: Record<string, RegExp[]> = {
  GET: [/^news\/admin$/, /^news\/admin\/[^/]+$/, /^content$/],
  POST: [/^news$/, /^uploads$/],
  PUT: [/^content\/[a-z-]+$/],
  PATCH: [/^news\/[^/]+$/],
  DELETE: [/^news\/[^/]+$/],
};

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const apiPath = (await context.params).path.join('/');
  const allowed = ALLOWED_ROUTES[request.method]?.some((pattern) => pattern.test(apiPath));
  if (!allowed) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const headers = new Headers({ authorization: `Bearer ${token}` });
  const hasBody = request.method !== 'GET' && request.method !== 'DELETE';
  // Forward bytes untouched (JSON and multipart alike); the original
  // content-type header carries the multipart boundary.
  const body = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;
  const contentType = request.headers.get('content-type');
  if (hasBody && contentType) headers.set('content-type', contentType);

  const upstream = await fetch(`${API_URL}/${apiPath}`, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
