"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import HotelCard from "@/components/site/hotel-card";
import type { HotelSummary } from "@/types";

interface Filters {
  search: string;
  location: string;
  sort: string;
}

export default function HotelsBrowser() {
  const initial = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    search: initial.get("search") ?? "",
    location: initial.get("location") ?? "",
    sort: "",
  });
  const [items, setItems] = useState<HotelSummary[] | null>(null);
  const [total, setTotal] = useState(0);
  const [locations, setLocations] = useState<string[]>(filters.location ? [filters.location] : []);

  // Location options come from one unfiltered fetch — always complete, no hardcoding.
  useEffect(() => {
    fetch("/api/hotels?limit=50")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.items) return;
        setLocations([...new Set((data.items as HotelSummary[]).map((h) => h.location))].sort());
      })
      .catch(() => {});
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.location) params.set("location", filters.location);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("limit", "50");
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(null);
      fetch(`/api/hotels?${query}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setItems(data?.items ?? []);
          setTotal(data?.total ?? 0);
        })
        .catch(() => {
          setItems([]);
          setTotal(0);
        });
    }, 250); // ponytail: inline debounce — a useDebounce hook for one input is overhead.
    return () => clearTimeout(timer);
  }, [query]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Hotel stays</h1>
      <p className="mt-1 text-muted-foreground">Handpicked partner hotels. Prices per room, per night.</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search hotels…"
          aria-label="Search hotels"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          value={filters.location}
          onChange={(e) => set({ location: e.target.value })}
          aria-label="Location"
          className={selectClass}
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort" className={selectClass}>
          <option value="">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="stars">Highest rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {items === null ? "Searching…" : `${total} ${total === 1 ? "hotel" : "hotels"}`}
      </p>

      {items === null ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-xl border p-10 text-center">
          <p className="font-semibold">No hotels match those filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
          <button
            onClick={() => set({ search: "", location: "", sort: "" })}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
