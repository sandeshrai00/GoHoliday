'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header' // Using the main header or we should create an admin header
import Link from 'next/link'

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('pending')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings')
            if (response.ok) {
                const data = await response.json()
                // Ensure admin_note is included in the booking objects
                setBookings(data.bookings)
            } else {
                setError('Failed to fetch bookings')
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            setError('An error occurred while fetching bookings')
        } finally {
            setLoading(false)
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
        const safeRef = booking.reference_code ? booking.reference_code.toLowerCase() : ''
        const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            safeRef.includes(searchTerm.toLowerCase()) ||
            booking.id.toString().includes(searchTerm)
        return matchesStatus && matchesSearch
    })

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            })

            if (response.ok) {
                fetchBookings() // Refresh list
            }
        } catch (err) {
            console.error('Error updating status:', err)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tighter">
                        Bookings <span className="text-slate-400">Ledger</span>
                    </h1>
                </div>
                <button
                    onClick={fetchBookings}
                    className="px-6 py-2 bg-white border border-slate-200 text-black rounded-none font-black text-[10px] uppercase tracking-widest hover:border-black transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading bookings...</div>
            ) : error ? (
                <div className="text-red-600 text-center py-12">{error}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                    No bookings found yet.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 mb-8">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest min-w-fit">Filter:</span>
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors border ${statusFilter === status
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative w-full lg:w-80">
                                <input
                                    type="text"
                                    placeholder="Search by Ref Code, Name or Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-transparent border-b border-slate-200 focus:border-black transition-colors font-bold text-xs tracking-tight outline-none"
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-2">ID & Date</div>
                            <div className="col-span-4">Client Info</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="py-24 text-center bg-slate-50">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">No Ledger Entries</h3>
                                <p className="text-xs font-bold text-slate-400">Try adjusting your filters or search term.</p>
                            </div>
                        ) : (
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 px-6 py-4 md:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    {/* ID & Date */}
                                    <div className="col-span-2">
                                        <div className="text-xs font-black text-black leading-none">{booking.reference_code || `#${booking.id}`}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Client Info */}
                                    <div className="col-span-4">
                                        <Link href={`/admin/bookings/${booking.id}`} className="block">
                                            <h3 className="text-sm font-black text-black group-hover:underline decoration-2 underline-offset-2 uppercase tracking-tighter truncate">
                                                {booking.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                            <span className="text-[10px] font-bold text-slate-500 truncate">{booking.email}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                            <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase shrink-0">Tour #{booking.tour_id}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="col-span-3">
                                        <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border
                                            ${booking.status === 'confirmed' ? 'bg-white text-black border-black' :
                                                booking.status === 'cancelled' ? 'bg-white text-slate-400 border-slate-200 line-through' :
                                                    'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="col-span-3 flex items-center justify-end gap-2">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                                    className="px-4 py-1.5 bg-black text-white border border-black hover:bg-white hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                                    className="w-7 h-7 bg-white border border-slate-200 text-slate-400 hover:border-black hover:text-black transition-colors flex items-center justify-center font-black"
                                                    title="Cancel Booking"
                                                >
                                                    X
                                                </button>
                                            </>
                                        )}
                                        {booking.status !== 'pending' && (
                                            <button
                                                onClick={() => updateStatus(booking.id, 'pending')}
                                                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-colors"
                                            >
                                                Reset
                                            </button>
                                        )}
                                        <Link
                                            href={`/admin/bookings/${booking.id}`}
                                            className="w-7 h-7 bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                                            title="View Details"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
