import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { announcements as announcementsSchema } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import AnnouncementForm from './AnnouncementForm'
import AnnouncementList from './AnnouncementList'

async function getAllAnnouncements() {
  try {
    const db = getDb();
    const result = await db.select().from(announcementsSchema).orderBy(desc(announcementsSchema.created_at));
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export default async function AnnouncementsPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin');
  }

  const announcements = await getAllAnnouncements();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tighter">
          Alerts <span className="text-slate-400">Control</span>
        </h1>
      </div>

      <div className="space-y-6">
        {/* Add New Announcement Form */}
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-black text-black uppercase tracking-widest">Add New Alert</h2>
          </div>
          <div className="p-6">
            <AnnouncementForm />
          </div>
        </div>

        {/* Announcements List */}
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-black text-black uppercase tracking-widest">Alert History</h2>
          </div>
          <div className="p-0">
            <AnnouncementList announcements={announcements} />
          </div>
        </div>
      </div>
    </div>
  )
}
