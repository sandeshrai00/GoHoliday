"use client";

import { useAuth } from "@clerk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "../../../_components/admin-fetch";
import { packageSchema, type PackageFormValues } from "@/lib/validation";
import type { AdminPackage } from "@/lib/admin";

interface Row {
  title: string;
  description: string;
}

const toLines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function PackageForm({
  initial,
  onSaved,
  onClose,
}: {
  initial?: AdminPackage | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [region, setRegion] = useState(initial?.region ?? "Thailand");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [days, setDays] = useState(String(initial?.duration_days ?? 3));
  const [nights, setNights] = useState(String(initial?.duration_nights ?? 2));
  const [priceUsd, setPriceUsd] = useState(
    initial ? String(Math.round(initial.base_price_cents / 100)) : "",
  );
  const [groupSize, setGroupSize] = useState(initial?.max_group_size ? String(initial.max_group_size) : "");
  const [departure, setDeparture] = useState(initial?.departure_city ?? "");
  const [gallery, setGallery] = useState((initial?.gallery ?? []).map((g) => g.url).join("\n"));
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join("\n"));
  const [includes, setIncludes] = useState((initial?.includes ?? []).join("\n"));
  const [excludes, setExcludes] = useState((initial?.excludes ?? []).join("\n"));
  const [rows, setRows] = useState<Row[]>(
    (initial?.itinerary ?? []).map((d) => ({ title: d.title, description: d.description })),
  );
  const [meetingPoint, setMeetingPoint] = useState(initial?.meeting_point ?? "");
  const [policies, setPolicies] = useState(initial?.policies ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const candidate: PackageFormValues = {
      title,
      slug: slug || undefined,
      destination,
      region,
      category,
      short_description: shortDescription,
      description,
      duration_days: Number(days),
      duration_nights: Number(nights),
      base_price_usd: Number(priceUsd),
      max_group_size: groupSize.trim() ? Number(groupSize) : null,
      departure_city: departure,
      gallery_urls: toLines(gallery),
      highlights: toLines(highlights),
      itinerary: rows
        .filter((r) => r.title.trim())
        .map((r, i) => ({ day: i + 1, title: r.title.trim(), description: r.description.trim() })),
      includes: toLines(includes),
      excludes: toLines(excludes),
      meeting_point: meetingPoint,
      policies,
      status,
      featured,
    };
    const parsed = packageSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the highlighted fields.");
      return;
    }
    // Gallery URLs must be valid http(s) links — zod checks shape, this checks sense.
    if (parsed.data.gallery_urls.some((u) => !/^https?:\/\//.test(u))) {
      setError("Gallery URLs must start with http(s)://");
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch(getToken, initial ? `/packages/${initial.id}` : "/packages", {
        method: initial ? "PUT" : "POST",
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Save failed.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Network error.");
      setSaving(false);
    }
  };

  const input = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  const area = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const label = "block text-sm font-medium";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Title*<Input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label className={label}>Slug (auto if empty)<Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="bangkok-city-explorer" /></label>
        <label className={label}>Destination*<Input value={destination} onChange={(e) => setDestination(e.target.value)} required /></label>
        <label className={label}>Category*<Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="City Break" required /></label>
        <label className={label}>Region<Input value={region} onChange={(e) => setRegion(e.target.value)} /></label>
        <label className={label}>Departure city<Input value={departure} onChange={(e) => setDeparture(e.target.value)} /></label>
        <label className={label}>Days*<input type="number" min={1} max={60} value={days} onChange={(e) => setDays(e.target.value)} required className={input} /></label>
        <label className={label}>Nights*<input type="number" min={0} max={60} value={nights} onChange={(e) => setNights(e.target.value)} required className={input} /></label>
        <label className={label}>Price (USD per person)*<input type="number" min={1} value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} required className={input} /></label>
        <label className={label}>Max group size<input type="number" min={1} max={100} value={groupSize} onChange={(e) => setGroupSize(e.target.value)} placeholder="No limit" className={input} /></label>
        <label className={label}>Status
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className={input}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
          Featured on home page
        </label>
      </div>
      <label className={label}>Short description*<textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} maxLength={300} required className={area} /></label>
      <label className={label}>Full description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={area} /></label>
      <label className={label}>Gallery URLs (one per line)<textarea value={gallery} onChange={(e) => setGallery(e.target.value)} rows={3} placeholder="https://…" className={area} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={label}>Highlights (one per line)<textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={4} className={area} /></label>
        <label className={label}>Included (one per line)<textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={4} className={area} /></label>
        <label className={label}>Not included (one per line)<textarea value={excludes} onChange={(e) => setExcludes(e.target.value)} rows={4} className={area} /></label>
      </div>
      <div>
        <p className="text-sm font-medium">Itinerary</p>
        <div className="mt-2 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold">
                D{i + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Input value={row.title} onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Day title" />
                <textarea value={row.description} onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} placeholder="What happens this day" rows={2} className={area} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove day ${i + 1}`}>
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setRows((r) => [...r, { title: "", description: "" }])}>
          + Add day
        </Button>
      </div>
      <label className={label}>Meeting point
        <input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} className={input} />
      </label>
      <label className={label}>Cancellation policy<textarea value={policies} onChange={(e) => setPolicies(e.target.value)} rows={2} className={area} /></label>
      {error ? <p role="alert" className="text-sm font-medium text-red-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Create package"}</Button>
      </div>
    </form>
  );
}
