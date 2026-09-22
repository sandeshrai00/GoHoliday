"use client";

import { useAuth } from "@clerk/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "../../../_components/admin-fetch";
import GalleryPicker from "../../packages/_components/gallery-picker";
import { MAX_IMAGE_BYTES, hotelSchema, type HotelFormValues } from "@/lib/validation";
import type { AdminHotel } from "@/lib/hotels";

interface RoomRow {
  name: string;
  price: string;
  maxGuests: string;
  description: string;
}

const toLines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function HotelForm({
  initial,
  onSaved,
  onClose,
}: {
  initial?: AdminHotel | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [region, setRegion] = useState(initial?.region ?? "Thailand");
  const [stars, setStars] = useState(String(initial?.star_rating ?? 5));
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [checkIn, setCheckIn] = useState(initial?.check_in_time ?? "14:00");
  const [checkOut, setCheckOut] = useState(initial?.check_out_time ?? "12:00");
  const [galleryUrls, setGalleryUrls] = useState<string[]>((initial?.gallery ?? []).map((g) => g.url));
  const [urlDraft, setUrlDraft] = useState("");
  // Picked files live ONLY in the browser until save — nothing uploads on pick.
  const [files, setFiles] = useState<File[]>([]);
  const [amenities, setAmenities] = useState((initial?.amenities ?? []).join("\n"));
  const [roomRows, setRoomRows] = useState<RoomRow[]>(
    (initial?.room_types ?? []).map((r) => ({
      name: r.name,
      price: String(Math.round(r.price_cents_per_night / 100)),
      maxGuests: String(r.max_guests),
      description: r.description,
    })),
  );
  const [policies, setPolicies] = useState(initial?.policies ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const pickFiles = (picked: FileList | null) => {
    if (!picked) return;
    setError(null);
    const next = [...files];
    for (const f of picked) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setError(`"${f.name}" is not a JPEG, PNG or WebP image.`);
        return;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        setError(`"${f.name}" is over 5 MB.`);
        return;
      }
      if (galleryUrls.length + next.length >= 12) {
        setError("A hotel holds at most 12 images.");
        return;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      setError("Gallery URLs must start with http(s)://");
      return;
    }
    if (galleryUrls.length + files.length >= 12) {
      setError("A hotel holds at most 12 images.");
      return;
    }
    setError(null);
    setGalleryUrls((u) => (u.includes(url) ? u : [...u, url]));
    setUrlDraft("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const candidate: HotelFormValues = {
      name,
      slug: slug || undefined,
      location,
      region,
      star_rating: Number(stars),
      short_description: shortDescription,
      description,
      gallery_urls: galleryUrls,
      amenities: toLines(amenities),
      check_in_time: checkIn,
      check_out_time: checkOut,
      room_types: roomRows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          price_per_night_usd: Number(r.price),
          max_guests: Number(r.maxGuests),
          description: r.description.trim(),
        })),
      policies,
      status,
      featured,
    };
    const parsed = hotelSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the highlighted fields.");
      return;
    }
    if (parsed.data.gallery_urls.length + files.length > 12) {
      setError("A hotel holds at most 12 images.");
      return;
    }
    setSaving(true);
    try {
      // Uploads ride along ONLY on save: files as multipart, otherwise today's JSON.
      const body =
        files.length > 0
          ? (() => {
              const form = new FormData();
              form.append("data", JSON.stringify(parsed.data));
              for (const f of files) form.append("files", f);
              return form;
            })()
          : JSON.stringify(parsed.data);
      const res = await adminFetch(getToken, initial ? `/hotels/${initial.id}` : "/hotels", {
        method: initial ? "PUT" : "POST",
        body,
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
        <label className={label}>Hotel name*<Input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className={label}>Slug (auto if empty)<Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="the-siam-riverside" /></label>
        <label className={label}>Location*<Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bangkok" required /></label>
        <label className={label}>Region<Input value={region} onChange={(e) => setRegion(e.target.value)} /></label>
        <label className={label}>Star rating
          <select value={stars} onChange={(e) => setStars(e.target.value)} className={input}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{`${n} star${n === 1 ? "" : "s"}`}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Check-in<input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} placeholder="14:00" className={input} /></label>
          <label className={label}>Check-out<input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} placeholder="12:00" className={input} /></label>
        </div>
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
      <div>
        <p className={label}>Gallery</p>
        <div className="mt-2">
          <GalleryPicker
            urls={galleryUrls}
            files={files}
            max={12}
            onPick={pickFiles}
            onRemoveUrl={(i) => setGalleryUrls((u) => u.filter((_, j) => j !== i))}
            onRemoveFile={(i) => setFiles((fs) => fs.filter((_, j) => j !== i))}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image URL and press Add"
          />
          <Button type="button" variant="outline" onClick={addUrl}>
            Add
          </Button>
        </div>
      </div>
      <label className={label}>Amenities (one per line)<textarea value={amenities} onChange={(e) => setAmenities(e.target.value)} rows={4} placeholder="Infinity pool&#10;Free WiFi throughout" className={area} /></label>
      <div>
        <p className="text-sm font-medium">Room types* (price = USD per room per night)</p>
        <div className="mt-2 space-y-2">
          {roomRows.map((row, i) => (
            <div key={i} className="flex gap-2 rounded-md border p-2">
              <div className="flex-1 space-y-2">
                <Input value={row.name} onChange={(e) => setRoomRows((r) => r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Deluxe River View" />
                <Input value={row.description} onChange={(e) => setRoomRows((r) => r.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} placeholder="What makes this room special" />
                <div className="flex gap-2">
                  <input type="number" min={1} value={row.price} onChange={(e) => setRoomRows((r) => r.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} placeholder="$ / night" aria-label={`Room ${i + 1} price per night in USD`} className={input} />
                  <input type="number" min={1} max={10} value={row.maxGuests} onChange={(e) => setRoomRows((r) => r.map((x, j) => (j === i ? { ...x, maxGuests: e.target.value } : x)))} placeholder="Sleeps" aria-label={`Room ${i + 1} max guests`} className={input} />
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRoomRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove room ${i + 1}`}>
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setRoomRows((r) => [...r, { name: "", price: "", maxGuests: "2", description: "" }])}>
          + Add room type
        </Button>
      </div>
      <label className={label}>Cancellation policy<textarea value={policies} onChange={(e) => setPolicies(e.target.value)} rows={2} className={area} /></label>
      {error ? <p role="alert" className="text-sm font-medium text-red-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Create hotel"}</Button>
      </div>
    </form>
  );
}
