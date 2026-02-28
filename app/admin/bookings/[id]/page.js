'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function BookingDetailPage({ params }) {
    // Unwrap params using React.use() or await if async component, but this is a client component
    // In Next.js 15 client components, params is a Promise, so we need to handle it.
    // However, since we are using 'use client', we can use useParams() hook which is easier.
    const { id } = useParams()
    const router = useRouter()

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updating, setUpdating] = useState(false)
    const [adminNote, setAdminNote] = useState('')
    const [noteSaving, setNoteSaving] = useState(false)

    useEffect(() => {
        if (id) {
            fetchBookingDetails()
        }
    }, [id])

    const fetchBookingDetails = async () => {
        try {
            // We can reuse the list API with a filter or create a specific GET /api/bookings/[id]
            // For now, let's fetch all and filter client side or update the API to support ID param
            // Updating API is better. Let's assume we update the API or use query param.
            // Actually, the current GET /api/bookings returns all. Let's send a query param.
            const response = await fetch(`/api/bookings?id=${id}`)
            if (response.ok) {
                const data = await response.json()
                // If the API returns a list, find the one. If it returns object, use it.
                // Current API returns { bookings: [...] }. 
                // We should update the API to handle ?id= query.

                // Temporary client-side filtering until API update
                if (data.bookings) {
                    const found = data.bookings.find(b => b.id.toString() === id || b.reference_code === id)
                    if (found) {
                        setBooking(found)
                        setAdminNote(found.admin_note || '')
                    } else {
                        setError('Booking not found')
                    }
                } else if (data.booking) {
                    setBooking(data.booking)
                    setAdminNote(data.booking.admin_note || '')
                }
            } else {
                setError('Failed to fetch booking details')
            }
        } catch (err) {
            setError('An error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus) => {
        setUpdating(true)
        try {
            const response = await fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: booking.id, status: newStatus })
            })

            if (response.ok) {
                setBooking(prev => ({ ...prev, status: newStatus }))
                // Optional: Show success message
            }
        } catch (err) {
            console.error(err)
            alert('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const saveAdminNote = async () => {
        setNoteSaving(true)
        try {
            const response = await fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: booking.id, admin_note: adminNote })
            })

            if (response.ok) {
                // Success feedback
                alert('Note saved!')
            } else {
                alert('Failed to save note')
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred')
        } finally {
            setNoteSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading booking details...</div>
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>
    if (!booking) return <div className="p-8 text-center text-gray-500">Booking not found</div>

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        <Link href="/admin/bookings" className="hover:text-primary-600 transition-colors">Bookings</Link>
                        <span>/</span>
                        <span className="text-gray-900">Booking Details</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                        Booking <span className="text-primary-600">{booking.reference_code || `#${booking.id}`}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Tour Information Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Tour Information</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tour</label>
                                    <div className="text-xl font-black text-gray-900 tracking-tighter">#{booking.tour_id}</div>
                                    <Link href={`/en/tours/${booking.tour_id}`} target="_blank" className="mt-2 inline-flex items-center text-primary-600 font-bold text-xs uppercase tracking-wide hover:underline gap-1">
                                        View Live Page
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </Link>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guests</div>
                                            <div className="text-2xl font-black text-gray-900 tracking-tighter">{booking.guests || 1} <span className="text-sm text-gray-500 font-bold">People</span></div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Price</div>
                                            <div className="text-2xl font-black text-primary-600 tracking-tighter">
                                                {booking.total_price ? `$${booking.total_price.toLocaleString()}` : '$0'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Booking Date</label>
                                    <div className="text-lg font-black text-gray-900 tracking-tighter">
                                        {new Date(booking.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase mt-1">
                                        {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Customer Details</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Name</label>
                                    <div className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{booking.name}</div>
                                    {booking.user_id && (
                                        <span className="mt-2 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                            Registered Account
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Information</label>
                                    <div className="space-y-3">
                                        <a href={`mailto:${booking.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors font-bold group">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary-50">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            {booking.email}
                                        </a>
                                        {booking.phone && (
                                            <a href={`tel:${booking.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors font-bold group">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary-50">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                {booking.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Preferred Contact Method</label>
                                    <div className="flex items-center gap-3">
                                        {booking.contact_method === 'whatsapp' ? (
                                            <div className="flex items-center gap-3 px-5 py-3 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118 1.157-.175 1.758-.967 1.758-1.761.017-.791-.412-1.558-.809-1.734zM12 21.463C6.794 21.463 2.536 17.205 2.536 12c0-5.204 4.257-9.463 9.463-9.463 5.204 0 9.463 4.257 9.463 9.463 0 5.204-4.257 9.463-9.463 9.463z" /></svg>
                                                <span className="font-black uppercase tracking-widest text-xs">WhatsApp Official</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <span className="font-black uppercase tracking-widest text-xs">Email Direct</span>
                                            </div>
                                        )}
                                    </div>
                                    {booking.contact_method === 'whatsapp' && booking.phone && (
                                        <div className="mt-4">
                                            <a
                                                href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                                            >
                                                Open Direct Chat
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Message Section */}
                    {booking.message && (
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Message from Customer</h2>
                            </div>
                            <div className="p-8">
                                <div className="bg-gray-50 p-8 rounded-[2rem] text-lg font-medium text-gray-700 leading-relaxed border border-gray-100 italic relative">
                                    <span className="absolute -top-4 -left-2 text-6xl text-gray-200 select-none">“</span>
                                    {booking.message}
                                    <span className="absolute -bottom-10 -right-2 text-6xl text-gray-200 select-none">”</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Admin Actions */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-24">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 text-center uppercase">Admin Actions</h2>

                        <div className="space-y-4 mb-10">
                            <button
                                onClick={() => updateStatus('confirmed')}
                                disabled={updating || booking.status === 'confirmed'}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95
                                    ${booking.status === 'confirmed'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-2 border-dashed border-gray-200'
                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/10'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                {booking.status === 'confirmed' ? 'Verified' : 'Approve Booking'}
                            </button>

                            <button
                                onClick={() => updateStatus('pending')}
                                disabled={updating || booking.status === 'pending'}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95
                                    ${booking.status === 'pending'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-2 border-dashed border-gray-200'
                                        : 'bg-white border-2 border-yellow-100 text-yellow-600 hover:bg-yellow-50 shadow-yellow-600/5'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Move to Pending
                            </button>

                            <button
                                onClick={() => updateStatus('cancelled')}
                                disabled={updating || booking.status === 'cancelled'}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95
                                    ${booking.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-2 border-dashed border-gray-200'
                                        : 'bg-white border-2 border-red-50 text-red-600 hover:bg-red-50 shadow-red-600/5'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                Cancel Booking
                            </button>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Internal Notes</h3>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add private notes here..."
                                className="w-full h-40 p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-600 transition-all font-bold text-sm outline-none resize-none mb-4"
                            />
                            <button
                                onClick={saveAdminNote}
                                disabled={noteSaving}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 active:scale-95"
                            >
                                {noteSaving ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
