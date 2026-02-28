export default function HomeLoading() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="h-20 bg-white border-b border-gray-100/50 w-full animate-pulse" />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-12 md:py-16 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                        <div className="h-12 sm:h-16 w-3/4 mb-4 rounded-xl bg-white/20 animate-pulse" />
                        <div className="h-6 w-5/6 mb-2 rounded-lg bg-white/15 animate-pulse" />
                        <div className="h-6 w-2/3 mb-10 rounded-lg bg-white/15 animate-pulse" />

                        {/* Search Bar */}
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-3 sm:p-4 max-w-4xl mx-auto w-full border border-white/20">
                            <div className="flex flex-row gap-2 h-12 sm:h-14">
                                <div className="flex-1 rounded-2xl bg-white/30 animate-pulse" />
                                <div className="w-32 sm:w-40 rounded-2xl bg-white/30 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="relative z-10 py-20 bg-gradient-to-b from-gray-50 to-white rounded-t-[2rem] sm:rounded-t-[3rem] mt-[-2rem] sm:mt-[-3rem]">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12 flex flex-col items-center">
                        <div className="h-8 w-1/3 mb-3 rounded-xl bg-gray-200 animate-pulse" />
                        <div className="h-1 w-24 bg-gray-200 mx-auto rounded-full mb-4 animate-pulse" />
                        <div className="h-5 w-1/2 rounded-lg bg-gray-100 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-6xl mx-auto">
                        <div className="h-64 sm:h-80 md:h-[500px] rounded-3xl bg-gray-200 animate-pulse" />
                        <div className="h-64 sm:h-80 md:h-[500px] rounded-3xl bg-gray-200 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Featured Tours */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12 flex flex-col items-center">
                        <div className="h-8 w-1/3 mb-3 rounded-xl bg-gray-200 animate-pulse" />
                        <div className="h-1 w-24 bg-gray-200 mx-auto rounded-full mb-4 animate-pulse" />
                        <div className="h-5 w-1/2 rounded-lg bg-gray-100 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 mb-12">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 ${i >= 3 ? 'hidden lg:block' : ''}`}>
                                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                                <div className="p-3 sm:p-4 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                    <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-5 w-1/3 rounded bg-gray-200 animate-pulse mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="h-8 w-1/4 mx-auto mb-3 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-1 w-24 bg-gray-200 mx-auto rounded-full mb-4 animate-pulse" />
                    <div className="h-5 w-1/2 mx-auto mb-12 rounded-lg bg-gray-100 animate-pulse" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 max-w-6xl mx-auto">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white border-2 border-gray-100 p-4 sm:p-8 rounded-3xl">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-4 mx-auto bg-gray-200 animate-pulse" />
                                <div className="h-4 w-2/3 mx-auto mb-2 rounded bg-gray-200 animate-pulse" />
                                <div className="h-3 w-3/4 mx-auto rounded bg-gray-100 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
