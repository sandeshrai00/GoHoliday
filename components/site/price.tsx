"use client";

import { useCurrency } from "./use-currency";

/** Base USD cents → visitor's currency, e.g. $199 / €171 / NPR 27,064 / ฿6,686. */
export default function Price({ baseCents, className }: { baseCents: number; className?: string }) {
  const { formatUsd } = useCurrency();
  return <span className={className}>{formatUsd(baseCents)}</span>;
}
