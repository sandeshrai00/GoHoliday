/// <reference types="vite/client" />
"use client";

import { ClerkProvider } from "@clerk/react";
import type { ReactNode } from "react";

export default function ClerkClientProvider({ children }: { children: ReactNode }) {
  return <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
}
