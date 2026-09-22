import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PackageCard from "@/components/site/package-card";
import type { PackageSummary } from "@/types";

export default function FeaturedPackages({ items }: { items: PackageSummary[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Featured trips</h2>
          <p className="text-muted-foreground">Our most-loved Thailand experiences.</p>
        </div>
        <Button variant="ghost" asChild className="hidden sm:inline-flex">
          <Link href="/packages">
            All packages <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
