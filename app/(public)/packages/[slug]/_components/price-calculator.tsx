"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/site/use-currency";
import { convertFromUsd, formatPrice } from "@/lib/pricing";

/** Sticky booking card: dates + travelers → live total, CTA carries values to /book. */
export default function PriceCalculator({
  slug,
  baseCents,
}: {
  slug: string;
  baseCents: number;
}) {
  const { currency, rates } = useCurrency();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const travelers = adults + children;
  const nights = useMemo(() => {
    if (!start || !end) return null;
    const n = Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
    return n >= 1 ? n : null;
  }, [start, end]);
  const total = travelers > 0 ? baseCents * travelers : 0;

  const bookHref = useMemo(() => {
    const params = new URLSearchParams({
      adults: String(adults),
      children: String(children),
    });
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    return `/packages/${slug}/book?${params}`;
  }, [slug, start, end, adults, children]);

  const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm lg:sticky lg:top-24">
      <p>
        <span className="text-2xl font-bold">{formatPrice(convertFromUsd(baseCents, rates[currency] ?? 1), currency)}</span>{" "}
        <span className="text-sm text-muted-foreground">per person</span>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-xs font-medium">
          Start date
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-xs font-medium">
          End date
          <input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-xs font-medium">
          Adults
          <input
            type="number" min={1} max={20} value={adults}
            onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="text-xs font-medium">
          Children
          <input
            type="number" min={0} max={20} value={children}
            onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>
      <div className="mt-4 border-t pt-3 text-sm">
        <p className="flex justify-between text-muted-foreground">
          <span>
            {travelers} {travelers === 1 ? "traveler" : "travelers"}
            {nights !== null ? ` · ${nights} ${nights === 1 ? "night" : "nights"}` : ""}
          </span>
        </p>
        <p className="mt-1 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(convertFromUsd(total, rates[currency] ?? 1), currency)}</span>
        </p>
      </div>
      <Button asChild className="mt-4 w-full" size="lg">
        <Link href={bookHref}>Book this trip</Link>
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">No payment now — we confirm first.</p>
    </div>
  );
}
