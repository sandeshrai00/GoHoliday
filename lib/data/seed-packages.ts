import type { GalleryImage, ItineraryDay } from "@/types";

/** Demo catalog. Real content replaces this via Admin → Packages later. */
export interface SeedPackage {
  slug: string;
  title: string;
  destination: string;
  region: string;
  category: string;
  short_description: string;
  description: string;
  duration_days: number;
  duration_nights: number;
  base_price_cents: number;
  max_group_size: number;
  departure_city: string;
  gallery: GalleryImage[];
  highlights: string[];
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  meeting_point: string;
  policies: string;
  status: "draft" | "published";
  featured: boolean;
}

const img = (id: string, alt: string): GalleryImage => ({
  url: `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`,
  alt,
});

const STANDARD_INCLUDES = [
  "Handpicked hotels with daily breakfast",
  "All transfers in air-conditioned vehicles",
  "English-speaking local guide",
  "All sightseeing tickets mentioned in the itinerary",
];

const STANDARD_EXCLUDES = [
  "International flights to Thailand",
  "Thailand visa fees (if applicable)",
  "Lunches and dinners unless mentioned",
  "Personal expenses and travel insurance",
];

const STANDARD_POLICIES =
  "Free cancellation up to 7 days before departure. 50% refund for cancellations 3–6 days before departure. No refund within 48 hours of departure. GoHoliday reserves the right to adjust the itinerary for weather or safety reasons.";

