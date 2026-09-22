import { getDestinations, listPackages } from "@/lib/catalog";
import FeaturedPackages from "./_components/featured-packages";
import HomeHero from "./_components/home-hero";
import HowItWorks from "./_components/how-it-works";

export default async function HomePage() {
  const [{ items: featured }, destinations] = await Promise.all([
    listPackages({ featured: true, limit: 3 }),
    getDestinations(),
  ]);
  return (
    <>
      <HomeHero destinations={destinations.map((d) => d.name)} />
      <FeaturedPackages items={featured} />
      <HowItWorks />
    </>
  );
}
