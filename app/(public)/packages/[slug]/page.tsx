import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/site/price";
import { getPackage } from "@/lib/catalog";
import InclusionsExclusions from "./_components/inclusions-exclusions";
import ItineraryAccordion from "./_components/itinerary-accordion";
import PackageGallery from "./_components/package-gallery";
import PriceCalculator from "./_components/price-calculator";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pkg = await getPackage((await params).slug);
  if (!pkg) return { title: "Package not found" };
  return { title: `${pkg.title} | GoHoliday`, description: pkg.short_description };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = await getPackage((await params).slug);
  if (!pkg) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" aria-hidden />
        {pkg.destination} · {pkg.category}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{pkg.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge>
          {pkg.duration_days}D / {pkg.duration_nights}N
        </Badge>
        <Badge variant="outline">From {pkg.departure_city}</Badge>
        <Badge variant="outline">Max {pkg.max_group_size} travelers</Badge>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <PackageGallery images={pkg.gallery} title={pkg.title} />
          <p className="leading-relaxed text-muted-foreground">{pkg.description}</p>
          <ItineraryAccordion days={pkg.itinerary} />
          <InclusionsExclusions includes={pkg.includes} excludes={pkg.excludes} />
          {pkg.meeting_point ? (
            <section aria-label="Meeting point">
              <h2 className="text-xl font-bold">Meeting point</h2>
              <p className="mt-1 text-sm text-muted-foreground">{pkg.meeting_point}</p>
            </section>
          ) : null}
          {pkg.policies ? (
            <section aria-label="Cancellation policy">
              <h2 className="text-xl font-bold">Cancellation policy</h2>
              <p className="mt-1 text-sm text-muted-foreground">{pkg.policies}</p>
            </section>
          ) : null}
        </div>
        <div>
          <PriceCalculator slug={pkg.slug} baseCents={pkg.base_price_cents} />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            From <Price baseCents={pkg.base_price_cents} className="font-semibold text-foreground" /> per person
          </p>
        </div>
      </div>
    </div>
  );
}
