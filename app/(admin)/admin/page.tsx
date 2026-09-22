import Link from "next/link";
import { getMetricsAdmin, listBookingsAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/pricing";
import StatusBadge from "@/components/site/status-badge";

export default async function AdminDashboardPage() {
  const [metrics, recent] = await Promise.all([getMetricsAdmin(), listBookingsAdmin()]);
  const cards = [
    { label: "Confirmed revenue", value: formatPrice(Math.round(metrics.revenue_cents / 100), "USD") },
    { label: "Pending bookings", value: String(metrics.bookings_pending) },
    { label: "Total bookings", value: String(metrics.bookings_total) },
    { label: "Customers", value: String(metrics.customers) },
    { label: "Published packages", value: String(metrics.packages_published) },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent bookings</h2>
        <Link href="/admin/bookings" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <ul className="mt-2 divide-y rounded-xl border">
          {recent.slice(0, 5).map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{b.booking_ref}</p>
                <p className="truncate text-muted-foreground">
                  {b.package_title} · {b.customer_email ?? "—"}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