export const SEED_PACKAGES: SeedPackage[] = [
  {
    slug: "bangkok-city-explorer",
    title: "Bangkok City Explorer",
    destination: "Bangkok",
    region: "Thailand",
    category: "City Break",
    short_description:
      "Grand palaces, floating markets and rooftop nights — the essential Bangkok long weekend.",
    description:
      "Three days in Thailand's electric capital. Cruise the Chao Phraya river, stand in awe at the Grand Palace and Wat Pho, haggle your way through Chatuchak market and end the night on a rooftop above Sukhumvit. Perfect first taste of Thailand.",
    duration_days: 3,
    duration_nights: 2,
    base_price_cents: 19900,
    max_group_size: 16,
    departure_city: "Bangkok",
    gallery: [
      img("1504214208698-ea1916a2195a", "Bangkok street at dusk"),
      img("1559592413-7cec4d0cae2b", "Grand Palace Bangkok"),
      img("1488646953014-85cb44e25828", "Traveler exploring Bangkok"),
    ],
    highlights: [
      "Grand Palace and Wat Pho with a local guide",
      "Chao Phraya river cruise at sunset",
      "Damnoen Saduak floating market morning trip",
      "Rooftop dinner above Sukhumvit",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Bangkok",
        description:
          "Airport pickup and check-in. Evening Chao Phraya river cruise with dinner on board.",
      },
      {
        day: 2,
        title: "Palaces, Temples and Floating Market",
        description:
          "Early start for Damnoen Saduak floating market, then the Grand Palace, Wat Pho and Wat Arun.",
      },
      {
        day: 3,
        title: "Markets and Rooftop Farewell",
        description:
          "Chatuchak weekend market (or MBK on weekdays), afternoon at leisure, rooftop farewell dinner.",
      },
    ],
    includes: STANDARD_INCLUDES,
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Suvarnabhumi Airport, arrivals hall, GoHoliday sign",
    policies: STANDARD_POLICIES,
    status: "published",
    featured: true,
  },
  {
    slug: "chiang-mai-doi-suthep",
    title: "Chiang Mai & Doi Suthep",
    destination: "Chiang Mai",
    region: "Thailand",
    category: "Culture & Heritage",
    short_description:
      "Mountain temples, night bazaars and an ethical elephant day in Thailand's cultural north.",
    description:
      "Four days in the Rose of the North. Climb the 306 steps to Wat Phra That Doi Suthep, spend a full day at an ethical elephant sanctuary (no riding), wander the Sunday Walking Street and learn to cook khao soi in a Thai cooking class.",
    duration_days: 4,
    duration_nights: 3,
    base_price_cents: 34900,
    max_group_size: 14,
    departure_city: "Chiang Mai",
    gallery: [
      img("1563492065599-3520f775eeed", "White temple in northern Thailand"),
      img("1470071459604-3b5ec3a7fe05", "Misty mountains near Chiang Mai"),
      img("1441974231531-c6227db76b6e", "Forest trail in Doi Inthanon"),
    ],
    highlights: [
      "Wat Phra That Doi Suthep at sunrise",
      "Full day at an ethical elephant sanctuary",
      "Thai cooking class with market visit",
      "Sunday Walking Street night market",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Chiang Mai",
        description: "Airport pickup, old city orientation walk and welcome dinner of khantoke.",
      },
      {
        day: 2,
        title: "Doi Suthep and Old City Temples",
        description:
          "Sunrise at Doi Suthep, then Wat Chedi Luang and Wat Phra Singh in the old city.",
      },
      {
        day: 3,
        title: "Elephant Sanctuary Day",
        description:
          "Full day feeding, bathing and walking with rescued elephants. No riding, ever.",
      },
      {
        day: 4,
        title: "Cooking Class and Departure",
        description:
          "Morning market visit and Thai cooking class, afternoon transfer to airport or station.",
      },
    ],
    includes: STANDARD_INCLUDES,
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Chiang Mai International Airport, arrivals hall, GoHoliday sign",
    policies: STANDARD_POLICIES,
    status: "published",
    featured: true,
  },
  {
    slug: "phuket-phi-phi-islands",
    title: "Phuket & Phi Phi Islands",
    destination: "Phuket",
    region: "Thailand",
    category: "Island Escape",
    short_description:
      "Maya Bay sunrises, snorkeling over coral gardens and Big Buddha sunsets.",
    description:
      "Five days between Phuket's beaches and the Phi Phi archipelago. Speedboat to Maya Bay before the crowds, snorkel coral gardens at Shark Point, catch sunset at Promthep Cape, and take a Thai cooking break in Old Phuket Town.",
    duration_days: 5,
    duration_nights: 4,
    base_price_cents: 54900,
    max_group_size: 18,
    departure_city: "Phuket",
    gallery: [
      img("1544644181-1484b3fdfc62", "Maya Bay Phi Phi Islands"),
      img("1528181304800-259b08848526", "Longtail boats on a Thai beach"),
      img("1514282401047-d79a71a590e8", "Aerial view of turquoise Andaman sea"),
    ],
    highlights: [
      "Maya Bay at sunrise before the day boats arrive",
      "Snorkeling at Shark Point and Bamboo Island",
      "Promthep Cape sunset viewpoint",
      "Old Phuket Town walking tour and local lunch",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Phuket",
        description: "Airport pickup, Patong beach afternoon, welcome seafood dinner.",
      },
      {
        day: 2,
        title: "Phi Phi Islands by Speedboat",
        description:
          "Maya Bay, Pileh Lagoon, Viking Cave and Monkey Beach with snorkeling stops.",
      },
      {
        day: 3,
        title: "Free Beach Day",
        description:
          "Day at leisure — optional spa, surf lesson or Big Buddha and Wat Chalong visit.",
      },
      {
        day: 4,
        title: "Old Town and Promthep Cape",
        description: "Sino-Portuguese old town, cashew factory, sunset at Promthep Cape.",
      },
      {
        day: 5,
        title: "Departure",
        description: "Morning at leisure, transfer to Phuket airport.",
      },
    ],
    includes: [...STANDARD_INCLUDES, "Phi Phi speedboat trip with snorkeling gear and lunch"],
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Phuket International Airport, arrivals hall, GoHoliday sign",
    policies:
      "Island trips are weather dependent and may be rescheduled for safety. " + STANDARD_POLICIES,
    status: "published",
    featured: true,
  },
  {
    slug: "krabi-four-islands",
    title: "Krabi & the Four Islands",
    destination: "Krabi",
    region: "Thailand",
    category: "Island Escape",
    short_description:
      "Railay's limestone cliffs, kayak lagoons and the famous Four Islands boat day.",
    description:
      "Four days on Thailand's most dramatic coastline. Kayak the mangroves of Ao Thalane, boat-hop Chicken Island, Poda, Tup and Phra Nang beach, and watch rock climbers on Railay's cliffs at golden hour.",
    duration_days: 4,
    duration_nights: 3,
    base_price_cents: 47900,
    max_group_size: 16,
    departure_city: "Krabi",
    gallery: [
      img("1552465011-b4e21bf6e79a", "Limestone cliffs of Railay beach"),
      img("1544551763-46a013bb70d5", "Kayaking in clear lagoon water"),
      img("1506929562872-bb421503ef21", "Tropical beach in Krabi"),
    ],
    highlights: [
      "Four Islands boat trip with snorkeling",
      "Sea-kayak the Ao Thalane mangrove canyons",
      "Railay beach and Phra Nang cave sunset",
      "Emerald Pool and hot springs half-day",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Ao Nang",
        description: "Airport pickup, sunset walk on Ao Nang beach, night market dinner.",
      },
      {
        day: 2,
        title: "Four Islands by Longtail Boat",
        description:
          "Chicken Island, Poda Island, Tup Island sandbar and Phra Nang beach with snorkeling.",
      },
      {
        day: 3,
        title: "Kayak and Hot Springs",
        description: "Morning kayak in Ao Thalane mangroves, afternoon Emerald Pool and hot springs.",
      },
      {
        day: 4,
        title: "Railay Morning and Departure",
        description: "Boat to Railay for a final swim, transfer to Krabi airport.",
      },
    ],
    includes: [...STANDARD_INCLUDES, "Four Islands boat trip and kayak tour with gear"],
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Krabi International Airport, arrivals hall, GoHoliday sign",
    policies:
      "Island trips are weather dependent and may be rescheduled for safety. " + STANDARD_POLICIES,
    status: "published",
    featured: false,
  },
  {
    slug: "koh-samui-beach-retreat",
    title: "Koh Samui Beach Retreat",
    destination: "Koh Samui",
    region: "Thailand",
    category: "Beach Retreat",
    short_description:
      "Slow days, spa afternoons and an Ang Thong marine park sailing day.",
    description:
      "Five unhurried days on the Gulf of Thailand. Stay steps from Chaweng beach, sail the 42 islands of Ang Thong marine park, visit the Big Buddha and Fisherman's Village, and fit in at least one proper Thai massage.",
    duration_days: 5,
    duration_nights: 4,
    base_price_cents: 64900,
    max_group_size: 12,
    departure_city: "Koh Samui",
    gallery: [
      img("1540541338287-41700207dee6", "Beachfront resort at dusk"),
      img("1520250497591-112f2f40a3f4", "Infinity pool overlooking the sea"),
      img("1530521954074-e64f6810b32d", "Sunset on a Samui beach"),
    ],
    highlights: [
      "Ang Thong marine park sailing and kayaking day",
      "Big Buddha, Wat Plai Laem and Fisherman's Village",
      "One 60-minute Thai massage included",
      "Beachfront resort with pool",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Koh Samui",
        description: "Airport pickup, check-in steps from Chaweng beach, evening at leisure.",
      },
      {
        day: 2,
        title: "Ang Thong Marine Park",
        description:
          "Full-day sailing: snorkeling, sea kayaking and the Emerald Lagoon viewpoint.",
      },
      {
        day: 3,
        title: "Island Temples and Spa",
        description: "Big Buddha and Wat Plai Laem, afternoon Thai massage, Fisherman's Village dinner.",
      },
      {
        day: 4,
        title: "Free Beach Day",
        description: "Entire day at leisure — optional island safari or cooking class.",
      },
      {
        day: 5,
        title: "Departure",
        description: "Morning swim, transfer to Samui airport.",
      },
    ],
    includes: [...STANDARD_INCLUDES, "Ang Thong sailing day trip", "One 60-minute Thai massage"],
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Koh Samui Airport, arrivals hall, GoHoliday sign",
    policies:
      "Marine park trip is weather dependent and may be rescheduled for safety. " + STANDARD_POLICIES,
    status: "published",
    featured: false,
  },
  {
    slug: "ayutthaya-heritage",
    title: "Ayutthaya Heritage Overnight",
    destination: "Ayutthaya",
    region: "Thailand",
    category: "Culture & Heritage",
    short_description:
      "Ancient temple ruins by bike, a river cruise and a night in the old capital.",
    description:
      "Two days in the UNESCO-listed former capital of Siam. Cycle between brick prangs and Buddha heads wrapped in banyan roots, cruise the rivers at sunset, and sleep in a riverside heritage hotel.",
    duration_days: 2,
    duration_nights: 1,
    base_price_cents: 15900,
    max_group_size: 12,
    departure_city: "Bangkok",
    gallery: [
      img("1537996194471-e657df975ab4", "Ancient temple ruins"),
      img("1508672019048-805c876b67e2", "Traveler planning the temple route"),
      img("1530789253388-582c481c54b0", "Exploring heritage sites"),
    ],
    highlights: [
      "Wat Mahathat's famous Buddha head in banyan roots",
      "Guided cycling loop of the historical park",
      "Sunset river cruise around the island city",
      "Riverside heritage hotel stay",
    ],
    itinerary: [
      {
        day: 1,
        title: "Bangkok to Ayutthaya",
        description:
          "Morning train or van from Bangkok, afternoon cycling tour of Wat Mahathat, Wat Ratchaburana and Wat Chai Watthanaram, sunset river cruise.",
      },
      {
        day: 2,
        title: "Bang Pa-In and Return",
        description: "Bang Pa-In Summer Palace, local roti sai mai tasting, return to Bangkok by evening.",
      },
    ],
    includes: STANDARD_INCLUDES,
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Hua Lamphong Station, Bangkok, main hall, GoHoliday sign",
    policies: STANDARD_POLICIES,
    status: "published",
    featured: false,
  },
  {
    slug: "golden-triangle-adventure",
    title: "Golden Triangle Adventure",
    destination: "Chiang Rai",
    region: "Thailand",
    category: "Adventure",
    short_description:
      "White Temple, Mekong boat rides and hill-tribe trails at Thailand's northern tip.",
    description:
      "Six days where Thailand meets Laos and Myanmar. The White Temple at opening time, a slow boat on the Mekong, tea trails around Doi Mae Salong, and two days trekking hill-tribe villages with a local guide.",
    duration_days: 6,
    duration_nights: 5,
    base_price_cents: 79900,
    max_group_size: 10,
    departure_city: "Chiang Rai",
    gallery: [
      img("1501785888041-af3ef285b470", "Mountain lake at sunrise"),
      img("1476514525535-07fb3b4ae5f1", "Canoe on a calm mountain lake"),
      img("1469854523086-cc02fe5d8800", "Road trip through the northern hills"),
    ],
    highlights: [
      "Wat Rong Khun (White Temple) at opening time",
      "Mekong river slow-boat to the Golden Triangle viewpoint",
      "Doi Mae Salong tea plantation trails",
      "Two-day hill-tribe village trek with homestay night",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Chiang Rai",
        description: "Airport pickup, night bazaar and Clock Tower light show.",
      },
      {
        day: 2,
        title: "White Temple and Blue Temple",
        description: "Wat Rong Khun at opening, Wat Rong Suea Ten, Baan Dam (Black House).",
      },
      {
        day: 3,
        title: "Golden Triangle and Mekong",
        description: "Slow-boat on the Mekong, Golden Triangle viewpoint, Hall of Opium museum.",
      },
      {
        day: 4,
        title: "Doi Mae Salong Tea Trails",
        description: "Tea plantation walks, hill-tribe market, sunset over Myanmar.",
      },
      {
        day: 5,
        title: "Trek and Homestay",
        description: "Trek to Akha and Lahu villages, homestay night with a host family.",
      },
      {
        day: 6,
        title: "Trek Out and Departure",
        description: "Morning trek out, lunch in Mae Salong, transfer to Chiang Rai airport.",
      },
    ],
    includes: [...STANDARD_INCLUDES, "Licensed trekking guide and homestay night"],
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Chiang Rai International Airport, arrivals hall, GoHoliday sign",
    policies:
      "Trek routes may change with trail conditions. " + STANDARD_POLICIES,
    status: "draft",
    featured: false,
  },
  {
    slug: "pattaya-coral-island",
    title: "Pattaya & Coral Island",
    destination: "Pattaya",
    region: "Thailand",
    category: "City Break",
    short_description:
      "Big Buddha views, Koh Larn's clear water and Nong Nooch gardens — Bangkok's easy weekend escape.",
    description:
      "Three days in the Gulf's liveliest resort city. Ferry to Koh Larn for swimming and parasailing, viewpoints from Big Buddha hill, the orchid gardens of Nong Nooch, and Walking Street after dark (optional, obviously).",
    duration_days: 3,
    duration_nights: 2,
    base_price_cents: 22900,
    max_group_size: 20,
    departure_city: "Bangkok",
    gallery: [
      img("1507525428034-b723cf961d3e", "Clear water beach"),
      img("1573843981267-be1999ff37cd", "Aerial view of island and boats"),
      img("1559827260-dc66d52bef19", "Ocean waves"),
    ],
    highlights: [
      "Koh Larn (Coral Island) full beach day with lunch",
      "Big Buddha hill and Pattaya viewpoint",
      "Nong Nooch tropical gardens",
      "Optional Walking Street evening walk",
    ],
    itinerary: [
      {
        day: 1,
        title: "Bangkok to Pattaya",
        description: "Van transfer, beach afternoon, Big Buddha viewpoint at sunset.",
      },
      {
        day: 2,
        title: "Koh Larn Island Day",
        description: "Ferry to Coral Island — swim, snorkel, optional parasailing, beachside lunch.",
      },
      {
        day: 3,
        title: "Nong Nooch and Return",
        description: "Morning at Nong Nooch gardens, return to Bangkok by evening.",
      },
    ],
    includes: [...STANDARD_INCLUDES, "Koh Larn ferry and beachside lunch"],
    excludes: STANDARD_EXCLUDES,
    meeting_point: "Bangkok hotel pickup (central areas) or Ekkamai bus station",
    policies: STANDARD_POLICIES,
    status: "published",
    featured: false,
  },
];
