import { getDestinations } from "@/lib/catalog";

/** Public destination list derived from published packages. */
export async function GET() {
  try {
    return Response.json({ destinations: await getDestinations() });
  } catch (err) {
    console.error("GET /api/destinations failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Destinations unavailable" }, { status: 500 });
  }
}
