import type { Metadata } from "next";
import HotelBookingDetail from "./_components/hotel-booking-detail";

export const metadata: Metadata = { title: "Hotel Booking Details" };

export default async function HotelBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <HotelBookingDetail id={id} />
    </main>
  );
}
