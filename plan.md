# GoHoliday — Full Build Plan (Architecture A)

**Stack:** vinext (App Router) · shadcn/ui (Radix+Tailwind+CVA) · Clerk headless (`useSignIn`/`useSignUp`/`useUser`) · React Hook Form + Zod · TanStack Table · lucide-react. **Theme:** light/orange brand, Inter. **Data:** mock until Supabase (Phase 3).

## 1. Folder tree (the whole site)

```
goholiday-website/
├─ app/                          # THIN: routing + composition only
│  ├─ layout.tsx                 #   root: <html>/<body>, fonts, Providers, Toaster
│  ├─ not-found.tsx
│  ├─ (public)/                  # customer site  →  layout: Header+Footer+WhatsApp FAB
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                #   /  (home)
│  │  ├─ _components/            #   HomeHero, FeaturedPackages, HowItWorks, FAQPreview
│  │  ├─ packages/
│  │  │  ├─ page.tsx             #   /packages  (search + filters)
│  │  │  ├─ loading.tsx
│  │  │  ├─ _components/         #   PackageSearchBar, FilterPanel, PackageGrid, SortSelect, Pagination
│  │  │  └─ [slug]/
│  │  │     ├─ page.tsx          #   /packages/[slug]  (detail)
│  │  │     ├─ _components/      #   PackageGallery, Lightbox, ItineraryAccordion,
│  │  │     │                     #     InclusionsExclusions, MapEmbed, PriceCalculator,
│  │  │     │                     #     ReviewsSection, SimilarPackages
│  │  │     └─ book/
│  │  │        ├─ page.tsx       #   /packages/[slug]/book
│  │  │        └─ _components/   #     BookingForm, PriceSummary
│  │  ├─ destinations/page.tsx   #   /destinations
│  │  ├─ faq/page.tsx            #   /faq
│  │  ├─ contact/page.tsx        #   /contact  (custom trip request)
│  │  └─ _components/            #   DestinationCard, FaqAccordion, ContactForm
│  ├─ (auth)/                    # centered shell, no chrome
│  │  ├─ layout.tsx
│  │  ├─ _components/            #   AuthCard, AuthTabs, GoogleButton, OtpInput, AuthLinks
│  │  ├─ sign-in/page.tsx        #   /sign-in
│  │  ├─ sign-up/page.tsx        #   /sign-up
│  │  ├─ forgot-password/page.tsx#   /forgot-password
│  │  └─ callback/page.tsx       #   /auth/callback  (Google OAuth return)
│  ├─ (account)/                 # signed-in  →  layout: guard + sub-nav
│  │  ├─ layout.tsx
│  │  ├─ _components/            #   AccountNav
│  │  ├─ profile/page.tsx        #   /profile
│  │  │  └─ _components/         #   ProfileHeader, ProfileEditForm
│  │  ├─ bookings/page.tsx       #   /bookings
│  │  │  └─ _components/         #   BookingsList, BookingCard, StatusBadge
│  │  ├─ bookings/[id]/page.tsx  #   /bookings/[id]
│  │  │  └─ _components/         #   BookingDetail, VoucherDownload
│  │  └─ wishlist/page.tsx       #   /wishlist
│  │     └─ _components/         #   WishlistGrid
│  └─ (admin)/                   # admin  →  layout: role guard + sidebar + topbar
│     ├─ layout.tsx
│     ├─ _components/            #   AdminSidebar, AdminTopbar, MetricsCard, ActivityFeed
│     ├─ page.tsx                #   /admin  (dashboard)
│     ├─ packages/{ page.tsx, _components/ }        # PackageTable, PackageForm(Sheet), ItineraryEditor, MediaUploader
│     ├─ bookings/{ page.tsx, _components/ }        # BookingsTable, BookingDrawer, StatusOverride, PaymentLog, EmailTriggers
│     ├─ customers/{ page.tsx, _components/ }       # CustomersTable, CustomerProfile, AdminNotes
│     ├─ reviews/{ page.tsx, _components/ }         # ReviewsTable, ReviewDetail, ApproveDelete
│     ├─ inquiries/{ page.tsx, _components/ }       # InquiriesTable, AssignLead
│     ├─ pricing/{ page.tsx, _components/ }         # PricingRulesTable, PricingRuleForm
│     └─ team/{ page.tsx, _components/ }            # RolesTable, MemberForm
├─ components/
│  ├─ ui/                        # shadcn PRIMITIVES (button, input, label, card, tabs, …)
│  ├─ layout/                    # Header, Footer, UserMenu, MobileNav, WhatsAppFab
│  ├─ site/                      # CROSS-FEATURE business components
│  │                             #   PackageCard, StarRating, StatusBadge, Price, Lightbox, Protected
│  └─ providers/                 # ClerkProvider, ToasterProvider
├─ lib/                          # utils(cn) · formatters · constants · pricing · data/mock · (supabase/, clerk/, voucher/ later)
├─ hooks/                        # useMediaQuery · useDebounce · usePriceCalc
├─ types/                        # package · booking · review · user · inquiry · pricing · role
└─ eslint (boundary rule: no sideways imports between features)
```

