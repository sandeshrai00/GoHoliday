export default function TourDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-100/50 w-full animate-pulse" />

      {/* Hero Banner */}
      <section className="w-full">
        <div className="relative h-[400px] md:h-[500px] w-full bg-gray-200 animate-pulse">
          {/* Back button placeholder */}
          <div className="absolute top-8 left-6 md:left-12 z-20">
            <div className="w-20 h-9 rounded-xl bg-white/20 animate-pulse" />
          </div>
          {/* Title overlay placeholders */}
          <div className="absolute bottom-12 left-6 right-6 md:bottom-16 md:left-12 md:right-12 z-20">
            <div className="max-w-4xl">
              <div className="flex gap-2 mb-4">
                <div className="w-16 h-5 rounded-lg bg-white/20 animate-pulse" />
                <div className="w-20 h-5 rounded-lg bg-white/20 animate-pulse" />
              </div>
              <div className="h-10 md:h-16 w-3/4 rounded-xl bg-white/25 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <main className="container mx-auto px-4 md:px-6 mt-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 rounded-full bg-gray-300 animate-pulse" />
                <div className="h-6 w-32 rounded-lg bg-gray-200 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gray-300 animate-pulse" />
                  <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="h-4 w-14 rounded-full bg-gray-100 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="hidden lg:block sticky top-24 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="h-8 w-2/3 rounded-lg bg-gray-200 animate-pulse mb-6" />
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
              <div className="h-14 w-full rounded-2xl bg-gray-200 animate-pulse" />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 p-4 flex items-center justify-between">
        <div>
          <div className="h-3 w-12 rounded bg-gray-200 animate-pulse mb-1" />
          <div className="h-6 w-20 rounded bg-gray-300 animate-pulse" />
        </div>
        <div className="h-12 w-28 rounded-xl bg-gray-300 animate-pulse" />
      </div>
    </div>
  )
}
