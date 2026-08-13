import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

function register(id: string): Promise<Response> {
  const request = new NextRequest(
    `http://localhost/api/matches/${encodeURIComponent(id)}/register`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Camille' }),
    },
  );
  return POST(request, { params: Promise.resolve({ id }) });
}

describe('public registration proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards the registration to the match endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ reference: 'AMT-ABC234' }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await register('seed-match-level-ii');

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3001/matches/seed-match-level-ii/registrations',
    );
  });

  it.each([
    ['traversal', '../auth/login'],
    ['injected query', 'x?path='],
    ['injected fragment', 'x#'],
    ['smuggled separator', 'matches/admin'],
  ])('rejects %s without calling the API', async (_label, id) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await register(id);

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
