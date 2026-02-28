export default function BookingLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="h-20 bg-white border-b border-gray-100/50 w-full animate-pulse" />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Back Link */}
                <div className="flex items-center mb-6 gap-2">
                    <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tour Summary Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
                            <div className="h-48 w-full bg-gray-200 animate-pulse" />
                            <div className="p-6">
                                <div className="h-5 w-5/6 rounded bg-gray-200 animate-pulse mb-3" />
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-50">
                            <div className="h-8 w-2/3 rounded-lg bg-gray-200 animate-pulse mb-3" />
                            <div className="h-5 w-1/2 rounded bg-gray-100 animate-pulse mb-8" />

                            <div className="space-y-6">
                                {/* Guest counters */}
                                <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-200/60 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                        <div>
                                            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse mb-1" />
                                            <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                                        </div>
                                        <div className="h-10 w-28 rounded-xl bg-gray-200 animate-pulse" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse mb-1" />
                                            <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                                        </div>
                                        <div className="h-10 w-28 rounded-xl bg-gray-200 animate-pulse" />
                                    </div>
                                </div>

                                {/* Input fields */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse mb-2" />
                                        <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="h-3 w-14 rounded bg-gray-200 animate-pulse mb-2" />
                                            <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="h-3 w-14 rounded bg-gray-200 animate-pulse mb-2" />
                                            <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact method */}
                                <div>
                                    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse mb-3" />
                                    <div className="flex gap-4">
                                        <div className="h-12 flex-1 rounded-xl bg-gray-100 animate-pulse" />
                                        <div className="h-12 flex-1 rounded-xl bg-gray-100 animate-pulse" />
                                    </div>
                                </div>

                                {/* Total + Submit */}
                                <div className="bg-gray-50 px-6 py-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100 mt-6">
                                    <div className="text-center md:text-left">
                                        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse mb-2" />
                                        <div className="h-8 w-28 rounded bg-gray-300 animate-pulse" />
                                    </div>
                                    <div className="h-14 w-36 rounded-xl bg-gray-300 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
