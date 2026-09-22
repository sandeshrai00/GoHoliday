import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

interface GalleryPickerProps {
  urls: string[];
  files: File[];
  max: number;
  onPick: (picked: FileList | null) => void;
  onRemoveUrl: (index: number) => void;
  onRemoveFile: (index: number) => void;
}

function Thumb({ src, alt, isNew, onRemove }: { src: string; alt: string; isNew: boolean; onRemove: () => void }) {
  return (
    <li className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          e.currentTarget.style.opacity = "0.25";
        }}
        className="h-24 w-24 rounded-md border object-cover"
      />
      {isNew ? (
        <span
          title="New — uploads to storage only when you save"
          className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white"
        />
      ) : null}
      <button
        type="button"
        aria-label={`Remove ${alt}`}
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white"
      >
        ✕
      </button>
    </li>
  );
}

export default function GalleryPicker({ urls, files, max, onPick, onRemoveUrl, onRemoveFile }: GalleryPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const total = urls.length + files.length;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        tabIndex={-1}
        aria-hidden
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) onPick(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"
        }`}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium">Click to browse or drag &amp; drop</span>
        <span className="text-xs text-muted-foreground">JPEG · PNG · WebP · max 5 MB each · sent only when you save</span>
      </button>
      {total > 0 ? (
        <>
          <ul className="mt-3 flex flex-wrap gap-2">
            {urls.map((u, i) => (
              <Thumb key={`url-${i}-${u}`} src={u} alt={`Gallery image ${i + 1}`} isNew={false} onRemove={() => onRemoveUrl(i)} />
            ))}
            {files.map((f, i) => (
              <Thumb
                key={`file-${f.name}-${f.size}-${i}`}
                src={URL.createObjectURL(f)}
                alt={f.name}
                isNew
                onRemove={() => onRemoveFile(i)}
              />
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {total} / {max} images
            {files.length > 0 ? <span> · <span className="text-amber-600">●</span> uploads when you save</span> : null}
          </p>
        </>
      ) : null}
    </div>
  );
}
