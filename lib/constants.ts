export const SITE_NAME = "GoHoliday";
export const SITE_TAGLINE = "Handpicked holidays, booked your way.";

export const NAV_LINKS = [
  { href: "/packages", label: "Packages" },
  { href: "/hotels", label: "Hotels" },
  { href: "/destinations", label: "Destinations" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

/** WhatsApp number in international format, digits only. Empty = contact CTAs hidden until set. */
export const SUPPORT_WHATSAPP = "";

export const FAQS = [
  {
    q: "How do I book a trip?",
    a: "Pick a package, choose your dates and group size, and send a booking request. Our team confirms availability — no payment is taken online.",
  },
  {
    q: "How do I pay?",
    a: "After we confirm your booking, we share payment instructions (bank transfer and local options). You only pay once your trip is confirmed.",
  },
  {
    q: "What currencies are prices shown in?",
    a: "USD, EUR, NPR and THB. Switch anytime with the currency picker in the header — the rate is locked at booking time.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 7 days before departure, 50% refund 3–6 days before, no refund within 48 hours. Each package page lists its exact policy.",
  },
  {
    q: "Are island trips guaranteed to run?",
    a: "Boat trips depend on sea conditions. If the operator cancels for safety, we reschedule you or refund that day in full.",
  },
  {
    q: "Do I need a visa for Thailand?",
    a: "Many nationalities get visa-free entry or visa on arrival. Check your country's current rules before booking — we're happy to point you to official sources.",
  },
] as const;
