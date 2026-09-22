"use client";

// ponytail: one helper, not repeated token-plumbing in every admin page.
export async function adminFetch(
  getToken: () => Promise<string | null>,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getToken().catch(() => null);
  // FormData sets its own multipart Content-Type (with boundary) — never override it.
  const json = init?.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  return fetch(`/api/admin${path}`, {
    ...init,
    headers: { ...json, ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}
