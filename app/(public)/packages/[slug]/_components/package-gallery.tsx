"use client";

import { useState } from "react";
import type { GalleryImage } from "@/types";

export default function PackageGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-muted">
        <img
          src={current.url}
          alt={current.alt || title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-2 grid grid-cols-3 gap-2" role="tablist" aria-label="Package photos">
          {images.map((image, i) => (
            <button
              key={image.url}
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-lg bg-muted ring-offset-2 ${i === active ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"}`}
            >
              <img src={image.url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
