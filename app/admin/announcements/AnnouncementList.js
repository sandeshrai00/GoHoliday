'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

function formatDate(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const d = new Date(dateStr)
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${String(d.getUTCFullYear()).slice(-2)}`
}

export default function AnnouncementList({ announcements }) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState(null)

  const handleToggleActive = async (id, currentStatus) => {
    setActionLoading(id)
    try {
      // Explicitly convert: if currently active (truthy), we want to deactivate (false), and vice versa
      const newStatus = currentStatus ? false : true
      const response = await fetch('/api/announcements/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        // Small delay to ensure server-side revalidation has time to process
        await new Promise(r => setTimeout(r, 300))
        router.refresh()
      } else {
        console.error('Toggle failed:', data)
        alert(data.error || 'Failed to toggle announcement status')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id, message) => {
    if (!confirm(`Are you sure you want to delete this announcement?\n\n"${message}"`)) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch('/api/announcements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete announcement')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No announcements yet. Create your first announcement above.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Desktop View */}
      <div className="hidden md:block overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3">Alert</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-black text-black leading-tight max-w-lg group-hover:underline decoration-2 underline-offset-2">
                    {announcement.message_en || announcement.message}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {announcement.type}
                    </span>
                    {announcement.type === 'popup' && announcement.popup_type && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        → {announcement.popup_type === 'new_feature' ? 'new feature' : announcement.popup_type === 'system_update' ? 'sys update' : announcement.popup_type}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border
                    ${announcement.is_active
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-slate-400 border-slate-200 line-through'
                    }`}>
                    {announcement.is_active ? 'ON' : 'OFF'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-black text-black uppercase tracking-widest whitespace-nowrap">
                    {formatDate(announcement.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                      disabled={actionLoading === announcement.id}
                      className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors border
                        ${announcement.is_active
                          ? 'bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black'
                          : 'bg-black text-white border-black hover:bg-slate-800'}`}
                    >
                      {actionLoading === announcement.id ? '...' : announcement.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id, announcement.message_en || announcement.message)}
                      disabled={actionLoading === announcement.id}
                      className="w-7 h-7 bg-white border border-slate-200 text-slate-400 hover:border-black hover:text-black transition-colors flex items-center justify-center font-black"
                    >
                      X
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="pro-card rounded-2xl p-5">
            <div className="mb-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest
                      ${announcement.type === 'popup'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-slate-50 text-slate-600'
                    }`}>
                    {announcement.type}
                  </span>
                  {announcement.type === 'popup' && announcement.popup_type && (
                    <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest
                      ${announcement.popup_type === 'discount' ? 'bg-amber-50 text-amber-600'
                        : announcement.popup_type === 'new_feature' ? 'bg-blue-50 text-blue-600'
                          : announcement.popup_type === 'system_update' ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-50 text-indigo-500'
                      }`}>
                      {announcement.popup_type === 'new_feature' ? 'new feature' : announcement.popup_type === 'system_update' ? 'sys update' : announcement.popup_type}
                    </span>
                  )}
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {formatDate(announcement.created_at)}
                </div>
              </div>
              <p className="text-[13px] font-bold text-slate-900 leading-relaxed">{announcement.message_en || announcement.message}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                disabled={actionLoading === announcement.id}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                    ${announcement.is_active
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}
              >
                {actionLoading === announcement.id ? '...' : announcement.is_active ? 'Off' : 'On'}
              </button>
              <button
                onClick={() => handleDelete(announcement.id, announcement.message_en || announcement.message)}
                disabled={actionLoading === announcement.id}
                className="w-11 h-11 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
