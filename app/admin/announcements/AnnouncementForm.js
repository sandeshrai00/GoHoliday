'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'

export default function AnnouncementForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [message, setMessage] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [type, setType] = useState('banner')
  const [popupType, setPopupType] = useState('general')
  const [imageUrl, setImageUrl] = useState('')

  // Discount fields
  const [tours, setTours] = useState([])
  const [toursLoading, setToursLoading] = useState(false)
  const [discountTourId, setDiscountTourId] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')

  // Fetch tours when discount popup type is selected
  useEffect(() => {
    if (type === 'popup' && popupType === 'discount' && tours.length === 0) {
      setToursLoading(true)
      fetch('/api/tours/list')
        .then(res => res.json())
        .then(data => setTours(Array.isArray(data) ? data : []))
        .catch(() => setTours([]))
        .finally(() => setToursLoading(false))
    }
  }, [type, popupType, tours.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!message.trim()) {
        setError('Message is required')
        setLoading(false)
        return
      }

      // Validate discount fields
      if (type === 'popup' && popupType === 'discount') {
        if (!discountTourId) {
          setError('Please select a tour package for the discount')
          setLoading(false)
          return
        }
        if (!discountPercentage || discountPercentage < 1 || discountPercentage > 99) {
          setError('Discount must be between 1% and 99%')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          is_active: isActive,
          type,
          popup_type: type === 'popup' ? popupType : null,
          image_url: type === 'popup' ? imageUrl : null,
          discount_tour_id: type === 'popup' && popupType === 'discount' ? discountTourId : null,
          discount_percentage: type === 'popup' && popupType === 'discount' ? discountPercentage : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Announcement created successfully!')
        setMessage('')
        setIsActive(false)
        setType('banner')
        setPopupType('general')
        setImageUrl('')
        setDiscountTourId('')
        setDiscountPercentage('')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create announcement')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl bg-white border border-slate-200 p-6 md:p-10">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-black uppercase tracking-tighter">Add Alert</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Post a new announcement</p>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-8 animate-shake">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-8 animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="group">
          <label htmlFor="message" className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
            Alert Text *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black transition-colors font-bold text-black text-sm outline-none resize-none"
            placeholder="Type your alert here..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
            Display Mode *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('banner')}
              className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                    ${type === 'banner' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
            >
              Banner
            </button>
            <button
              type="button"
              onClick={() => setType('popup')}
              className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                    ${type === 'popup' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
            >
              Popup
            </button>
          </div>
        </div>

        {type === 'popup' && (
          <div className="animate-fade-in border-t border-slate-200 pt-6 mt-6">
            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
              Popup Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPopupType('discount')}
                className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                      ${popupType === 'discount' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
              >
                Discount
              </button>
              <button
                type="button"
                onClick={() => setPopupType('new_feature')}
                className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                      ${popupType === 'new_feature' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
              >
                New Feature
              </button>
              <button
                type="button"
                onClick={() => setPopupType('system_update')}
                className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                      ${popupType === 'system_update' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
              >
                System Update
              </button>
              <button
                type="button"
                onClick={() => setPopupType('general')}
                className={`px-4 py-3 border transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest
                      ${popupType === 'general' ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'}`}
              >
                General
              </button>
            </div>
          </div>
        )}

        {/* Discount Tour Picker — shown when popup_type is discount */}
        {type === 'popup' && popupType === 'discount' && (
          <div className="animate-fade-in space-y-5">
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
                Select Tour Package *
              </label>
              {toursLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-black rounded-full animate-spin" />
                  Loading tours...
                </div>
              ) : tours.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">No tours found. Create a tour first.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {tours.map(tour => (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() => {
                        setDiscountTourId(tour.id)
                        if (tour.is_discount_active && tour.discount_percentage) {
                          setDiscountPercentage(tour.discount_percentage.toString())
                        } else {
                          setDiscountPercentage('')
                        }
                      }}
                      className={`w-full text-left px-4 py-3 border transition-colors flex items-center justify-between gap-3
                        ${discountTourId === tour.id
                          ? 'bg-slate-50 border-black'
                          : 'bg-transparent border-slate-200 hover:border-slate-400'}`}
                    >
                      <div className="min-w-0">
                        <div className={`text-sm font-bold truncate ${discountTourId === tour.id ? 'text-black' : 'text-slate-600'}`}>
                          {tour.title_en || tour.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {tour.location_en || tour.location} &middot; {tour.currency || 'USD'} {tour.price}
                        </div>
                      </div>
                      {discountTourId === tour.id && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-black flex-shrink-0">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="discountPct" className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
                Discount Percentage *
              </label>
              <div className="relative">
                <input
                  id="discountPct"
                  type="number"
                  min="1"
                  max="99"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black transition-colors font-bold text-black text-sm outline-none pr-12"
                  placeholder="e.g. 20"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">%</span>
              </div>
              {discountPercentage && discountTourId && (
                <div className="mt-3 px-4 py-3 bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {(() => {
                      const selectedTour = tours.find(t => t.id === discountTourId)
                      if (!selectedTour) return ''
                      const original = selectedTour.price
                      const discounted = original * (1 - discountPercentage / 100)
                      return `${selectedTour.currency || 'USD'} ${original.toFixed(0)} → ${selectedTour.currency || 'USD'} ${discounted.toFixed(0)} (${discountPercentage}% off)`
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popup Image Upload */}
        {type === 'popup' && (
          <div className="animate-fade-in border-t border-slate-200 pt-6 mt-6">
            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">
              Visual Asset
            </label>
            <div className="bg-transparent p-6 border border-slate-200">
              <ImageUpload
                images={imageUrl ? [imageUrl] : []}
                onUpload={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                isBanner={true}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-4 bg-slate-50 p-5 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-6 transition-colors duration-200 border border-black ${isActive ? 'bg-black' : 'bg-transparent'}`}
            >
              <span className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white border border-black transition-transform duration-200 ${isActive ? 'translate-x-[22px]' : ''}`} />
            </button>
            <span
              onClick={() => setIsActive(!isActive)}
              className="text-[10px] font-black text-black uppercase tracking-widest cursor-pointer select-none"
            >
              Activate Now
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white hover:bg-slate-800 transition-colors font-black text-[10px] uppercase tracking-[0.3em] disabled:bg-slate-300 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Save Alert</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
