"use client";

import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertFromUsd, formatPrice } from "@/lib/pricing";
import { adminFetch } from "../../_components/admin-fetch";
import type { CurrencyCode } from "@/types";

const EDITABLE: CurrencyCode[] = ["EUR", "NPR", "THB"];

export default function AdminRatesPage() {
  const { getToken } = useAuth();
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [draft, setDraft] = useState({ EUR: "", NPR: "", THB: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(getToken, "/rates");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRates(data.rates);
      setDraft({ EUR: String(data.rates.EUR), NPR: String(data.rates.NPR), THB: String(data.rates.THB) });
    } catch {
      setError("Could not load rates.");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const parsed = { EUR: Number(draft.EUR), NPR: Number(draft.NPR), THB: Number(draft.THB) };
    if (Object.values(parsed).some((v) => !(v > 0 && v < 10000))) {
      setError("Rates must be numbers between 0 and 10,000.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch(getToken, "/rates", { method: "PUT", body: JSON.stringify({ rates: parsed }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Save failed.");
        setSaving(false);
        return;
      }
      setRates(data.rates);
      setSaved(true);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">Currency rates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Units per 1 USD. USD is fixed at 1. Changes apply site-wide instantly.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {rates === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={save} className="mt-4 space-y-3 rounded-xl border p-5">
          {EDITABLE.map((code) => (
            <label key={code} className="block text-sm font-medium">
              1 USD = ? {code}
              <Input
                value={draft[code]}
                onChange={(e) => setDraft((d) => ({ ...d, [code]: e.target.value }))}
                inputMode="decimal"
                required
                className="mt-1"
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Preview: $100 → {formatPrice(convertFromUsd(10000, Number(draft[code]) || 0), code)}
              </span>
            </label>
          ))}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save rates"}
            </Button>
            {saved ? (
              <span role="status" className="text-sm font-medium text-green-700">
                Saved.
              </span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
