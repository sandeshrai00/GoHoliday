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
            </div>

            {/* Table Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header Row Skeleton */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-5 gap-4">
                    <Skeleton variant="text" className="col-span-2 h-4 w-32 bg-gray-200" />
                    <Skeleton variant="text" className="col-span-1 h-4 w-24 bg-gray-200" />
                    <Skeleton variant="text" className="col-span-1 h-4 w-24 bg-gray-200" />
                    <Skeleton variant="text" className="col-span-1 h-4 w-32 bg-gray-200" />
                </div>

                {/* Table Body Rows Skeleton */}
                <div className="divide-y divide-gray-100">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 grid grid-cols-5 gap-4 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-2">
                                <Skeleton variant="text" className="h-5 w-40 mb-1" />
                                <Skeleton variant="text" className="h-3 w-48 text-gray-500" />
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton variant="text" className="h-5 w-24" />
                            </div>
                            <div className="col-span-1">
                                <Skeleton variant="text" className="h-5 w-12 mb-1" />
                                <Skeleton variant="text" className="h-3 w-20 text-gray-500" />
                            </div>
                            <div className="col-span-1">
                                <Skeleton variant="text" className="h-5 w-24 mb-1" />
                                <Skeleton variant="text" className="h-3 w-16 text-gray-500" />
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
