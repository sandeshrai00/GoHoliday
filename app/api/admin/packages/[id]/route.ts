import { deletePackageAdmin, updatePackageAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";
import { packageSchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid package details" }, { status: 400 });
  try {
    return Response.json(await updatePackageAdmin(id, parsed.data));
  } catch (err) {
    console.error("PUT /api/admin/packages/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not update package" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  const { id } = await params;
  try {
    await deletePackageAdmin(id);
    return Response.json({ ok: true });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    if (status === 500) console.error("DELETE /api/admin/packages/[id] failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: err instanceof Error ? err.message : "Could not delete package" }, { status });
  }
}
