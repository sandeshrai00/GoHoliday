"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import PackageCard from "@/components/site/package-card";
import type { PackageSummary } from "@/types";

interface Filters {
  search: string;
  destination: string;
  category: string;
  sort: string;
}

export default function PackagesBrowser() {
  const initial = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    search: initial.get("search") ?? "",
    destination: initial.get("destination") ?? "",
    category: "",
    sort: "",
  });
  const [items, setItems] = useState<PackageSummary[] | null>(null);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<{ destinations: string[]; categories: string[] }>({
    destinations: filters.destination ? [filters.destination] : [],
    categories: [],
  });

  // Filter option lists come from one unfiltered fetch — always complete, no hardcoding.
  useEffect(() => {
    fetch("/api/packages?limit=50")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.items) return;
        const list = data.items as PackageSummary[];
        setOptions({
          destinations: [...new Set(list.map((p) => p.destination))].sort(),
          categories: [...new Set(list.map((p) => p.category))].sort(),
        });
      })
      .catch(() => {});
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.category) params.set("category", filters.category);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("limit", "50");
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(null);
      fetch(`/api/packages?${query}`)
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
      <h1 className="text-3xl font-bold tracking-tight">Thailand packages</h1>
      <p className="mt-1 text-muted-foreground">Handpicked trips with local guides. Prices per person.</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search packages…"
          aria-label="Search packages"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          value={filters.destination}
          onChange={(e) => set({ destination: e.target.value })}
          aria-label="Destination"
          className={selectClass}
        >
          <option value="">All destinations</option>
          {options.destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
          aria-label="Category"
          className={selectClass}
        >
          <option value="">All categories</option>
          {options.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort" className={selectClass}>
          <option value="">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="duration-asc">Shortest first</option>
          <option value="duration-desc">Longest first</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {items === null ? "Searching…" : `${total} ${total === 1 ? "trip" : "trips"}`}
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
          <p className="font-semibold">No trips match those filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
          <button
            onClick={() => set({ search: "", destination: "", category: "", sort: "" })}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
