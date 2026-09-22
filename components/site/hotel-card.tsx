"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HotelSummary } from "@/types";
import Price from "./price";

export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} star hotel`} className="text-sm font-bold text-amber-500">
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function HotelCard({ hotel }: { hotel: HotelSummary }) {
  return (
    <Link href={`/hotels/${hotel.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {hotel.cover ? (
            // ponytail: plain <img> — no remotePatterns config to maintain. Next Image when traffic justifies it.
            <img
              src={hotel.cover.url}
              alt={hotel.cover.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          <Badge className="absolute left-3 top-3">
            <Stars rating={hotel.star_rating} />
          </Badge>
        </div>
        <CardContent className="flex flex-col gap-1.5 p-4">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden />
            {hotel.location}
          </p>
          <h3 className="font-semibold leading-snug group-hover:text-primary">{hotel.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{hotel.short_description}</p>
          <p className="mt-1 text-sm">
            from <Price baseCents={hotel.from_price_cents} className="text-lg font-bold" />{" "}
            <span className="text-muted-foreground">per night</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
