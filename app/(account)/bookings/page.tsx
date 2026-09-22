import type { Metadata } from "next";
import BookingsList from "./_components/bookings-list";

export const metadata: Metadata = { title: "My Bookings" };

export default function BookingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <p className="mt-1 text-muted-foreground">Every trip you&apos;ve requested, and its status.</p>
      <div className="mt-6">
        <BookingsList />
      </div>
    </main>
  );
}
