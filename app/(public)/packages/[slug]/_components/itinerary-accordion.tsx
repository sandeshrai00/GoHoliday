import type { ItineraryDay } from "@/types";

export default function ItineraryAccordion({ days }: { days: ItineraryDay[] }) {
  if (days.length === 0) return null;
  return (
    <section aria-label="Day by day itinerary">
      <h2 className="text-xl font-bold">Day by day</h2>
      <div className="mt-3 space-y-2">
        {[...days]
          .sort((a, b) => a.day - b.day)
          .map((day) => (
            <details key={day.day} className="rounded-xl border bg-background p-4">
              <summary className="cursor-pointer font-semibold">
                Day {day.day} — {day.title}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{day.description}</p>
            </details>
          ))}
      </div>
    </section>
  );
}
