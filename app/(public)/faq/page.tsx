import { FAQS } from "@/lib/constants";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mt-1 text-muted-foreground">Booking, payment, cancellation and travel basics.</p>
      <div className="mt-6 space-y-3">
        {FAQS.map((faq) => (
          // ponytail: native <details> — free, accessible, no accordion dependency.
          <details key={faq.q} className="group rounded-xl border bg-background p-4">
            <summary className="cursor-pointer font-semibold group-hover:text-primary">
              {faq.q}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
