import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from './route';

function post(body: unknown): Promise<Response> {
  const request = new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(request as NextRequest);
}

describe('POST /api/admin/login', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects malformed payloads with 400 without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await post({ email: 'admin@amtarc.test' });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 401 without a cookie when the API rejects the credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const response = await post({ email: 'admin@amtarc.test', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('sets an httpOnly session cookie on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          accessToken: 'signed-jwt',
          admin: { id: 'admin-1', email: 'admin@amtarc.test', name: 'Admin' },
        }),
      ),
    );

    const response = await post({ email: 'admin@amtarc.test', password: 'correct' });
    const cookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);
    expect(cookie).toContain('amtarc_admin_token=signed-jwt');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=lax');
    expect(cookie).not.toContain('Max-Age');
    await expect(response.json()).resolves.toEqual({
      admin: { id: 'admin-1', email: 'admin@amtarc.test', name: 'Admin' },
    });
  });
});
