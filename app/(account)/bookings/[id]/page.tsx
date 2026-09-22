import type { Metadata } from "next";
import BookingDetail from "./_components/booking-detail";

export const metadata: Metadata = { title: "Booking Details" };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <BookingDetail id={id} />
    </main>
  );
}
