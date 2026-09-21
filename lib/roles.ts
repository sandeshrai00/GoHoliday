export type Role = "admin" | "user";

export const DEFAULT_ROLE: Role = "user";

declare global {
  interface CustomJwtSessionClaims {
    role?: string;
  }
}

/** Never trust the client: anything that is not exactly "admin" is "user". */
export function normalizeRole(value: unknown): Role {
  return value === "admin" ? "admin" : DEFAULT_ROLE;
}

/** Client-side read of the role (UX only — enforcement is server-side in lib/auth.ts). */
export function userRole(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined,
): Role {
  return normalizeRole(user?.publicMetadata?.role);
}
