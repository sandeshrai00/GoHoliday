import { getDestinations, listPackages } from "@/lib/catalog";
import { listHotels } from "@/lib/hotels";
import FeaturedHotels from "./_components/featured-hotels";
import FeaturedPackages from "./_components/featured-packages";
import HomeHero from "./_components/home-hero";
import HowItWorks from "./_components/how-it-works";

export default async function HomePage() {
  const [{ items: featured }, destinations, { items: hotels }] = await Promise.all([
    listPackages({ featured: true, limit: 3 }),
    getDestinations(),
    listHotels({ limit: 3 }),
  ]);
  return (
    <>
      <HomeHero destinations={destinations.map((d) => d.name)} />
      <FeaturedPackages items={featured} />
      <FeaturedHotels items={hotels} />
      <HowItWorks />
    </>
  );
}
