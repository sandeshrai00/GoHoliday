'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    // Client-side auth guard for session expiry
    useEffect(() => {
        // Skip check if we are already on the login page
        if (pathname === '/admin') return;

        // Use the dedicated session check API
        fetch('/api/admin/session')
            .then(res => {
                if (!res.ok && res.status === 401) {
                    router.push('/admin')
                }
            })
            .catch(() => { })
    }, [pathname, router])

    // Define page titles based on pathname
    const getPageTitle = (path) => {
        if (path.includes('/dashboard')) return 'Dashboard'
        if (path.includes('/bookings')) return 'Bookings'
        if (path.includes('/customers')) return 'Customers'
        if (path.includes('/tours')) return 'Tours'
        if (path.includes('/announcements')) return 'Announcements'
        return 'Admin'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop & Mobile Drawer */}
            <AdminSidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                currentPath={pathname}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader
                    title={getPageTitle(pathname)}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-x-hidden p-2 md:p-4">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
