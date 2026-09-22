import { createPackageAdmin, listPackagesAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";
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
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
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
