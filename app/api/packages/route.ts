import { listPackages } from "@/lib/catalog";
import type { PackageFilters } from "@/lib/catalog";

/**
 * Public catalog. Published packages only — drafts are invisible here
 * (admin preview happens through /api/admin/*). All params optional.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const sortParam = params.get("sort") ?? "";
  const filters: PackageFilters = {
    search: params.get("search") ?? undefined,
    destination: params.get("destination") ?? undefined,
    category: params.get("category") ?? undefined,
    featured: params.get("featured") === "1" ? true : undefined,
    sort: ["price-asc", "price-desc", "duration-asc", "duration-desc", "newest"].includes(sortParam)
      ? (sortParam as PackageFilters["sort"])
      : undefined,
    limit: Number.parseInt(params.get("limit") ?? "", 10) || undefined,
    offset: Number.parseInt(params.get("offset") ?? "", 10) || undefined,
  };
  try {
    return Response.json(await listPackages(filters));
  } catch (err) {
    console.error("GET /api/packages failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Catalog unavailable" }, { status: 500 });
  }
}
