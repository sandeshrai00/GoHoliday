import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPackage } from "@/lib/catalog";
import BookingForm from "./_components/booking-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pkg = await getPackage((await params).slug);
  if (!pkg) return { title: "Package not found" };
  return { title: `Book ${pkg.title} | GoHoliday` };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = await getPackage((await params).slug);
  if (!pkg) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Book {pkg.title}</h1>
      <p className="mt-1 text-muted-foreground">
        {pkg.destination} · {pkg.duration_days}D/{pkg.duration_nights}N — send a request, pay nothing now.
      </p>
      <div className="mt-6">
        <Suspense>
          <BookingForm
            packageId={pkg.id}
            slug={pkg.slug}
            title={pkg.title}
            destination={pkg.destination}
            baseCents={pkg.base_price_cents}
          />
        </Suspense>
      </div>
    </div>
  );
}
