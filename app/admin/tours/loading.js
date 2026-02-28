import Skeleton from '@/components/Skeleton'

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <Skeleton variant="title" className="h-8 w-48 mb-2" />
                    <Skeleton variant="text" className="h-4 w-64 text-gray-400" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Table Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header Row Skeleton */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-12 gap-4">
                    <Skeleton className="col-span-4 h-4 w-24 bg-gray-200" />
                    <Skeleton className="col-span-2 h-4 w-16 bg-gray-200" />
                    <Skeleton className="col-span-2 h-4 w-24 bg-gray-200" />
                    <Skeleton className="col-span-2 h-4 w-16 bg-gray-200" />
                    <Skeleton className="col-span-2 h-4 w-20 bg-gray-200 justify-self-end" />
                </div>

                {/* Table Body Rows Skeleton */}
                <div className="divide-y divide-gray-100">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                                <Skeleton className="h-12 w-16 rounded-lg flex-shrink-0" />
                                <div>
                                    <Skeleton variant="text" className="h-5 w-48 mb-1" />
                                    <Skeleton variant="text" className="h-3 w-32" />
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="col-span-2 flex items-center">
                                <Skeleton variant="text" className="h-5 w-24" />
                            </div>
                            <div className="col-span-2 flex items-center">
                                <Skeleton variant="text" className="h-5 w-16" />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 items-center">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination/Footer Skeleton */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                    <Skeleton variant="text" className="h-4 w-48" />
                </div>
            </div>
        </div>
    )
}
