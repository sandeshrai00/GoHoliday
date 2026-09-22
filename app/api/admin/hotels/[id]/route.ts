import { deleteHotelAdmin, updateHotelAdmin } from "@/lib/hotels";
import { requireApiRole } from "@/lib/auth";
import { parseGalleryRequest } from "@/lib/r2";
import { hotelSchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const { id } = await params;
  let body: unknown;
  try {
    body = await parseGalleryRequest(req);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 400;
    return Response.json({ error: err instanceof Error ? err.message : "Invalid request body" }, { status });
  }
  const parsed = hotelSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid hotel details" }, { status: 400 });
  try {
    return Response.json(await updateHotelAdmin(id, parsed.data));
  } catch (err) {
    console.error("PUT /api/admin/hotels/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not update hotel" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const { id } = await params;
  try {
    await deleteHotelAdmin(id);
    return Response.json({ ok: true });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    if (status === 500) console.error("DELETE /api/admin/hotels/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: err instanceof Error ? err.message : "Could not delete hotel" }, { status });
  }
}
