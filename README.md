# GoHoliday - Travel Company Website

A complete, production-ready travel company website built with Next.js 14+, Turso database, and Cloudinary image uploads.

## Features

### Public Website
- **Homepage**: Hero section with company tagline, active announcement banner, and featured tours
- **Tours Listing**: Grid layout showing all available tour packages
- **Tour Details**: Detailed view with banner image, description, pricing, and image gallery
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS

### Admin Panel
- **Authentication**: Secure session-based login with bcryptjs password hashing
- **Dashboard**: Overview with statistics and tour management table
- **Tour Management**: Full CRUD operations for tour packages
  - Add new tours with banner and gallery images
  - Edit existing tours
  - Delete tours with confirmation
- **Announcements**: Manage site-wide announcements with active/inactive status
- **Image Uploads**: Cloudinary integration for banner and gallery images

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: Turso (libSQL)
- **Authentication**: iron-session
- **Styling**: Tailwind CSS v3
- **Image Uploads**: next-cloudinary
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- Turso database account ([https://turso.tech](https://turso.tech))
- Cloudinary account ([https://cloudinary.com](https://cloudinary.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Codespace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   TURSO_DATABASE_URL=your_turso_database_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN_EMAIL=admin@goholiday.com
   ADMIN_PASSWORD=your_secure_password
   SESSION_SECRET=your_32_character_or_longer_secret
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tours Table
- `id`: INTEGER PRIMARY KEY
- `title`: TEXT NOT NULL
- `description`: TEXT NOT NULL
- `price`: REAL NOT NULL
- `duration`: TEXT NOT NULL
- `dates`: TEXT NOT NULL
- `location`: TEXT NOT NULL
- `banner_image`: TEXT
- `image_urls`: TEXT (JSON array)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### Announcements Table
- `id`: INTEGER PRIMARY KEY
- `message`: TEXT NOT NULL
- `is_active`: INTEGER (0 or 1)
- `created_at`: DATETIME

### Admins Table
- `id`: INTEGER PRIMARY KEY
- `email`: TEXT UNIQUE NOT NULL
- `password_hash`: TEXT NOT NULL
- `created_at`: DATETIME

## Admin Access

After initializing the database, you can access the admin panel at:
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Email**: Value from `ADMIN_EMAIL` env variable
- **Password**: Value from `ADMIN_PASSWORD` env variable

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel pages
│   │   ├── announcements/        # Announcements management
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── tours/                # Tour CRUD operations
│   │   └── page.js               # Admin login
│   ├── api/                      # API routes
│   │   ├── announcements/        # Announcement endpoints
│   │   ├── login/                # Login endpoint
│   │   ├── logout/               # Logout endpoint
│   │   └── tours/                # Tour endpoints
│   ├── tours/                    # Public tour pages
│   │   ├── [id]/                 # Tour details
│   │   └── page.js               # All tours listing
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Homepage
├── components/                   # React components
│   ├── AdminNav.js               # Admin navigation
│   ├── Header.js                 # Public site header
│   ├── ImageUpload.js            # Cloudinary upload widget
│   └── TourCard.js               # Tour card component
├── lib/                          # Utility libraries
│   ├── auth.js                   # Authentication helpers
│   ├── db.js                     # Database connection
│   ├── init-db.js                # Database initialization
│   └── turso.js                  # Turso client helper
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize database tables and create admin user

## Features in Detail

### Image Upload
- **Banner Image**: Single primary image for tour cards and detail pages
- **Gallery Images**: Multiple additional images shown in the tour detail page
- **Fallback**: Manual URL input when Cloudinary is not configured

### Announcements
- Only one announcement can be active at a time
- Active announcements appear as a banner on the homepage
- Full CRUD operations from admin panel

### Security
- Password hashing with bcryptjs (10 rounds)
- Session-based authentication with iron-session
- Protected admin routes with authentication checks
- Secure cookie settings for production

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Hamburger menu for mobile navigation
- Responsive grid layouts (1, 2, 3 columns)
- Touch-friendly UI elements

## Cloudinary Setup

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name from the dashboard
3. Set up an upload preset:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Edit or create a preset named "ml_default" (or update the code to match your preset name)
   - Make sure it's set to "Unsigned" for direct uploads from the browser

## Turso Database Setup

1. Sign up for Turso at [https://turso.tech](https://turso.tech)
2. Install the Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Create a database:
   ```bash
   turso db create goholiday
   ```
4. Get your database URL:
   ```bash
   turso db show goholiday --url
   ```
5. Create an auth token:
   ```bash
   turso db tokens create goholiday
   ```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- Make sure to set all required environment variables
- Run `npm run init-db` after deployment to initialize the database
- Ensure Node.js 18+ is available

## License

MIT

## Support

For issues and questions, please open an issue on the GitHub repository.
