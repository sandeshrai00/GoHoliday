import { useEffect, useState } from "react";

// Clerk's documented prebuilt standard: 30s between code requests.
export const RESEND_COOLDOWN_SECONDS = 30;

export function useResendCooldown() {
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  return { cooldown, start: () => setCooldown(RESEND_COOLDOWN_SECONDS) };
}
