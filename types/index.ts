// GoHoliday data contract — THE single source of truth for trip data shapes.
// UI and API routes must both conform to these types (contract-first).

export type CurrencyCode = "USD" | "EUR" | "NPR" | "THB";

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export type PackageStatus = "draft" | "published";

export interface Package {
  id: string;
  slug: string;
  title: string;
  destination: string;
  region: string;
  category: string;
  short_description: string;
  description: string;
  duration_days: number;
  duration_nights: number;
  /** Price per person in USD cents — the single base price. Display currencies derive from it. */
  base_price_cents: number;
  max_group_size: number | null;
  departure_city: string | null;
  gallery: GalleryImage[];
  highlights: string[];
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  meeting_point: string | null;
  policies: string | null;
  status: PackageStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for cards and grids. */
export interface PackageSummary {
  id: string;
  slug: string;
  title: string;
  destination: string;
  category: string;
  duration_days: number;
  duration_nights: number;
  base_price_cents: number;
  short_description: string;
  featured: boolean;
  cover: GalleryImage | null;
}

export interface CurrencyRate {
  code: CurrencyCode;
  /** Units of this currency per 1 USD. */
  rate: number;
  updated_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  package_id: string;
  package_title: string;
  destination: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  rooms: number;
  /** Snapshot in USD cents at booking time — rate changes never rewrite history. */
  total_price_cents: number;
  currency_code: CurrencyCode;
  total_price_display: number;
  status: BookingStatus;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelRoomType {
  name: string;
  /** Per room per night, in USD cents. */
  price_cents_per_night: number;
  max_guests: number;
  description: string;
}

export type HotelStatus = "draft" | "published";

export interface Hotel {
  id: string;
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
  room_types: HotelRoomType[];
  /** Cheapest room's nightly rate in USD cents — maintained on save, for sorting/cards. */
  from_price_cents: number;
  policies: string | null;
  status: HotelStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for cards and grids. */
export interface HotelSummary {
  id: string;
  slug: string;
  name: string;
  location: string;
  star_rating: number;
  from_price_cents: number;
  short_description: string;
  featured: boolean;
  cover: GalleryImage | null;
}

export interface HotelBooking {
  id: string;
  booking_ref: string;
  user_id: string;
  hotel_id: string;
  hotel_name: string;
  room_type_name: string;
  /** Snapshot in USD cents at booking time — rate changes never rewrite history. */
  price_per_night_cents: number;
  start_date: string;
  end_date: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  /** Snapshot in USD cents: rate × nights × rooms. */
  total_price_cents: number;
  currency_code: CurrencyCode;
  total_price_display: number;
  status: BookingStatus;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
