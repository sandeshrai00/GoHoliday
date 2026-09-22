import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClerkClient } from "@clerk/backend";
import { normalizeRole, type Role } from "./roles";

export interface VerifiedRequest {
  userId: string;
  role: Role;
}

function backend() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  // authenticateRequest derives the frontend API + instance type from the
  // publishable key — secretKey alone throws inside the SDK (silent 401s).
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) throw new Error("Missing CLERK_SECRET_KEY or VITE_CLERK_PUBLISHABLE_KEY");
  // ponytail: secretKey verification (JWKS fetched + cached per isolate).
  // Paste the PEM public key as CLERK_JWT_KEY for zero-network verification if latency matters.
  return createClerkClient({ secretKey, publishableKey });
}

/**
 * Verifies the request's Clerk session JWT server-side.
 * The role comes from the `app_role` session claim (verified token, not client input).
 * Returns null when unauthenticated or verification fails.
 */
export async function verifyRequest(req?: Request): Promise<VerifiedRequest | null> {
  try {
    const request =
      req ?? new Request("https://app.local/", { headers: new Headers(await headers()) });
    const state = await backend().authenticateRequest(request);
    if (!state.isAuthenticated) return null;
    const auth = state.toAuth();
    if (!auth.userId) return null;
    return { userId: auth.userId, role: normalizeRole(auth.sessionClaims?.app_role) };
  } catch (err) {
    // Visible server-side so auth failures are diagnosable (never silent 401s again).
    console.error("verifyRequest failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Server-component/page gate. Redirects (never renders protected content on failure). */
export async function requireRole(role: Role = "admin"): Promise<VerifiedRequest> {
  const verified = await verifyRequest();
  if (!verified) redirect("/sign-in");
  if (role === "admin" && verified.role !== "admin") redirect("/profile");
  return verified;
}

/** Route-handler helper: const me = await requireApiRole(req, "admin"); if (me instanceof Response) return me; */
export async function requireApiRole(
  req: Request,
  role: Role = "admin",
): Promise<VerifiedRequest | Response> {
  const verified = await verifyRequest(req);
  if (!verified) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (role === "admin" && verified.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  return verified;
}
