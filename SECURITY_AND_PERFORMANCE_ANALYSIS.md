# Full Project Analysis: Performance, API Loops, Security & Bugs

**Project:** Next.js 15 (App Router) + React 19, Turso/Drizzle, Supabase  
**Scope:** All code files under `app/`, `components/`, `lib/`, `middleware.js`, API routes, and config.

---

## 1. Performance (What Can Slow Down the Website)

### 1.1 Server / Data fetching

| Location | Issue | Impact |
|----------|--------|--------|
| **`app/[lang]/(home)/page.js`** | `getActiveAnnouncements(lang)` and `getFeaturedTours(lang)` run **sequentially** | Two round-trips to DB one after the other. Can run in parallel with `Promise.all([getActiveAnnouncements(lang), getFeaturedTours(lang)])`. |
| **`app/[lang]/tours/page.js`** | `getAllTours(lang)` loads **all tours** with no limit | With hundreds of tours, response size and query time grow. Consider pagination or a reasonable limit (e.g. 100–200) and/or cursor-based loading. |
| **`app/admin/dashboard/page.js`** | `getStats()` runs 3 separate count queries; then `getAllTours()` runs. All **sequential** | 4 sequential DB calls. Run the 3 counts in parallel with `Promise.all`, and optionally run `getAllTours()` in parallel with `getStats()`. |
| **`lib/translate.js`** | Tour create/update triggers **6 external HTTP calls** (Google Translate gtx) per request | Each admin tour save waits for 6 translations. High latency and dependency on an unofficial endpoint. Consider making translation optional/async or batching. |
| **`app/auth/callback/route.js`** | New Supabase client created on every callback request | Minor; could reuse a module-level client if you want to avoid repeated instantiation. |

### 1.2 Caching and headers

| Location | Issue | Impact |
|----------|--------|--------|
| **`next.config.js`** | `Cache-Control: no-cache, no-store, must-revalidate` on almost all routes | Good for always-fresh data but can increase server load and slow perceived performance. Consider caching static or rarely changing routes (e.g. `/privacy`, `/contact`) or using short max-age for list pages. |
| **`export const dynamic = 'force-dynamic'`** | Used on home, tours, tour detail | Every request is dynamic; no static optimization. Acceptable if data must always be fresh; otherwise consider ISR or shorter revalidation. |

### 1.3 Client-side

| Location | Issue | Impact |
|----------|--------|--------|
| **`components/CurrencyProvider.js`** | Fetches exchange rates from external API on mount and every 1 hour | Single fetch + hourly refresh is reasonable. Interval is cleared on unmount. No bug; optional improvement: use AbortController for fetch. |
| **`components/TourReviews.js`** | Fetches reviews once on mount + on auth change; no polling | No performance issue. |

**Summary (performance):** Biggest wins are (1) parallelizing independent DB calls on home and admin dashboard, (2) limiting or paginating tours list, (3) reducing or deferring translation calls on tour create/update.

---

## 2. API Loops and Repeated Calls

| Location | Finding |
|----------|--------|
| **`app/api/reviews/translate/route.js`** | **`setInterval(..., 5 * 60 * 1000)`** runs a cleanup every 5 minutes. In serverless (e.g. Vercel), each invocation can start its own interval; intervals are not shared and may never be cleared, leading to multiple timers and unnecessary work. Prefer a time-based check inside the request (e.g. only clean when handling a request and enough time has passed) or a separate cron job. |
| **`components/CurrencyProvider.js`** | `setInterval(fetchRates, 3600000)` with cleanup on unmount. Not an infinite loop; acceptable. |
| **Admin bookings page** | Single `fetchBookings()` on mount and after status update. No polling loop. |
| **TourReviews** | One-time fetch + auth listener. No loop. |

**Summary:** Only the **translate route’s `setInterval`** is problematic in a serverless environment; it can be removed or replaced with request-scoped cleanup logic.

---

## 3. Security Threats and Hardening

### 3.1 Critical

| Location | Issue | Recommendation |
|----------|--------|----------------|
| **`lib/auth.js`** | If `SESSION_SECRET` is missing or &lt; 32 chars, code falls back to a **hardcoded placeholder**: `'INSECURE_PLACEHOLDER_SET_SESSION_SECRET_ENV_VAR_NOW'`. | **Never use a fallback.** Fail fast at startup (or on first use) if `SESSION_SECRET` is missing or short (e.g. refuse to create session / return 503) so cookies cannot be forged. |
| **`app/api/setup/migrations/*`** | Migration routes run **raw SQL** (`ALTER TABLE ...`) and are protected only by admin session. No one-time token or “migration mode” flag. | Restrict in production: disable route when `NODE_ENV === 'production'` or guard with a one-time secret in env. Prefer running migrations via CLI/scripts, not HTTP. |
| **`app/api/login/route.js`** | Generic error message is good; 1.5s delay on failure helps brute-force. | Consider adding rate limiting by IP (similar to translate route) to further limit brute-force. |

