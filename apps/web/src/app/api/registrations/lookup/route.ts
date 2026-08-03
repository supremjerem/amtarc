import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const upstream = await fetch(
    `${API_URL}/registrations/lookup?${request.nextUrl.searchParams.toString()}`,
    { cache: 'no-store' },
  );
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
