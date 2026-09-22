import { listHotelBookingsAdmin } from "@/lib/hotels";
import { requireApiRole } from "@/lib/auth";

export async function GET(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  try {
    return Response.json({ bookings: await listHotelBookingsAdmin(status) });
  } catch (err) {
    console.error("GET /api/admin/hotel-bookings failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Bookings unavailable" }, { status: 500 });
  }
}
