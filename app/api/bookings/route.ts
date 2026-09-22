import { bookingInputSchema, createBooking, listBookings } from "@/lib/bookings";
import { verifyRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const me = await verifyRequest(req);
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json({ bookings: await listBookings(me.userId) });
  } catch (err) {
    console.error("GET /api/bookings failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Bookings unavailable" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const me = await verifyRequest(req);
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = bookingInputSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid booking details" }, { status: 400 });
  try {
    const booking = await createBooking(me.userId, parsed.data);
    return Response.json(booking, { status: 201 });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    if (status === 500) console.error("POST /api/bookings failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: err instanceof Error ? err.message : "Booking failed" }, { status });
  }
}
