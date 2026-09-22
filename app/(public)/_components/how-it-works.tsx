import { CalendarCheck, MessagesSquare, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Find your trip",
    text: "Browse handpicked Thailand packages and pick dates that suit you.",
  },
  {
    icon: CalendarCheck,
    title: "2. Reserve in a minute",
    text: "Send a booking request — no payment now, our team confirms availability.",
  },
  {
    icon: MessagesSquare,
    title: "3. Travel easy",
    text: "Meet your guide, follow your day-by-day plan, message us anytime.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border bg-background p-5">
              <step.icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
