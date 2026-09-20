import type { ReactNode } from "react";
import Header from "@/components/layout/header";
import Protected from "@/components/site/protected";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Protected>{children}</Protected>
    </>
  );
}
