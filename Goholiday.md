# Travel Agency Tech Stack & Workflow

| Component | Recommended Tool | Free Tier Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** (App Router) | High-performance SSR,<br>fast SEO indexing for packages. |
| **Hosting & CDN** | **Cloudflare Pages** | Unlimited bandwidth,<br>global edge network, free SSL. |
| **Database & API** | **Supabase** (PostgreSQL) | Free 500MB database,<br>automatic REST/GraphQL APIs. |
| **Authentication** | **Clerk** | Free for 10k MAUs,<br>pre-built UI, Google login. |
| **File & Image Storage** | **Supabase / Cloudflare R2** | Supabase (1GB free) or<br>R2 (10GB free, 0 egress). |
| **Transactional Emails** | **Resend** | Free 3,000 emails/month<br>for booking receipts/vouchers. |

---

### Booking Flow (No Online Payments)

1. **Customer Reserves:** Selects dates and clicks "Request Booking".
2. **Database Record Created:** Next.js saves booking in Supabase (`status: 'pending_confirmation'`).
3. **Automated Notification (Resend):**
   - **To Customer:** Confirmation of request received.
   - **To Admin:** Alert for new incoming booking.
4. **Offline Confirmation:** Process payment via bank/cash/WhatsApp and mark status as `confirmed` in admin panel.



# Travel Agency Feature Specifications

---

## Public / User-Facing Features

### 1. Interactive Destination & Package Search
* **Search Engine:** Query by destination name, tags, or travel categories (e.g., Honeymoon, Adventure, Budget, Family).
* **Multi-Parametric Filters:** Narrow down listings by price range, duration (days/nights), hotel star rating, and included amenities (e.g., Breakfast, WiFi, Pool).

### 2. Rich Media & Interactive Galleries
* **Photo Lightbox:** Full-screen modal galleries for hotel rooms, resort views, and tour destinations.
* **Interactive Maps:** Integrated Leaflet.js / OpenStreetMap display showing hotel locations, pickup points, and tour stopover markers.

### 3. Detailed Tour & Hotel Display
* **Day-by-Day Itineraries:** Accordion-based layout breaking down daily schedules (e.g., Day 1: Arrival & Transfer, Day 2: Guided City Tour).
* **Inclusions & Exclusions List:** Clear checklist displaying what is covered (e.g., Meals, Local Transport) versus out-of-pocket costs (e.g., Flight Tickets, Visas).

### 4. Booking Request & Price Calculator
* **Dynamic Reservation Form:** Date-range picker with real-time total price calculation based on guest count (Adults / Children) and room selections.
* **Offline Reservation Flow:** Instant request submission saving bookings under `pending_confirmation` status without requiring immediate online payment.

### 5. Customer Account Dashboard (`/my-bookings`)
* **Booking History:** User account panel managed via Clerk to view past, active, and upcoming trips.
* **Status Tracker:** Real-time visibility into booking statuses (`Pending`, `Confirmed`, `Completed`, `Cancelled`).

### 6. Automated PDF Voucher Generator
* **One-Click Download:** Generates downloadable PDF booking vouchers featuring itinerary details, emergency support contacts, and unique booking reference QR codes.

### 7. Verified Reviews & Ratings
* **Rating System:** 5-star scoring and written review engine restricted exclusively to users with completed bookings.
* **Media Uploads:** Customer photo attachments within reviews stored directly in Supabase Storage or Cloudflare R2.

### 8. Direct WhatsApp & Contact Channels
* **Floating Chat Widget:** Floating action button connecting users directly to your agency's WhatsApp line for instant pre-booking inquiries.
* **Custom Trip Request Form:** Specialized contact form for users requiring custom, tailor-made group or corporate itineraries.

### 9. Transparent Pricing & FAQs
* **Price Breakdown:** Detailed preview of base rates, taxes, optional add-ons, and service fees prior to reservation submission.
* **Collapsible FAQs:** Dedicated section addressing booking policies, cancellation rules, and payment options.

### 10. Wishlist & Saved Packages
* **Bookmark Engine:** Allows logged-in users to save favorite tour packages and hotel listings to a personal wishlist for later viewing.

---

## Admin Panel Features (`/admin`)

### 1. Operations Overview Dashboard
* **Metrics Cards:** Real-time metrics displaying Total Estimated Revenue, Active Bookings, Total Customers, and Pending Inquiries.
* **Recent Activity Feed:** Live timeline highlighting incoming booking requests, customer sign-ups, and review submissions.

### 2. Package & Hotel Inventory Management (CRUD)
* **Listing Manager:** Interface to create, edit, archive, or delete hotel listings and tour packages.
* **Media Uploader:** Direct file drag-and-drop interface connected to Supabase Storage / Cloudflare R2 for uploading tour banners and room galleries.

### 3. Booking Management Hub
* **Master Order Table:** Filterable table listing all customer bookings with search by Customer Name, Booking ID, or Date Range.
* **Status Override:** One-click controls to manually transition booking statuses (`Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Completed` $\rightarrow$ `Cancelled`).

### 4. Manual Email Trigger Controls
* **Notification Engine:** Dashboard buttons triggering automated Resend emails (e.g., "Send Confirmation Receipt", "Send Payment Instructions", "Send Trip Reminder").

### 5. Customer Relationship Management (CRM)
* **User Profiles:** Master directory syncing user data from Clerk to Supabase, displaying total bookings, spending history, and contact details.
* **Internal Admin Notes:** Field allowing agency staff to attach private notes to customer profiles (e.g., "Prefers vegetarian meals", "VIP Client").

### 6. Offline Payment & Invoice Logger
* **Transaction Recording:** Interface to log offline bank transfers, cash payments, or UPI receipts against specific booking IDs.
* **Payment Proof Storage:** File attachment field to upload offline payment receipts or bank slips for accounting verification.

### 7. Seasonal Pricing & Discount Engine
* **Dynamic Pricing Rules:** Admin controls to override base pricing with holiday surcharges or promotional percentage discounts for specific date ranges.

### 8. Review Moderation Queue
* **Content Moderation:** Approval queue to inspect, approve, or delete user-submitted reviews before they are published publicly.

### 9. Lead & Custom Inquiry Inbox
* **Inquiry Manager:** Queue for tracking custom tour requests submitted via the public contact forms, with options to assign leads to specific agency staff.

### 10. Exporting & Role-Based Access Control (RBAC)
* **Data Export:** CSV and Excel export options for booking logs, revenue reports, and customer lists.
* **Permission Roles:** Multi-account access supporting administrative hierarchy (`Super Admin`, `Agency Staff`, `Support Agent`).