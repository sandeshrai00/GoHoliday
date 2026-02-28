import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, announcements as announcementsSchema, bookings as bookingsSchema } from '@/lib/schema'
import { eq, desc, count } from 'drizzle-orm'
import DeleteTourButton from './DeleteTourButton'
import TourPriceDisplay from './TourPriceDisplay'
import Skeleton from '@/components/Skeleton'

async function getStats() {
  try {
    const db = getDb();
    const [toursResult, announcementsResult, bookingsResult] = await Promise.all([
      db.select({ value: count() }).from(toursSchema),
      db.select({ value: count() }).from(announcementsSchema).where(eq(announcementsSchema.is_active, 1)),
      db.select({ value: count() }).from(bookingsSchema).where(eq(bookingsSchema.status, "pending")),
    ]);

    return {
      totalTours: toursResult[0]?.value || 0,
      activeAnnouncements: announcementsResult[0]?.value || 0,
      pendingBookings: bookingsResult[0]?.value || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalTours: 0, activeAnnouncements: 0, pendingBookings: 0 };
  }
}

async function getAllTours() {
  try {
    const db = getDb();
    const result = await db.select().from(toursSchema).orderBy(desc(toursSchema.created_at));
    return result.map(row => JSON.parse(JSON.stringify(row)));
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin');
  }

  const [stats, tours] = await Promise.all([getStats(), getAllTours()]);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tighter">
            System <span className="text-slate-400">Overview</span>
          </h1>
        </div>
        <Link
          href="/admin/tours/new"
          className="px-6 py-2 bg-black text-white border border-black hover:bg-white hover:text-black transition-colors rounded-none font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          New Tour
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Tours</p>
          <p className="text-3xl font-black text-black tracking-tighter">{stats.totalTours}</p>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Popups</p>
          <p className="text-3xl font-black text-black tracking-tighter">{stats.activeAnnouncements}</p>
        </div>

        <Link href="/admin/bookings" className="block bg-white border border-slate-200 p-4 hover:border-black transition-colors group">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-black transition-colors">Pending Bookings</p>
          <p className="text-3xl font-black text-black tracking-tighter flex items-end justify-between">
            {stats.pendingBookings}
            <span className="text-xs text-slate-300 font-bold group-hover:text-black">&rarr;</span>
          </p>
        </Link>

        <Link href="/admin/customers" className="block bg-white border border-slate-200 p-4 hover:border-black transition-colors group">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-black transition-colors">Customers DB</p>
          <p className="text-3xl font-black text-black tracking-tighter flex items-end justify-between">
            View
            <span className="text-xs text-slate-300 font-bold group-hover:text-black">&rarr;</span>
          </p>
        </Link>
      </div>

      {/* Tours Section */}
      <div className="bg-white border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-black uppercase tracking-widest">Tours Directory</h2>
          </div>
          <Link
            href="/admin/tours/new"
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors flex items-center gap-1"
          >
            <span>+ Add Tour</span>
          </Link>
        </div>

        {tours.length > 0 ? (
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-1">ID</div>
              <div className="col-span-5">Tour Name</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Base Price</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Data Rows */}
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="group flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-4 px-6 py-4 md:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                {/* ID (Mobile & Desktop) */}
                <div className="col-span-1 text-[10px] font-bold text-slate-400">#{tour.id}</div>

                {/* Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative w-8 h-8 bg-slate-100 overflow-hidden shrink-0">
                    {tour.banner_image ? (
                      <Image src={tour.banner_image} alt={tour.title} fill sizes="32px" className="object-cover grayscale" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400">IMG</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-black leading-tight group-hover:underline decoration-2 underline-offset-2">{tour.title_en || tour.title}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">{tour.location_en || tour.location}</div>
                  </div>
                </div>

                {/* Duration */}
                <div className="col-span-2 text-xs font-bold text-slate-600">
                  <span className="md:hidden text-[10px] text-slate-400 uppercase tracking-widest mr-2">Duration:</span>
                  {tour.duration}
                </div>

                {/* Price */}
                <div className="col-span-2 text-sm font-black text-black">
                  <span className="md:hidden text-[10px] text-slate-400 uppercase tracking-widest mr-2">Price:</span>
                  <TourPriceDisplay price={tour.price} currency={tour.currency} />
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-3 mt-3 md:mt-0">
                  <Link
                    href={`/admin/tours/edit/${tour.id}`}
                    className="text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteTourButton tourId={tour.id} tourTitle={tour.title_en || tour.title} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400 border-t border-slate-200 bg-slate-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">No Active Tours</h3>
            <Link
              href="/admin/tours/new"
              className="text-xs font-bold text-black border-b border-black hover:text-slate-500 hover:border-slate-500 transition-colors"
            >
              Initialize First Entry
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
