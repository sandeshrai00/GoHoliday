"use client";

// ponytail: one helper, not repeated token-plumbing in every admin page.
export async function adminFetch(
  getToken: () => Promise<string | null>,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getToken().catch(() => null);
  return fetch(`/api/admin${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}