**Rules:** one-feature component → its `_components/`; 2+ features → `components/site/`; primitive → `components/ui/`; no sideways feature imports (lint-enforced); pages compose, logic in `lib`/`hooks`.

## 2. Shared foundation (Phase 0)

- **shadcn `init`** → design tokens in `globals.css` (primary = your orange, neutrals = slate, radius, type scale), `lib/utils.ts` (`cn`), `components.json`.
- **Providers:** `ClerkProvider` (move existing here), `ToasterProvider` (sonner).
- **Initial shadcn set:** button, input, label, card, tabs, alert, dialog, dropdown-menu, avatar, badge, skeleton, sonner, separator, form (RHF), input-otp, spinner. Add the rest per-phase (ponytail — don't add everything now).
- **`types/`** scaffolding + **`lib/constants`** (nav, categories, amenities, FAQs).
- **ESLint** + boundary rule (recommended; can defer).

## 3. Page + component inventory

### (auth) — build first (pure Clerk, no data)

| Page | URL | Components |
|---|---|---|
| Sign in | `/sign-in` | `AuthCard` · `SignInForm` (Tabs: **Password** / **Email Code**) · `GoogleButton` · `OtpInput` · `AuthLinks` — wired to `useSignIn` (`signIn.password` / `signIn.emailCode.*` / `signIn.sso`) |
| Sign up | `/sign-up` | `AuthCard` · `SignUpForm` (Password / Email Code) · `GoogleButton` · `OtpInput` · captcha `<div id="clerk-captcha">` · terms — `useSignUp` (`signUp.password` / `signUp.verifications.*` / `signUp.sso`) |
| Forgot password | `/forgot-password` | `ResetPasswordForm` (send code → verify → new password) — `signIn.resetPasswordEmailCode.*` |
| Callback | `/auth/callback` | thin route; lets clerk-js finalize Google OAuth, redirects to target |

Shared: `AuthCard` (brand header), `AuthTabs` (Radix Tabs), `GoogleButton`, `OtpInput` (Input OTP), `AuthLinks` (cross-links). Every form = RHF+Zod; every page gates on `isLoaded`.

### (account) — guard in layout (redirect if not signed in)

| Page | URL | Components |
|---|---|---|
| Profile | `/profile` | `ProfileHeader` (Avatar+name+email) · `ProfileEditForm` (name/image → `user.setProfile`) · sign out |
| Bookings | `/bookings` | `AccountNav` · `BookingsList` · `BookingCard` · `StatusBadge` (data: Supabase) |
| Booking detail | `/bookings/[id]` | `BookingDetail` · `VoucherDownload` (PDF + QR) |
| Wishlist | `/wishlist` | `WishlistGrid` (saved `PackageCard`) |

### (public) — mock data until Phase 3

| Page | URL | Components |
|---|---|---|
| Home | `/` | `HomeHero` · `FeaturedPackages` · `HowItWorks` · `FAQPreview` |
| Packages | `/packages` | `PackageSearchBar` · `FilterPanel` (price/duration/star/amenities) · `PackageGrid` · `SortSelect` · `Pagination` · `Skeleton` |
| Detail | `/packages/[slug]` | `PackageGallery`+`Lightbox` · `ItineraryAccordion` · `InclusionsExclusions` · `MapEmbed` (Leaflet) · `PriceCalculator` (dates+guests→live total) · `ReviewsSection` · `SimilarPackages` |
| Book | `/packages/[slug]/book` | `BookingForm` (date range, adults/children, rooms, contact) · `PriceSummary` |
| Destinations | `/destinations` | `DestinationCard` grid |
| FAQ | `/faq` | `FaqAccordion` |
| Contact | `/contact` | `ContactForm` (custom trip request) · `WhatsAppFab` |

Cross-feature business components (`components/site/`): `PackageCard`, `StarRating`, `StatusBadge`, `Price`, `Lightbox`, `Protected` (client guard).

### (admin) — role guard + TanStack Table (service-role data)

| Page | URL | Components |
|---|---|---|
| Dashboard | `/admin` | `MetricsCard` (revenue/bookings/customers/pending) · `ActivityFeed` |
| Packages | `/admin/packages` | `PackageTable` (search/sort/filter/paginate) · `PackageForm` (Sheet) · `ItineraryEditor` · `MediaUploader` |
| Bookings | `/admin/bookings` | `BookingsTable` · `BookingDrawer` · `StatusOverride` · `PaymentLog` (upload proof) · `EmailTriggers` |
| Customers | `/admin/customers` | `CustomersTable` · `CustomerProfile` · `AdminNotes` |
| Reviews | `/admin/reviews` | `ReviewsTable` · `ReviewDetail` (media) · `ApproveDelete` |
| Inquiries | `/admin/inquiries` | `InquiriesTable` · `AssignLead` |
| Pricing | `/admin/pricing` | `PricingRulesTable` · `PricingRuleForm` (date ranges, surcharge/discount) |
| Team/RBAC | `/admin/team` | `RolesTable` · `MemberForm` (invite, assign role) |
| (export) | per-table | CSV/Excel export actions on each table |

## 4. Cross-cutting

- **Forms:** RHF + Zod everywhere; shadcn `<Form>` wrapper; inline + global errors.
- **Guards:** `Protected` (client, `useAuth`) for `(account)`; role guard for `(admin)` (admin email/claim list).
- **Loading/error:** `loading.tsx` skeletons per group; `error.tsx` boundaries; shadcn Skeleton/Empty/Alert.
- **SEO:** per-page `Metadata` (title/description/OG); vinext supports it.
- **A11y:** Radix primitives (WAI-ARIA, keyboard, focus) + explicit labels.
- **Price calc:** `lib/pricing.ts` + `usePriceCalc` (base × nights × guests + addons) — pure local logic.
- **PDF voucher / QR / Leaflet / Resend:** added in the phases that need them (not upfront).
- **i18n / global state:** skip until a feature needs them (YAGNI).

## 5. Phases (you drive; build phase by phase)

0. **Foundation** — shadcn `init` + tokens + `cn` + providers + initial component set + `types`/`constants` (+ ESLint boundary).
1. **Auth** — `(auth)` pages, `Profile`, `UserMenu`+`Header`+`Footer`, replace `AuthControls`. ← starts here. (needs Clerk dashboard toggles)
2. **Public site** — `(public)` on mock data (`lib/data/packages.ts`).
3. **Supabase** — native Clerk↔Supabase integration (the earlier plan), schema + RLS, swap mock → real data, booking creation (pending), user bookings, wishlist.
4. **Account** — `/bookings`, `/bookings/[id]` + PDF voucher.
5. **Admin** — `(admin)` all pages on service-role data + TanStack Table.
6. **Extras** — seasonal pricing engine, reviews + media uploads, WhatsApp widget, CSV/Excel export, RBAC roles, Resend triggers.

## 6. Before I build — confirm

- **Precondition (you):** Clerk Dashboard → enable **Email & Password**, **Email Code**, **Continue with Google**.
- Public site in Phase 2 runs on **mock data** until Supabase is wired (Phase 3) — OK?
- Names are clean-URL (`/profile`, `/bookings`, `/admin/...`); spec's `/my-bookings` becomes `/bookings`.
