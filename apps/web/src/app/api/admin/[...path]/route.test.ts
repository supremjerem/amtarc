import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

function proxy(path: string[], cookie = 'amtarc_admin_token=jwt'): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/admin/${path.join('/')}`, {
    headers: cookie ? { cookie } : {},
  });
  return GET(request, { params: Promise.resolve({ path }) });
}

describe('admin proxy path handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards an allowlisted path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal('fetch', fetchMock);

    const response = await proxy(['news', 'admin']);

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/news/admin');
  });

  it.each([
    ['traversal', ['matches', '..', 'registrations']],
    ['injected query', ['matches', 'admin?', 'registrations']],
    ['injected fragment', ['matches', 'admin#x', 'registrations']],
    ['smuggled separator', ['matches', 'admin/secret', 'registrations']],
  ])('rejects %s without calling the API', async (_label, path) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await proxy(path);

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a path that is not on the allowlist', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect((await proxy(['auth', 'login'])).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires the session cookie', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await proxy(['news', 'admin'], '');

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
