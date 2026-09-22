import { z } from "zod";

// ponytail: CLIENT-SAFE — zod only, no server imports. Shared by admin forms
// (browser) and admin API routes (server): one contract, both sides.

const lines = (max: number) =>
  z
    .array(z.string().trim().min(1).max(300))
    .max(max)
    .default([]);

export const packageSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .regex(/^[a-z0-9-]*$/, "Slug: lowercase letters, numbers, hyphens only")
    .optional(),
  destination: z.string().trim().min(2).max(80),
  region: z.string().trim().max(80).default("Thailand"),
  category: z.string().trim().min(2).max(60),
  short_description: z.string().trim().min(10).max(300),
  description: z.string().trim().max(8000).default(""),
  duration_days: z.number().int().min(1).max(60),
  duration_nights: z.number().int().min(0).max(60),
  /** Dollars in the form, converted to cents server-side. */
  base_price_usd: z.number().min(1).max(1000000),
  max_group_size: z.number().int().min(1).max(100).nullable().default(null),
  departure_city: z.string().trim().max(80).default(""),
  gallery_urls: z.array(z.string().trim().url().max(500)).max(12).default([]),
  highlights: lines(20),
  itinerary: z
    .array(
      z.object({
        day: z.number().int().min(1).max(60),
        title: z.string().trim().min(1).max(140),
        description: z.string().trim().min(1).max(2000),
      }),
    )
    .max(60)
    .default([]),
  includes: lines(30),
  excludes: lines(30),
  meeting_point: z.string().trim().max(500).default(""),
  policies: z.string().trim().max(4000).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

export type PackageFormValues = z.infer<typeof packageSchema>;

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

export const ratesSchema = z.object({
  rates: z.object({
    EUR: z.number().min(0.01).max(10000),
    NPR: z.number().min(0.01).max(10000),
    THB: z.number().min(0.01).max(10000),
  }),
});
