"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarCheck, LayoutDashboard, Luggage, ReceiptText, Settings2 } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/packages", label: "Packages", icon: Luggage },
  { href: "/admin/bookings", label: "Bookings", icon: ReceiptText },
  { href: "/admin/hotels", label: "Hotels", icon: BedDouble },
  { href: "/admin/hotel-bookings", label: "Hotel bookings", icon: CalendarCheck },
  { href: "/admin/rates", label: "Rates", icon: Settings2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <link.icon className="h-4 w-4" aria-hidden />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        View site
      </Link>
    </nav>
  );
}
