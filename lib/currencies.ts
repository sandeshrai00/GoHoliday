import type { CurrencyCode } from "@/types";

export const CURRENCIES: ReadonlyArray<{ code: CurrencyCode; label: string }> = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "NPR", label: "NPR — Nepalese Rupee" },
  { code: "THB", label: "THB — Thai Baht" },
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/** localStorage key for the visitor's display currency. */
export const CURRENCY_STORAGE_KEY = "goholiday-currency";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCIES as ReadonlyArray<{ code: string }>).some((c) => c.code === value);
}
