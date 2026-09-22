import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

export default function ContactPage() {
  const href = SUPPORT_WHATSAPP
    ? `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hi GoHoliday! I'd like to plan a trip.")}`
    : null;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Talk to a human</h1>
      <p className="mt-2 text-muted-foreground">
        Custom dates, bigger groups, honeymoon tweaks — message us and we plan it with you.
      </p>
      <div className="mt-8 rounded-xl border p-8">
        {href ? (
          <Button size="lg" asChild>
            <Link href={href} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
              Chat on WhatsApp
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Our WhatsApp line is being set up — meanwhile, browse the packages and send a booking
            request for anything you like.
          </p>
        )}
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/packages">Browse packages</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
