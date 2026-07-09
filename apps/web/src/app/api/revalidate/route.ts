import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const secret = body?.secret;
  const tag = body?.tag;

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }
  if (typeof tag !== 'string') {
    return NextResponse.json({ message: 'Missing tag' }, { status: 400 });
  }

  // "max" invalidates the tag regardless of the cache profile it was stored under.
  revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: true, tag });
}
