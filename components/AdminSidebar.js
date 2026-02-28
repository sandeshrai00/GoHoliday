'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const navItems = [
    {
        name: 'Dashboard', href: '/admin/dashboard', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: 'Bookings', href: '/admin/bookings', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        name: 'Customers', href: '/admin/customers', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        name: 'Announcements', href: '/admin/announcements', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.3a1.598 1.598 0 01-1.283-2.541l2.304-3.32h4.562l2.117-1.922zM16.14 8.07c3.41.253 6.096 3.111 6.096 6.565 0 3.454-2.686 6.312-6.096 6.565M16.14 8.07V14M16.14 14V21.23a1.75 1.75 0 11-3.5 0v-7.23" />
            </svg>
        )
    },
    {
        name: 'Categories', href: '/admin/categories', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        )
    }
]

export default function AdminSidebar({ isOpen, setIsOpen, currentPath }) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' })
            if (response.ok) {
                router.push('/admin')
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 shadow-2xl lg:shadow-none`}>
            <div className="flex flex-col h-full px-4 py-8">
                {/* Logo */}
                <div className="px-4 mb-8 flex items-center justify-between">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                        <span className="text-xl font-black tracking-tight text-white">Go<span className="text-indigo-400 font-medium">Holidays</span></span>
                    </Link>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1.5 mt-4">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href || (item.href !== '/admin/dashboard' && currentPath.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3.5 transition-all duration-200 group rounded-xl ${isActive
                                    ? 'bg-indigo-600/10 text-indigo-400 font-bold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                <span className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User / Logout */}
                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-bold group-hover:text-red-400 transition-colors">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
