import { getPackage } from "@/lib/catalog";

/** Public package detail. Drafts return 404 — same as not existing. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const pkg = await getPackage(slug);
    if (!pkg) return Response.json({ error: "Package not found" }, { status: 404 });
    return Response.json(pkg);
  } catch (err) {
    console.error("GET /api/packages/[slug] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Package unavailable" }, { status: 500 });
  }
}
