import { getBooking } from "@/lib/bookings";
import { verifyRequest } from "@/lib/auth";

/** Owner or admin. Everyone else gets 404 — no existence leak. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await verifyRequest(req);
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const booking = await getBooking(id);
    if (!booking || (booking.user_id !== me.userId && me.role !== "admin")) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }
    return Response.json(booking);
  } catch (err) {
    console.error("GET /api/bookings/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Booking unavailable" }, { status: 500 });
  }
}
