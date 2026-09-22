import { createHotelAdmin, listHotelsAdmin } from "@/lib/hotels";
import { requireApiRole } from "@/lib/auth";
import { parseGalleryRequest } from "@/lib/r2";
import { hotelSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  try {
    return Response.json({ hotels: await listHotelsAdmin() });
  } catch (err) {
    console.error("GET /api/admin/hotels failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Hotels unavailable" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
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
    const hotel = await createHotelAdmin(parsed.data);
    return Response.json(hotel, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/hotels failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not create hotel" }, { status: 500 });
  }
}
