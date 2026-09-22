import { getHotel } from "@/lib/hotels";

/** Published hotel only — drafts 404 here. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const hotel = await getHotel(slug);
    if (!hotel) return Response.json({ error: "Hotel not found" }, { status: 404 });
    return Response.json(hotel);
  } catch (err) {
    console.error("GET /api/hotels/[slug] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Hotel unavailable" }, { status: 500 });
  }
}
