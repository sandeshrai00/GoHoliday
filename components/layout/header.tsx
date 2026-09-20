"use client";

import Link from "next/link";
import { Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            G
          </span>
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Show when="signed-out">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <UserMenu />
          </Show>
        </nav>
      </div>
    </header>
  );
}
