import { updateBookingStatusAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";
import { bookingStatusSchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid status" }, { status: 400 });
  try {
    return Response.json(await updateBookingStatusAdmin(id, parsed.data.status));
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    if (status === 500) console.error("PUT /api/admin/bookings/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: err instanceof Error ? err.message : "Could not update booking" }, { status });
  }
}
