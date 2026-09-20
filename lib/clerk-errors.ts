export function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; errors?: Array<{ message?: unknown }> };
    const first = e.errors?.[0]?.message;
    if (typeof first === "string" && first) return first;
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return fallback;
}
