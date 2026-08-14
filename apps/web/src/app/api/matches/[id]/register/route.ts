import { NextRequest, NextResponse } from 'next/server';
import { isSafeApiSegment } from '@/lib/api-path';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Public proxy: the browser never talks to the API origin directly.
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // The match id is interpolated into the API URL, so it gets the same segment
  // check as the admin proxy: a decoded `..` or `?` would otherwise let a
  // caller point this request at a different API endpoint.
  if (!isSafeApiSegment(id)) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const upstream = await fetch(`${API_URL}/matches/${id}/registrations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await request.text(),
    cache: 'no-store',
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
