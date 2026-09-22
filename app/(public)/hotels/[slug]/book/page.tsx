import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel } from "@/lib/hotels";
import HotelBookingForm from "./_components/hotel-booking-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const hotel = await getHotel((await params).slug);
  if (!hotel) return { title: "Hotel not found" };
  return { title: `Book ${hotel.name} | GoHoliday` };
}

export default async function HotelBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const hotel = await getHotel((await params).slug);
  if (!hotel) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Book {hotel.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {hotel.location} · {"★".repeat(hotel.star_rating)} — send a request, pay nothing now.
      </p>
      <div className="mt-6">
        <Suspense>
          <HotelBookingForm hotelId={hotel.id} hotelSlug={hotel.slug} hotelName={hotel.name} rooms={hotel.room_types} />
        </Suspense>
      </div>
    </div>
  );
}
