'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TourCard from './TourCard'
import { getLocalizedField } from '@/lib/i18n'

export default function TourSearch({ tours, lang = 'en', dict }) {
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Set locationFilter from URL parameter
  useEffect(() => {
    const locationParam = searchParams.get('location')
    setLocationFilter(locationParam || 'all')
  }, [searchParams])

  // Extract unique locations from tours
  const uniqueLocations = useMemo(() => {
    const locations = tours.map(tour => getLocalizedField(tour, 'location', lang))
    return [...new Set(locations)].sort()
  }, [tours, lang])

  // Extract unique categories from tours
  const uniqueCategories = useMemo(() => {
    const categoryMap = new Map();
    tours.forEach(tour => {
      if (tour.categories && Array.isArray(tour.categories)) {
        tour.categories.forEach(cat => {
          categoryMap.set(cat.slug, getLocalizedField(cat, 'name', lang));
        });
      }
    });
    return Array.from(categoryMap.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [tours, lang])

  // Filter tours based on all criteria
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const localizedTitle = getLocalizedField(tour, 'title', lang)
      const localizedLocation = getLocalizedField(tour, 'location', lang)
      const tourCategoryNames = (tour.categories || []).map(cat => getLocalizedField(cat, 'name', lang).toLowerCase())

      const matchesSearch = searchTerm === '' ||
        localizedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        localizedLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourCategoryNames.some(name => name.includes(searchTerm.toLowerCase()))

      let matchesPrice = true
      if (priceRange === 'under500') {
        matchesPrice = tour.price < 500
      } else if (priceRange === '500-1000') {
        matchesPrice = tour.price >= 500 && tour.price < 1000
      } else if (priceRange === '1000-2000') {
        matchesPrice = tour.price >= 1000 && tour.price < 2000
      } else if (priceRange === '2000plus') {
        matchesPrice = tour.price >= 2000
      }

      const englishLocation = getLocalizedField(tour, 'location', 'en')
      const matchesLocation = locationFilter === 'all' ||
        localizedLocation === locationFilter ||
        englishLocation === locationFilter

      let matchesDuration = true
      if (durationFilter !== 'all') {
        const durationLower = tour.duration.toLowerCase()
        if (durationFilter === '1-3') {
          matchesDuration = /1|2|3.*day/i.test(durationLower) && !/week/i.test(durationLower)
        } else if (durationFilter === '4-7') {
          matchesDuration = /4|5|6|7.*day/i.test(durationLower) && !/week/i.test(durationLower)
        } else if (durationFilter === '1-2weeks') {
          matchesDuration = /1.*week|2.*week/i.test(durationLower) || /8|9|10|11|12|13|14.*day/i.test(durationLower)
        } else if (durationFilter === '2weeksplus') {
          matchesDuration = /\d+.*week/i.test(durationLower) && !/1.*week|2.*week/i.test(durationLower) || /1[5-9]|[2-9]\d.*day/i.test(durationLower)
        }
      }

      // Category matching
      const matchesCategory = categoryFilter === 'all' ||
        (tour.categories && tour.categories.some(cat => cat.slug === categoryFilter))

      return matchesSearch && matchesPrice && matchesLocation && matchesDuration && matchesCategory
    })
  }, [tours, searchTerm, priceRange, locationFilter, durationFilter, categoryFilter, lang])

  const handleClearFilters = () => {
    setSearchTerm('')
    setPriceRange('all')
    setLocationFilter('all')
    setDurationFilter('all')
    setCategoryFilter('all')
  }

  const hasActiveFilters = searchTerm !== '' || priceRange !== 'all' || locationFilter !== 'all' || durationFilter !== 'all' || categoryFilter !== 'all'

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Price Range</label>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50/50"
        >
          <option value="all">All Prices</option>
          <option value="under500">Under $500</option>
          <option value="500-1000">$500 - $1000</option>
          <option value="1000-2000">$1000 - $2000</option>
          <option value="2000plus">$2000+</option>
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Destinations</label>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50/50"
        >
          <option value="all">All Locations</option>
          {uniqueLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      {uniqueCategories.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Categories</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50/50"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Duration Filter */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Duration</label>
        <select
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50/50"
        >
          <option value="all">All Durations</option>
          <option value="1-3">1-3 Days</option>
          <option value="4-7">4-7 Days</option>
          <option value="1-2weeks">1-2 Weeks</option>
          <option value="2weeksplus">2+ Weeks</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
        >
          Reset All Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md py-4 -mx-4 px-4 mb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={dict?.tours?.searchPlaceholder || 'Search tours...'}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary-500 transition"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="p-3 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 transition relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Discovery</h3>
            <div className="relative mb-8">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find an adventure..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <FilterContent />
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <main className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-bold text-gray-500">
            Showing <span className="text-gray-900">{filteredTours.length}</span> adventures
          </h2>
        </div>

        <div className="transition-all duration-300">
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-6">
              {filteredTours.map((tour) => (
                <div key={tour.id} className="animate-on-scroll">
                  <TourCard tour={tour} lang={lang} dict={dict} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
              <div className="mb-6 opacity-30">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500 mb-6 px-4">Maybe try a different location or price range?</p>
              <button onClick={handleClearFilters} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md transition">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 shadow-2xl animate-fade-in-up">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterContent />
            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full mt-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-primary-500/30 transition"
            >
              See {filteredTours.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
