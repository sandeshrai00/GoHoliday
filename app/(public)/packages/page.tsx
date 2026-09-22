import { Suspense } from "react";
import PackagesBrowser from "./_components/packages-browser";

export default function PackagesPage() {
  return (
    <Suspense>
      <PackagesBrowser />
    </Suspense>
  );
}