### 3.2 Input validation and ID handling

| Location | Issue | Recommendation |
|----------|--------|----------------|
| **`app/api/bookings/route.js` (PUT)** | `id` from body is used in `eq(bookingsSchema.id, id)` without ensuring it’s an integer. | Coerce and validate: `const safeId = parseInt(id, 10); if (Number.isNaN(safeId) || safeId < 1) return 400;` then use `safeId` in the update. |
| **`app/api/tours/update/route.js`** | `id` from body used in `eq(toursSchema.id, id)` without validation. | Same: parse to integer and reject invalid values. |
| **`app/api/tours/delete/route.js`** | `tourId` from body not validated as integer. | Same: validate positive integer before delete. |
| **`app/api/announcements/delete/route.js`** | `id` not validated as integer. | Same: validate positive integer. |
| **`app/api/announcements/toggle/route.js`** | `id` not validated as integer. | Same. |
| **`app/api/announcements/create/route.js`** | `type` is not validated; stored as-is (default `'banner'`). | Whitelist allowed types (e.g. `['banner', 'popup']`) and reject others. |
| **`app/[lang]/tours/[id]/page.js`** | `id` from URL passed to `getTour(id)`; `Number(id)` can be NaN for invalid slugs. | Validate before calling getTour: e.g. `const numId = Number(id); if (Number.isNaN(numId) || numId < 1) notFound();` then use `getTour(numId)` or keep current behavior (getTour returns null, notFound() is called). Optional but clearer. |

### 3.3 Other

| Location | Note |
|----------|------|
| **`app/auth/callback/route.js`** | Uses Supabase auth and `user.id` from session to update `profiles`. No IDOR; user updates own profile. |
| **`middleware.js`** | Admin check: `pathname.startsWith('/admin') && pathname !== '/admin'` correctly leaves `/admin` (login) public and protects `/admin/*`. |
| **`next.config.js`** | Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.) are set. Good. |
| **Bookings POST** | Email format, tour_id, contact_method whitelist, and length limits are in place. Good. |

---

## 4. Bugs and Correctness

| Location | Issue | Severity |
|----------|--------|----------|
| **`components/TourReviews.js`** | Fetches reviews with `select('*')` and **no join to `profiles`**. Code uses `getProfileDisplayName(review.profiles)`; `review.profiles` is always undefined. | **Bug:** All reviewers show as “Verified User”. Fix: either add a join to `profiles` in the Supabase query (if RLS allows) or fetch display names separately by `user_id`. |
| **`lib/auth.js`** | Imports `getDb` from `@/lib/turso`; app uses `lib/turso.js` for DB. Scripts use `lib/db.js`. Two DB modules can confuse; not a runtime bug if all app code uses turso. | Low; document or consolidate. |
| **`app/api/reviews/translate/route.js`** | Rate limit uses `x-forwarded-for` / `x-real-ip`; can be spoofed. In serverless, in-memory map is per-instance, so limit is per instance, not global. | Acceptable for best-effort limiting; for strict limits use Redis or similar. |
| **BookingForm vs API** | BookingForm only sends `contact_method` in `['whatsapp', 'email']`; API allows `line`, `phone`, `wechat`. No bug; API is correctly broader for other clients. | None. |
| **Tour create/update** | No server-side length limits on `title`, `description`, `location`, `dates`, `duration` or sanitization of `image_urls`/`video_urls` (stored as JSON strings). Very long strings or malformed JSON could cause issues. | Medium: add max lengths and validate JSON shape for image_urls/video_urls. |

---

## 5. Summary of Recommended Fixes (Priority)

1. **Security:** Remove session secret fallback in `lib/auth.js`; require strong `SESSION_SECRET` or fail.
2. **Security:** Validate all numeric IDs (bookings PUT, tours update/delete, announcements delete/toggle) as positive integers.
3. **Security:** Restrict or disable migration API routes in production.
4. **Security:** Whitelist announcement `type` in create route.
5. **Performance:** Parallelize home page DB calls and admin dashboard stats (+ optionally getAllTours).
6. **Performance:** Add limit or pagination to tours list.
7. **Bug:** Fix TourReviews display name by joining or fetching `profiles` (or removing reliance on `review.profiles`).
8. **Serverless:** Remove or replace `setInterval` in `app/api/reviews/translate/route.js` with request-scoped or external cleanup.
9. **Optional:** Validate tour detail `id` (e.g. positive integer) before `getTour`; add length/JSON validation for tour create/update.

Applying the critical security and bug fixes in the codebase is recommended next.
