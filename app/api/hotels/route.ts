import { listHotels } from "@/lib/hotels";
import type { HotelFilters } from "@/lib/hotels";

/** Public catalog. Published hotels only — drafts are invisible here. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const sortParam = params.get("sort") ?? "";
  const filters: HotelFilters = {
    search: params.get("search") ?? undefined,
    location: params.get("location") ?? undefined,
    sort: ["price-asc", "price-desc", "stars", "newest"].includes(sortParam)
      ? (sortParam as HotelFilters["sort"])
      : undefined,
    limit: Number.parseInt(params.get("limit") ?? "", 10) || undefined,
    offset: Number.parseInt(params.get("offset") ?? "", 10) || undefined,
  };
  try {
    return Response.json(await listHotels(filters));
  } catch (err) {
    console.error("GET /api/hotels failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Catalog unavailable" }, { status: 500 });
  }
}
