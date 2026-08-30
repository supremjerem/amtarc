export const ADMIN_TOKEN_COOKIE = 'amtarc_admin_token';

// Admin requests go through the same-origin BFF proxy (/api/admin/*), which holds
// the JWT in an httpOnly cookie and forwards it to the API server-side.
// See docs/adr/0001-admin-auth-httponly-cookie-bff.md.
export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  // FormData sets its own multipart content-type (with boundary).
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(`/api/admin${path}`, { ...options, cache: 'no-store', headers });
  if (response.status === 401 && typeof window !== 'undefined') {
    // A hard navigation is deliberate here, so router.push() is not what we
    // want: the session is gone, and a full reload is what guarantees no stale
    // authenticated data survives in the client cache. This helper is also a
    // plain function called from several components, so it has no router.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/admin/login');
  }
  return response;
}

export async function login(email: string, password: string): Promise<Response> {
  return fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
}

export async function logout(): Promise<void> {
  await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' });
}
