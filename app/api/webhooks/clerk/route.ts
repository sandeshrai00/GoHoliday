import { verifyWebhook } from "@clerk/backend/webhooks";
import { normalizeRole } from "@/lib/roles";
import { getSupabase } from "@/lib/supabase";

/**
 * Clerk → Supabase user sync. Clerk owns identity; this route keeps a display
 * snapshot in `profiles` (admin list, future bookings FK). Authorization always
 * uses the live JWT role claim (lib/auth.ts) — the DB `role` column is never
 * trusted for access decisions.
 */
export async function POST(req: Request) {
  let evt;
  try {
    // Reads CLERK_WEBHOOK_SIGNING_SECRET; throws on bad/missing signature.
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Verification failed", { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
        evt.data;
      const primary =
        email_addresses.find((e) => e.id === primary_email_address_id) ?? email_addresses[0];
      if (!primary?.email_address) {
        // Malformed event — retrying won't help, ack it and move on.
        console.warn("Clerk webhook: user without email, skipping", evt.type, id);
        return new Response("OK", { status: 200 });
      }
      const { error } = await getSupabase()
        .from("profiles")
        .upsert(
          {
            user_id: id,
            email: primary.email_address.toLowerCase(),
            first_name: first_name ?? null,
            last_name: last_name ?? null,
            avatar_url: image_url || null,
            // ponytail: snapshot only — live JWT claim decides access.
            role: normalizeRole(evt.data.public_metadata?.role),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    } else if (evt.type === "user.deleted") {
      const { error } = await getSupabase().from("profiles").delete().eq("user_id", evt.data.id);
      if (error) throw error;
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    // 5xx → Svix retries. Correct for transient DB failures.
    console.error("Clerk webhook handler failed:", evt.type, err);
    return new Response("Handler failed", { status: 500 });
  }
}
