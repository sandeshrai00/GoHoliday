export function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; errors?: Array<{ message?: unknown; longMessage?: unknown }> };
    const first = e.errors?.[0];
    // Clerk's longMessage carries the user-facing wording (e.g. lockout wait times).
    if (typeof first?.longMessage === "string" && first.longMessage) return first.longMessage;
    if (typeof first?.message === "string" && first.message) return first.message;
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return fallback;
}
