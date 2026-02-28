export default function ToursLoading() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="h-20 bg-white border-b border-gray-100/50 w-full animate-pulse" />

            {/* Page Header */}
            <section className="bg-white py-12 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <div className="h-10 sm:h-12 w-1/3 mx-auto mb-4 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-5 w-1/2 mx-auto rounded-lg bg-gray-100 animate-pulse" />
                </div>
            </section>

            {/* Content Area */}
            <section className="py-8 sm:py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Mobile: Sticky search bar */}
                        <div className="lg:hidden sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md py-4 -mx-4 px-4 mb-2">
                            <div className="flex gap-2">
                                <div className="flex-1 h-12 bg-white rounded-xl animate-pulse shadow-sm" />
                                <div className="w-12 h-12 bg-gray-300 rounded-xl animate-pulse" />
                            </div>
                        </div>

                        {/* Desktop: Sidebar */}
                        <aside className="hidden lg:block w-72 shrink-0">
                            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <div className="h-6 w-24 rounded-lg bg-gray-200 animate-pulse mb-6" />
                                <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                <div className="space-y-4">
                                    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </aside>

                        {/* Main Grid */}
                        <main className="flex-1 min-w-0">
                            <div className="mb-6">
                                <div className="h-5 w-40 rounded-lg bg-gray-200 animate-pulse" />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                                        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                                        <div className="p-3 sm:p-4 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                            <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                                            <div className="h-5 w-1/3 rounded bg-gray-200 animate-pulse mt-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </main>
                    </div>
                </div>
            </section>
        </div>
    )
}
