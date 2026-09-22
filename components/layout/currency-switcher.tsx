"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENCIES } from "@/lib/currencies";
import { useCurrency } from "@/components/site/use-currency";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Display currency">
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem key={c.code} onSelect={() => setCurrency(c.code)}>
            <span className="flex w-full items-center justify-between gap-4">
              {c.label}
              {c.code === currency ? <Check className="h-4 w-4" aria-hidden /> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
