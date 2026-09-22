"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY, isCurrencyCode } from "@/lib/currencies";
import { convertFromUsd, formatPrice } from "@/lib/pricing";
import type { CurrencyCode } from "@/types";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Units per 1 USD. Falls back to USD-only until /api/rates loads. */
  rates: Record<CurrencyCode, number>;
  /** Base USD cents → formatted string in the visitor's currency. */
  formatUsd: (baseCents: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rates: { USD: 1, EUR: 0, NPR: 0, THB: 0 },
  formatUsd: (baseCents) => formatPrice(convertFromUsd(baseCents, 1), DEFAULT_CURRENCY),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({ USD: 1, EUR: 0, NPR: 0, THB: 0 });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && isCurrencyCode(saved)) setCurrencyState(saved);
    } catch {
      // Private mode — default currency still works.
    }
    fetch("/api/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.rates) setRates(data.rates);
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      // Ignore persistence failures.
    }
  }, []);

  const formatUsd = useCallback(
    (baseCents: number) => formatPrice(convertFromUsd(baseCents, rates[currency] || 1), currency),
    [currency, rates],
  );

  const value = useMemo(() => ({ currency, setCurrency, rates, formatUsd }), [currency, setCurrency, rates, formatUsd]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
