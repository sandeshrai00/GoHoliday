import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-16rem)]">{children}</main>
      <Footer />
    </>
  );
}
