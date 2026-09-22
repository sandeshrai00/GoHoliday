import type { GalleryImage } from "@/types";

/** Demo hotels. Real content replaces this via Admin → Hotels later. */
export interface SeedHotel {
  slug: string;
  name: string;
  location: string;
  region: string;
  star_rating: number;
  short_description: string;
  description: string;
  gallery: GalleryImage[];
  amenities: string[];
  check_in_time: string;
  check_out_time: string;
  room_types: Array<{ name: string; price_cents_per_night: number; max_guests: number; description: string }>;
  policies: string;
  status: "draft" | "published";
  featured: boolean;
}

const img = (id: string, alt: string): GalleryImage => ({
  url: `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`,
  alt,
});

const STANDARD_POLICIES =
  "Free cancellation up to 7 days before check-in. 50% refund for cancellations 3–6 days before check-in. No refund within 48 hours of check-in. Check-in from 14:00, check-out until 12:00. Valid ID required at check-in.";

const fromPrice = (rooms: SeedHotel["room_types"]) => Math.min(...rooms.map((r) => r.price_cents_per_night));

export const SEED_HOTELS: SeedHotel[] = [
  {
    slug: "the-siam-riverside",
    name: "The Siam Riverside",
    location: "Bangkok",
    region: "Thailand",
    star_rating: 5,
    short_description: "Five-star calm on the Chao Phraya — private pier, infinity pool, suites with river views.",
    description:
      "A riverside sanctuary ten minutes by hotel boat from Saphan Taksin BTS. Days start with breakfast above the river, end with a sundowner at the rooftop bar. Rooms face the water; suites add separate living areas and deep soaking tubs.",
    gallery: [
      img("1566073771259-6a8506099945", "Resort pool at dusk"),
      img("1582719508461-905c673771fd", "Deluxe river-view room"),
      img("1578683010236-d716f9a3f461", "Suite bedroom"),
    ],
    amenities: ["Infinity pool facing the river", "Free private pier shuttle", "Spa and fitness center", "2 restaurants + rooftop bar", "Free WiFi throughout", "Airport transfer on request"],
    check_in_time: "14:00",
    check_out_time: "12:00",
    room_types: [
      { name: "Deluxe River View", price_cents_per_night: 18000, max_guests: 2, description: "King bed, floor-to-ceiling river view, rain shower." },
      { name: "Executive Suite", price_cents_per_night: 32000, max_guests: 3, description: "Separate living room, club lounge access, soaking tub." },
      { name: "Royal Thai Suite", price_cents_per_night: 55000, max_guests: 4, description: "Top floor, panoramic terrace, private dining service." },
    ],
    policies: STANDARD_POLICIES,
    status: "published",
    featured: true,
  },
  {
    slug: "doi-suthep-retreat",
    name: "Doi Suthep Mountain Retreat",
    location: "Chiang Mai",
    region: "Thailand",
    star_rating: 4,
    short_description: "Cool mountain air, temple views and Lanna-style villas on Doi Suthep's slopes.",
    description:
      "Fifteen minutes above Chiang Mai's old city, the retreat sits in tropical gardens with views down the valley. Teak villas, a saltwater pool, and evening khantoke dinners. The night bazaar run is a 20-minute songthaew ride.",
    gallery: [
      img("1520250497591-112f2f40a3f4", "Resort pool and palms"),
      img("1590490360182-c33d57733427", "Garden room interior"),
      img("1584132967334-10e028bd69f7", "Private pool villa"),
    ],
    amenities: ["Saltwater pool", "Free WiFi throughout", "On-site Thai restaurant", "Yoga deck with valley view", "Free parking", "Tour desk for Doi Suthep temple"],
    check_in_time: "14:00",
    check_out_time: "12:00",
    room_types: [
      { name: "Garden Room", price_cents_per_night: 9500, max_guests: 2, description: "Ground floor, terrace opening to the gardens." },
      { name: "Mountain View Deluxe", price_cents_per_night: 14000, max_guests: 2, description: "Upper floor balcony with valley and temple views." },
      { name: "Private Pool Villa", price_cents_per_night: 26000, max_guests: 3, description: "Standalone teak villa with plunge pool and outdoor shower." },
    ],
    policies: STANDARD_POLICIES,
    status: "published",
    featured: true,
  },
  {
    slug: "andaman-pearl-resort",
    name: "Andaman Pearl Beach Resort",
    location: "Phuket",
    region: "Thailand",
    star_rating: 4,
    short_description: "Steps from Kamala Beach — sea-view rooms, beach bar and a pool that meets the horizon.",
    description:
      "On Kamala's quiet northern stretch, the resort pairs direct beach access with family-friendly pools and a beachfront bar for sunset. Patong's nightlife is 15 minutes away; the hotel runs a free shuttle twice daily.",
    gallery: [
      img("1571896349842-33c89424de2d", "Beachfront pool"),
      img("1611892440504-42a792e24d32", "Superior sea-view room"),
      img("1542314831-068cd1dbfeeb", "Resort at night"),
    ],
    amenities: ["Direct beach access", "2 pools incl. kids pool", "Beachfront bar and restaurant", "Free WiFi throughout", "Kids club (4–12 yrs)", "Free shuttle to Patong twice daily"],
    check_in_time: "14:00",
    check_out_time: "12:00",
    room_types: [
      { name: "Superior Sea View", price_cents_per_night: 12000, max_guests: 2, description: "Balcony over the Andaman Sea, queen bed." },
      { name: "Beachfront Deluxe", price_cents_per_night: 19000, max_guests: 3, description: "Ground floor with terrace steps from the sand." },
      { name: "Family Suite", price_cents_per_night: 24000, max_guests: 4, description: "Two connecting rooms, bunk corner for kids." },
    ],
    policies: STANDARD_POLICIES,
    status: "published",
    featured: false,
  },
];

export const SEED_HOTEL_ROWS = SEED_HOTELS.map((h) => ({
  slug: h.slug,
  name: h.name,
  location: h.location,
  region: h.region,
  star_rating: h.star_rating,
  short_description: h.short_description,
  description: h.description,
  gallery: h.gallery,
  amenities: h.amenities,
  check_in_time: h.check_in_time,
  check_out_time: h.check_out_time,
  room_types: h.room_types,
  from_price_cents: fromPrice(h.room_types),
  policies: h.policies,
  status: h.status,
  featured: h.featured,
  updated_at: new Date().toISOString(),
}));
