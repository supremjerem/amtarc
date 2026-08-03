import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Compare digests so lengths always match and the comparison is constant-time.
function secretsMatch(provided: string, expected: string): boolean {
  const providedDigest = createHash('sha256').update(provided).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const secret = body?.secret;
  const tag = body?.tag;

  const expected = process.env.REVALIDATE_SECRET;
  if (typeof secret !== 'string' || !expected || !secretsMatch(secret, expected)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }
  if (typeof tag !== 'string') {
    return NextResponse.json({ message: 'Missing tag' }, { status: 400 });
  }

  // "max" invalidates the tag regardless of the cache profile it was stored under.
  revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: true, tag });
}
