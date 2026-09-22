import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Price from "@/components/site/price";
import { Stars } from "@/components/site/hotel-card";
import { getHotel } from "@/lib/hotels";
import InclusionsExclusions from "../../packages/[slug]/_components/inclusions-exclusions";
import PackageGallery from "../../packages/[slug]/_components/package-gallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const hotel = await getHotel((await params).slug);
  if (!hotel) return { title: "Hotel not found" };
  return { title: `${hotel.name} | GoHoliday`, description: hotel.short_description };
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" aria-hidden />
        {hotel.location} · {hotel.region}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{hotel.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge>
          <Stars rating={hotel.star_rating} />
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          Check-in {hotel.check_in_time} · Check-out {hotel.check_out_time}
        </Badge>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <PackageGallery images={hotel.gallery} title={hotel.name} />
          <p className="leading-relaxed text-muted-foreground">{hotel.description}</p>
          <InclusionsExclusions includes={hotel.amenities} excludes={[]} />
          {hotel.policies ? (
            <section aria-label="Cancellation policy">
              <h2 className="text-xl font-bold">Cancellation policy</h2>
              <p className="mt-1 text-sm text-muted-foreground">{hotel.policies}</p>
            </section>
          ) : null}
        </div>
        <div className="space-y-4">
          {hotel.room_types.map((room) => (
            <div key={room.name} className="rounded-xl border p-5">
              <h2 className="font-bold">{room.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sleeps {room.max_guests} {room.max_guests === 1 ? "guest" : "guests"}
                {room.description ? ` · ${room.description}` : ""}
              </p>
              <p className="mt-2 text-sm">
                <Price baseCents={room.price_cents_per_night} className="text-xl font-bold" />{" "}
                <span className="text-muted-foreground">per night / room</span>
              </p>
              <Button asChild className="mt-3 w-full">
                <Link href={`/hotels/${hotel.slug}/book?room=${encodeURIComponent(room.name)}`}>Book this room</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
