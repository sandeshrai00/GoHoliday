import Link from "next/link";
import { getDestinations } from "@/lib/catalog";

export default async function DestinationsPage() {
  const destinations = await getDestinations();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
      <p className="mt-1 text-muted-foreground">Everywhere GoHoliday currently travels in Thailand.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <Link
            key={d.name}
            href={`/packages?destination=${encodeURIComponent(d.name)}`}
            className="group relative overflow-hidden rounded-xl border"
          >
            <div className="aspect-[16/10] bg-muted">
              {d.image ? (
                <img
                  src={d.image.url}
                  alt={d.image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <h2 className="text-lg font-bold text-white group-hover:underline">{d.name}</h2>
              <p className="text-sm text-white/80">
                {d.count} {d.count === 1 ? "trip" : "trips"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
