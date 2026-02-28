'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminCustomerDetailPage() {
    const { id } = useParams()
    const router = useRouter()

    const [customer, setCustomer] = useState(null)
    const [bookings, setBookings] = useState([])
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpend: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) {
            fetchCustomerData()
        }
    }, [id])

    const fetchCustomerData = async () => {
        try {
            // Fetch all bookings to process client side for now, 
            // or we could add a specific endpoint for customer details
            // Reusing the bookings API is easiest for immediate implementation
            const response = await fetch('/api/bookings')

            if (response.ok) {
                const data = await response.json()
                const allBookings = data.bookings || []

                // Find user's bookings (using user_id or email matching)
                // Since our bookings have user_id, we should use that if possible.
                // However, the ID in the URL might be the user_id from auth.
                // Let's assume ID param is the user_id.

                // Filter bookings for this customer
                const customerBookings = allBookings.filter(b => b.user_id === id)

                if (customerBookings.length > 0) {
                    // Extract customer info from the most recent booking
                    // or ideally from a separate profiles fetch if needed.
                    // For now, booking data contains name/email/date
                    const latestBooking = customerBookings[0]

                    setCustomer({
                        id: id,
                        name: latestBooking.name,
                        email: latestBooking.email,
                        phone: latestBooking.phone,
                        joinedAt: latestBooking.created_at // Approximation if not fetching profile
                    })

                    // Calculate stats
                    const completed = customerBookings.filter(b => b.status === 'confirmed').length
                    const cancelled = customerBookings.filter(b => b.status === 'cancelled').length
                    const spend = customerBookings
                        .filter(b => b.status === 'confirmed')
                        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

                    setStats({
                        totalBookings: customerBookings.length,
                        completedBookings: completed,
                        cancelledBookings: cancelled,
                        totalSpend: spend
                    })

                    setBookings(customerBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
                } else {
                    setError('Customer not found or no bookings.')
                }
            } else {
                setError('Failed to fetch data')
            }
        } catch (err) {
            console.error('Error:', err)
            setError('An error occurred loading customer data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-12">Loading profile...</div>
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>
    if (!customer) return <div className="text-center py-12">Customer not found</div>

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        <Link href="/admin/customers" className="hover:text-primary-600 transition-colors">Customers</Link>
                        <span>/</span>
                        <span className="text-gray-900">Customer Details</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                        Customer <span className="text-primary-600">Info</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</div>
                        <div className="text-2xl font-black text-primary-600 tracking-tighter">${stats.totalSpend.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="h-32 bg-gray-900 relative">
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 bg-white rounded-[2rem] p-1 shadow-2xl">
                                    <div className="w-full h-full bg-primary-100 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-primary-600 uppercase tracking-tighter">
                                        {customer.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 pt-14">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1">{customer.name}</h2>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">{customer.email}</div>

                            <div className="space-y-6 pt-8 border-t border-gray-50">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                                    <a href={`tel:${customer.phone}`} className="text-sm font-black text-gray-900 hover:text-primary-600 transition-colors flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        {customer.phone || 'N/A'}
                                    </a>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Joined</label>
                                    <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        {new Date(customer.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bookings</div>
                                    <div className="text-xl font-black text-gray-900 tracking-tighter">{stats.totalBookings}</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100/50">
                                    <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Completed</div>
                                    <div className="text-xl font-black text-green-700 tracking-tighter">{Math.round((stats.completedBookings / stats.totalBookings) * 100) || 0}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Main Card */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Booking History</h2>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                    <tr>
                                        <th className="px-8 py-5">Booking ID</th>
                                        <th className="px-8 py-5">Tour</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Price</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-black text-gray-900 tracking-tighter">#{booking.id}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                    {new Date(booking.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">Tour #{booking.tour_id}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-sm font-black text-gray-900 tracking-tighter">${Number(booking.total_price || 0).toLocaleString()}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link href={`/admin/bookings/${booking.id}`} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
