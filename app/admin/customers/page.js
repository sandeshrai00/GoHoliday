'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CustomersPage() {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        returningCustomers: 0,
        totalBookings: 0,
        confirmedRate: 0,
        customers: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            // In a real app, we'd have a dedicated analytics API. 
            // Here we'll process raw bookings data client-side for simplicity.
            const response = await fetch('/api/bookings')
            if (response.ok) {
                const data = await response.json()
                const bookings = data.bookings || []

                // Process data
                const uniqueEmails = new Set(bookings.map(b => b.email))
                const totalBookings = bookings.length
                const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length

                // Group by email to find returning customers
                const customerMap = {}
                bookings.forEach(b => {
                    if (!customerMap[b.email]) {
                        customerMap[b.email] = {
                            email: b.email,
                            name: b.name,
                            phone: b.phone,
                            id: b.user_id, // Capture user_id
                            bookings: 0,
                            lastBooking: null,
                            isRegistered: !!b.user_id
                        }
                    }
                    customerMap[b.email].bookings += 1
                    // Track simple last booking date (assuming desc sort from API)
                    if (!customerMap[b.email].lastBooking) {
                        customerMap[b.email].lastBooking = b.created_at
                    }
                })

                const customers = Object.values(customerMap).sort((a, b) => b.bookings - a.bookings)
                const returningCount = customers.filter(c => c.bookings > 1).length

                setStats({
                    totalCustomers: uniqueEmails.size,
                    returningCustomers: returningCount,
                    totalBookings,
                    confirmedRate: totalBookings ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
                    customers
                })
            }
        } catch (err) {
            console.error('Error fetching analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tighter">
                        Customers <span className="text-slate-400">Database</span>
                    </h1>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="px-6 py-2 bg-white border border-slate-200 text-black rounded-none font-black text-[10px] uppercase tracking-widest hover:border-black transition-colors"
                >
                    Refresh Data
                </button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total DB Size</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{stats.totalCustomers}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Repeat Clients</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{stats.returningCustomers}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{stats.totalBookings}</p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confirmation Rate</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{stats.confirmedRate}%</p>
                </div>
            </div>

            {/* Customer List Section */}
            <div className="bg-white border border-slate-200 mb-8">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-sm font-black text-black uppercase tracking-widest">Client Records</h2>
                </div>

                <div className="flex flex-col">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Client Identity</div>
                        <div className="col-span-2 text-right">Orders</div>
                        <div className="col-span-2 text-right">Last Active</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>

                    {loading ? (
                        <div className="py-24 text-center bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-widest">Loading records...</div>
                    ) : stats.customers.length === 0 ? (
                        <div className="py-24 text-center bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-widest">No matching records</div>
                    ) : (
                        stats.customers.map((customer, index) => (
                            <div
                                key={index}
                                className="group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 px-6 py-4 md:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => window.location.href = `/admin/customers/${customer.isRegistered && customer.id ? customer.id : customer.id || customer.email}`}
                            >
                                {/* Index */}
                                <div className="col-span-1 text-[10px] font-bold text-slate-400 hidden md:block">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>

                                {/* Identity */}
                                <div className="col-span-5 flex flex-col">
                                    <h3 className="text-sm font-black text-black uppercase tracking-tighter truncate group-hover:underline decoration-2 underline-offset-2">
                                        {customer.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span className="text-[10px] font-bold text-slate-500 truncate">{customer.email}</span>
                                        {customer.phone && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                                <span className="text-[10px] font-black tracking-widest text-slate-400 shrink-0">{customer.phone}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* High Density Stats */}
                                <div className="col-span-2 md:text-right">
                                    <span className="md:hidden text-[10px] text-slate-400 uppercase tracking-widest mr-2">Orders:</span>
                                    <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${customer.bookings > 1 ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        {customer.bookings}
                                    </span>
                                </div>

                                <div className="col-span-2 md:text-right">
                                    <span className="md:hidden text-[10px] text-slate-400 uppercase tracking-widest mr-2">Loc:</span>
                                    <span className="text-xs font-black text-black">
                                        {new Date(customer.lastBooking).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </span>
                                </div>

                                {/* Account Type */}
                                <div className="col-span-2 md:text-right">
                                    {customer.isRegistered ? (
                                        <span className="inline-block border border-black text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-block border border-slate-200 text-slate-400 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                            Guest
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
