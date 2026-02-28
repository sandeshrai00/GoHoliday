import Skeleton from '@/components/Skeleton'

export default function AdminDashboardLoading() {
  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <Skeleton variant="title" className="w-96 mb-2" />
        <Skeleton variant="text" className="w-64" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Skeleton className="w-16 h-16 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-24 mb-2" />
              <Skeleton variant="title" className="w-16 h-10" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Skeleton className="w-16 h-16 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-32 mb-2" />
              <Skeleton variant="title" className="w-16 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Tours Management */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Skeleton variant="title" className="w-48" />
          <Skeleton className="w-full sm:w-40 h-10 rounded-md" />
        </div>

        {/* Desktop Table Skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-16" />
                </th>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-16" />
                </th>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-16" />
                </th>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-20" />
                </th>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-20" />
                </th>
                <th className="px-4 py-3">
                  <Skeleton variant="text" className="w-20" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-4">
                    <Skeleton className="h-16 w-24 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton variant="text" className="w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton variant="text" className="w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton variant="text" className="w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton variant="text" className="w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Skeleton className="w-16 h-8 rounded" />
                      <Skeleton className="w-16 h-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex gap-4 mb-3">
                <Skeleton className="h-20 w-28 rounded flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-3/4 mb-2" />
                  <Skeleton variant="text" className="w-24 h-6" />
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <Skeleton variant="text" className="w-40" />
                <Skeleton variant="text" className="w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10 rounded" />
                <Skeleton className="w-20 h-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
