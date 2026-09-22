import type { CurrencyCode } from "@/types";

/** Base USD cents → whole display units in the target currency. */
export function convertFromUsd(baseCents: number, rate: number): number {
  return Math.round((baseCents / 100) * rate);
}

/** Format display units. No decimals — travel prices are whole numbers. */
export function formatPrice(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** One-liner for UI: base cents + rate → formatted string. */
export function formatUsdPrice(baseCents: number, rate: number, code: CurrencyCode): string {
  return formatPrice(convertFromUsd(baseCents, rate), code);
}
