import { createPackageAdmin, listPackagesAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";
import { parseGalleryRequest } from "@/lib/r2";
import { packageSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  try {
    return Response.json({ packages: await listPackagesAdmin() });
  } catch (err) {
    console.error("GET /api/admin/packages failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Packages unavailable" }, { status: 500 });
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
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid package details" }, { status: 400 });
  try {
    const pkg = await createPackageAdmin(parsed.data);
    return Response.json(pkg, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/packages failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not create package" }, { status: 500 });
  }
}
