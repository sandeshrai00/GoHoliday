import { Check, X } from "lucide-react";

export default function InclusionsExclusions({ includes, excludes }: { includes: string[]; excludes: string[] }) {
  if (includes.length === 0 && excludes.length === 0) return null;
  return (
    <section aria-label="What's included" className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border p-4">
        <h2 className="font-bold">What&apos;s included</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {includes.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="font-bold">Not included</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {excludes.map((item) => (
            <li key={item} className="flex gap-2">
              <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
