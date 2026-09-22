"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PackageSummary } from "@/types";
import Price from "./price";

export default function PackageCard({ pkg }: { pkg: PackageSummary }) {
  return (
    <Link href={`/packages/${pkg.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {pkg.cover ? (
            // ponytail: plain <img> — no remotePatterns config to maintain. Next Image when traffic justifies it.
            <img
              src={pkg.cover.url}
              alt={pkg.cover.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          <Badge className="absolute left-3 top-3">
            {pkg.duration_days}D / {pkg.duration_nights}N
          </Badge>
        </div>
        <CardContent className="flex flex-col gap-1.5 p-4">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden />
            {pkg.destination} · {pkg.category}
          </p>
          <h3 className="font-semibold leading-snug group-hover:text-primary">{pkg.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{pkg.short_description}</p>
          <p className="mt-1 text-sm">
            <Price baseCents={pkg.base_price_cents} className="text-lg font-bold" />{" "}
            <span className="text-muted-foreground">per person</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
