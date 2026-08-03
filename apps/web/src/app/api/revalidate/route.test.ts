import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

import { revalidateTag } from 'next/cache';

function post(body: unknown): Promise<Response> {
  const request = new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(request as NextRequest);
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('REVALIDATE_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects a wrong secret with 401', async () => {
    const response = await post({ secret: 'wrong', tag: 'news' });

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects a missing secret with 401', async () => {
    const response = await post({ tag: 'news' });

    expect(response.status).toBe(401);
  });

  it('rejects a missing tag with 400', async () => {
    const response = await post({ secret: 'test-secret' });

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('revalidates the tag for a valid secret', async () => {
    const response = await post({ secret: 'test-secret', tag: 'news' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ revalidated: true, tag: 'news' });
    expect(revalidateTag).toHaveBeenCalledWith('news', 'max');
  });
});
