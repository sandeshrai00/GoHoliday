import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { Toaster } from "sonner";
import ClerkClientProvider from "@/components/providers/clerk-provider";
import { CurrencyProvider } from "@/components/site/use-currency";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClerkClientProvider>
          <CurrencyProvider>
            {children}
            <Toaster richColors position="top-center" />
          </CurrencyProvider>
        </ClerkClientProvider>
      </body>
    </html>
  );
}
