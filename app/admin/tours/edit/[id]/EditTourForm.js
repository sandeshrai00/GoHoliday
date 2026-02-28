'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import VideoUpload from '@/components/VideoUpload'
import RichTextEditor from '@/components/RichTextEditor'

export default function EditTourForm({ tour }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  // Load available categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) setCategories(await res.json())
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  // Initialize selected categories from the tour prop
  useEffect(() => {
    if (tour.categories && Array.isArray(tour.categories)) {
      setSelectedCategories(tour.categories.map(c => c.category_id || c.id))
    }
  }, [tour])

  // Parse existing gallery images and videos
  let existingGalleryImages = []
  let existingVideoUrls = []
  try {
    if (tour.image_urls) {
      existingGalleryImages = JSON.parse(tour.image_urls)
      if (typeof existingGalleryImages === 'string') { try { existingGalleryImages = JSON.parse(existingGalleryImages); } catch (e) { } }
      if (!Array.isArray(existingGalleryImages)) existingGalleryImages = existingGalleryImages ? [existingGalleryImages] : []
    }
    if (tour.video_urls) {
      existingVideoUrls = JSON.parse(tour.video_urls)
      if (typeof existingVideoUrls === 'string') { try { existingVideoUrls = JSON.parse(existingVideoUrls); } catch (e) { } }
      if (!Array.isArray(existingVideoUrls)) existingVideoUrls = existingVideoUrls ? [existingVideoUrls] : []
    }
  } catch (e) {
    console.error('Error parsing gallery URLs:', e)
  }

  const [formData, setFormData] = useState({
    title: tour.title_en || tour.title || '',
    description: tour.description_en || tour.description || '',
    price: tour.price || '',
    currency: tour.currency || 'USD',
    duration: tour.duration || '',
    dates: tour.dates || '',
    location: tour.location_en || tour.location || '',
    is_discount_active: tour.is_discount_active === 1,
    discount_percentage: tour.discount_percentage ? tour.discount_percentage.toString() : '',
  })

  const [bannerImage, setBannerImage] = useState(tour.banner_image || '')
  const [galleryImages, setGalleryImages] = useState(existingGalleryImages)
  const [videoUrls, setVideoUrls] = useState(existingVideoUrls)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBannerUpload = (url) => {
    setBannerImage(url)
  }

  const handleBannerRemove = () => {
    setBannerImage('')
  }

  const handleGalleryUpload = (url) => {
    setGalleryImages(prev => [...prev, url])
  }

  const handleGalleryRemove = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleVideoUpload = (url) => {
    setVideoUrls(prev => [...prev, url])
  }

  const handleVideoRemove = (index) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.price ||
        !formData.duration || !formData.dates || !formData.location) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/tours/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tour.id,
          ...formData,
          price: parseFloat(formData.price),
          is_discount_active: formData.is_discount_active,
          discount_percentage: formData.is_discount_active && formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
          banner_image: bannerImage,
          image_urls: JSON.stringify(galleryImages),
          video_urls: JSON.stringify(videoUrls),
          category_ids: selectedCategories, // Send selected categories
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Tour updated successfully!')
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 1500)
      } else {
        setError(data.error || 'Failed to update tour')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Tours</Link>
            <span className="opacity-40">/</span>
            <span className="text-slate-900">Edit</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
            Edit <span className="text-indigo-600">Tour</span>
          </h1>
        </div>
      </div>

      <div className="pro-card rounded-[2rem] overflow-hidden border-slate-100">
        <div className="px-6 md:px-10 py-5 bg-slate-50/30 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">Tour Details</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Basic Information</p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-10 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-10 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="title" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Tour Name *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none shadow-inner"
                  placeholder="e.g. ULTRA-PREMIUM MALDIVES ESCAPE"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="price" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Price *
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none shadow-inner"
                      placeholder="0.00"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {formData.currency}
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="currency" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Currency *
                  </label>
                  <div className="relative">
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none cursor-pointer appearance-none shadow-inner"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="THB">THB - Thai Baht</option>
                      <option value="NPR">NPR - Nepali Rupee</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                  placeholder="Describe the tour details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="duration" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Duration *
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none shadow-inner"
                    placeholder="e.g. 7 DAYS / 6 NIGHTS"
                  />
                </div>

                <div className="group">
                  <label htmlFor="dates" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Available Dates *
                  </label>
                  <input
                    id="dates"
                    name="dates"
                    type="text"
                    value={formData.dates}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none shadow-inner"
                    placeholder="e.g. Q3 2026, SELECT DATES"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="location" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm outline-none shadow-inner"
                  placeholder="e.g. MALE, MALDIVES"
                />
              </div>

              {/* Categories Section */}
              <div className="group pt-4 border-t border-slate-100">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                  Tour Categories
                </label>
                {categories.length === 0 ? (
                  <div className="text-xs text-slate-500 font-bold ml-1">No categories available. Please create them in the Category Library first.</div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories.map(cat => {
                      const isSelected = selectedCategories.includes(cat.id)
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategories(selectedCategories.filter(id => id !== cat.id))
                            } else {
                              setSelectedCategories([...selectedCategories, cat.id])
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          {cat.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Discount Section */}
              <div className="group pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_discount_active: !prev.is_discount_active }))}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${formData.is_discount_active ? 'bg-amber-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-[4px] left-[4px] h-5 w-5 bg-white rounded-full border border-slate-300 transition-transform duration-200 ${formData.is_discount_active ? 'translate-x-5 border-white' : ''}`} />
                  </button>
                  <span
                    onClick={() => setFormData(prev => ({ ...prev, is_discount_active: !prev.is_discount_active }))}
                    className="text-[10px] font-black text-slate-900 uppercase tracking-widest cursor-pointer select-none"
                  >
                    Activate Discount
                  </span>
                </div>

                {formData.is_discount_active && (
                  <div className="animate-fade-in pl-2 max-w-sm">
                    <label htmlFor="discount_percentage" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                      Discount Percentage *
                    </label>
                    <div className="relative">
                      <input
                        id="discount_percentage"
                        name="discount_percentage"
                        type="number"
                        min="1"
                        max="99"
                        value={formData.discount_percentage}
                        onChange={handleChange}
                        required={formData.is_discount_active}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-900 text-sm outline-none pr-12 shadow-inner"
                        placeholder="e.g. 20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-amber-500">%</span>
                    </div>
                    {formData.discount_percentage && formData.price && (
                      <div className="mt-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100 inline-block">
                        <p className="text-xs font-bold text-amber-700">
                          Final Price: {formData.currency} {Math.round(parseFloat(formData.price) * (1 - parseFloat(formData.discount_percentage) / 100))}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
              <div className="md:col-span-2">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Media Assets</h3>
              </div>

              <div className="pro-card p-6 md:p-8 rounded-2xl border-slate-100">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                  Main Image (Banner)
                </label>
                <ImageUpload
                  images={bannerImage ? [bannerImage] : []}
                  onUpload={handleBannerUpload}
                  onRemove={handleBannerRemove}
                  isBanner={true}
                />
              </div>

              <div className="pro-card p-6 md:p-8 rounded-2xl border-slate-100">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                  Gallery Images
                </label>
                <ImageUpload
                  images={galleryImages}
                  onUpload={handleGalleryUpload}
                  onRemove={handleGalleryRemove}
                  isBanner={false}
                />
              </div>

              <div className="md:col-span-2 pro-card p-6 md:p-8 rounded-2xl border-slate-100">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                  Video Links
                </label>
                <VideoUpload
                  videos={videoUrls}
                  onUpload={handleVideoUpload}
                  onRemove={handleVideoRemove}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] disabled:bg-slate-200 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-[0.98] group flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                )}
                {loading ? 'Processing...' : 'Update Tour'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
