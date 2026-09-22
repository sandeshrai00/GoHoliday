import { Suspense } from "react";
import HotelsBrowser from "./_components/hotels-browser";

export default function HotelsPage() {
  return (
    <Suspense>
      <HotelsBrowser />
    </Suspense>
  );
}
