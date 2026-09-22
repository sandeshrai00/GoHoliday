import { getRates } from "@/lib/catalog";

/** Public rates. Clients convert base USD prices locally — instant currency switch, no reload. */
export async function GET() {
  try {
    return Response.json(await getRates());
  } catch (err) {
    console.error("GET /api/rates failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Rates unavailable" }, { status: 500 });
  }
}
