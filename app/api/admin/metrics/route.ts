import { getMetricsAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";

export async function GET(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  try {
    return Response.json(await getMetricsAdmin());
  } catch (err) {
    console.error("GET /api/admin/metrics failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Metrics unavailable" }, { status: 500 });
  }
}
