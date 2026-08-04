import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Only these admin endpoints may be proxied; anything else is a 404.
const ALLOWED_ROUTES: Record<string, RegExp[]> = {
  GET: [
    /^news\/admin$/,
    /^news\/admin\/[^/]+$/,
    /^content$/,
    /^matches\/admin$/,
    /^matches\/admin\/[^/]+$/,
    /^matches\/[^/]+\/registrations$/,
    /^matches\/[^/]+\/squadding\/proposal$/,
    /^matches\/[^/]+\/registrations\/export$/,
  ],
  POST: [/^news$/, /^uploads$/, /^matches$/],
  PUT: [/^content\/[a-z-]+$/, /^matches\/[^/]+\/squads$/, /^matches\/[^/]+\/squadding$/],
  PATCH: [/^news\/[^/]+$/, /^matches\/[^/]+$/, /^registrations\/[^/]+\/(paid|cancel)$/],
  DELETE: [/^news\/[^/]+$/, /^matches\/[^/]+$/, /^content\/[a-z-]+$/],
};

type RouteContext = { params: Promise<{ path: string[] }> };

// Segments are matched after decoding, so reject anything that could change the
// path's meaning once fetch() normalizes it (traversal, an injected query or
// fragment, or a smuggled separator) before the allowlist is consulted.
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const segments = (await context.params).path;
  if (!segments.every((segment) => SAFE_SEGMENT.test(segment) && segment !== '..')) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const apiPath = segments.join('/');
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
  const responseHeaders = new Headers({
    'content-type': upstream.headers.get('content-type') ?? 'application/json',
  });
  // Carries the file name for downloads (CSV exports).
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders.set('content-disposition', disposition);

  // Forward raw bytes: decoding to text would strip the UTF-8 BOM that makes
  // CSV exports open correctly in Excel.
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
