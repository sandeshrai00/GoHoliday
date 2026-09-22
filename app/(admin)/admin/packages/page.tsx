"use client";

import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { adminFetch } from "../../_components/admin-fetch";
import type { AdminPackage } from "@/lib/admin";
import PackageForm from "./_components/package-form";

export default function AdminPackagesPage() {
  const { getToken } = useAuth();
  const [packages, setPackages] = useState<AdminPackage[] | null>(null);
  const [editing, setEditing] = useState<AdminPackage | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(getToken, "/packages");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPackages(data.packages);
    } catch {
      setError("Could not load packages.");
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (pkg: AdminPackage) => {
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(getToken, `/packages/${pkg.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: pkg.title,
          slug: pkg.slug,
          destination: pkg.destination,
          region: pkg.region,
          category: pkg.category,
          short_description: pkg.short_description,
          description: pkg.description,
          duration_days: pkg.duration_days,
          duration_nights: pkg.duration_nights,
          base_price_usd: Math.round(pkg.base_price_cents / 100),
          max_group_size: pkg.max_group_size,
          departure_city: pkg.departure_city ?? "",
          gallery_urls: pkg.gallery.map((g) => g.url),
          highlights: pkg.highlights,
          itinerary: pkg.itinerary,
          includes: pkg.includes,
          excludes: pkg.excludes,
          meeting_point: pkg.meeting_point ?? "",
          policies: pkg.policies ?? "",
          status: pkg.status === "published" ? "draft" : "published",
          featured: pkg.featured,
        }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not change status.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(getToken, `/packages/${deleting.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Delete failed.");
        setBusy(false);
        return;
      }
      setDeleting(null);
      await load();
    } catch {
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
        <Button onClick={() => setCreating(true)}>+ New package</Button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {packages === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Package</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Bookings</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-4 py-2">
                    <p className="font-semibold">
                      {pkg.featured ? "★ " : ""}
                      {pkg.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pkg.destination} · {pkg.duration_days}D/{pkg.duration_nights}N · /{pkg.slug}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">${Math.round(pkg.base_price_cents / 100)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        pkg.status === "published" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{pkg.booking_count}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(pkg)} disabled={busy}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(pkg)} disabled={busy}>
                      {pkg.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(pkg)}
                      disabled={busy}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating ? (
        <Dialog title="New package" size="xl" onClose={() => setCreating(false)} locked={false}>
          <PackageForm
            onClose={() => setCreating(false)}
            onSaved={() => {
              setCreating(false);
              load();
            }}
          />
        </Dialog>
      ) : null}
      {editing ? (
        <Dialog title={`Edit — ${editing.title}`} size="xl" onClose={() => setEditing(null)} locked={false}>
          <PackageForm
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        </Dialog>
      ) : null}
      {deleting ? (
        <Dialog title="Delete package?" onClose={() => setDeleting(null)} locked={busy}>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{deleting.title}</strong> will be removed permanently.
            {deleting.booking_count > 0 ? (
              <> This package has {deleting.booking_count} bookings — deletion will be blocked.</>
            ) : null}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busy}>
              {busy ? "Deleting…" : "Yes, delete"}
            </Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
