import { updateRatesAdmin } from "@/lib/admin";
import { requireApiRole } from "@/lib/auth";
import { getRates } from "@/lib/catalog";
import { ratesSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  try {
    return Response.json(await getRates());
  } catch (err) {
    console.error("GET /api/admin/rates failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Rates unavailable" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const me = await requireApiRole(req, "admin");
  if (me instanceof Response) return me;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = ratesSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid rates" }, { status: 400 });
  try {
    await updateRatesAdmin(parsed.data.rates);
    return Response.json(await getRates());
  } catch (err) {
    console.error("PUT /api/admin/rates failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not update rates" }, { status: 500 });
  }
}
