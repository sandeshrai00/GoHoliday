import Link from "next/link";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              G
            </span>
            {SITE_NAME}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Handpicked Thailand holidays, booked your way.</p>
        </div>
        <nav aria-label="Explore">
          <p className="mb-3 text-sm font-semibold">Explore</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="mb-3 text-sm font-semibold">Account</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/sign-in" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className="hover:text-foreground">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-foreground">
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Demo catalog — prices in USD, EUR, NPR and THB.
        </p>
      </div>
    </footer>
  );
}
