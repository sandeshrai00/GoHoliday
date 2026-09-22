"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_TAGLINE } from "@/lib/constants";

export default function HomeHero({ destinations }: { destinations: string[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (destination) params.set("destination", destination);
    router.push(`/packages${params.size > 0 ? `?${params}` : ""}`);
  };

  return (
    <section className="bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Thailand, handpicked.</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">{SITE_TAGLINE}</p>
        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row"
          role="search"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Bangkok, islands, temples…"
              aria-label="Search packages"
              className="pl-9"
            />
          </div>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            aria-label="Destination"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All destinations</option>
            {destinations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Button type="submit" size="lg" className="sm:h-10">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
