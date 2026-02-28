'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getProfileDisplayName } from '@/lib/userUtils'
import Skeleton from './Skeleton'

// Helper function to get localized comment
function getLocalizedComment(review, lang) {
  if (!review) return '';

  // Try to get the localized comment based on the language
  const commentField = `comment_${lang}`;
  if (review[commentField]) {
    return review[commentField];
  }

  // Fallback to English if the localized version doesn't exist
  if (review.comment_en) {
    return review.comment_en;
  }

  // Final fallback to the default comment field
  return review.comment || '';
}

export default function TourReviews({ tourId, lang = 'en', dict }) {
  const [reviews, setReviews] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [existingReview, setExistingReview] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const formRef = useRef(null)

  // Constants for scroll behavior
  const SCROLL_OFFSET = 100 // Offset from top when scrolling to form
  const SCROLL_DELAY = 100 // Delay to ensure form is rendered before scrolling

  const fetchReviews = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Explicitly cast tourId to number to avoid string/number mismatch
      const numericTourId = Number(tourId)

      // Validate that tourId is a valid number
      if (isNaN(numericTourId)) {
        console.error('Invalid tourId:', tourId)
        setLoading(false)
        return
      }

      // Fetch reviews without profiles join to avoid PGRST200 errors
      // when the foreign key relationship is not configured in Supabase
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('tour_id', numericTourId)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError

      // Fetch profiles manually for these users to get names/emails
      if (reviewsData && reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map(r => r.user_id))].filter(Boolean)

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, first_name, last_name, email')
            .in('id', userIds)

          if (!profilesError && profilesData) {
            const profileMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile
              return acc
            }, {})

            const reviewsWithProfiles = reviewsData.map(review => ({
              ...review,
              profiles: profileMap[review.user_id] || null
            }))

            setReviews(reviewsWithProfiles)
          } else {
            setReviews(Array.isArray(reviewsData) ? reviewsData : [reviewsData])
          }
        } else {
          setReviews(Array.isArray(reviewsData) ? reviewsData : [reviewsData])
        }
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [tourId])

  const fetchExistingReview = useCallback(async (userId) => {
    if (!supabase || !userId) return

    try {
      const numericTourId = Number(tourId)
      if (isNaN(numericTourId)) return

      // Use select('*') to avoid 406 errors if some columns don't exist yet
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tour_id', numericTourId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if user hasn't reviewed yet
        console.error('Error fetching existing review:', error)
        return
      }

      if (data) {
        setExistingReview(data)
        setRating(data.rating)
        setComment(data.comment)
      }
    } catch (error) {
      console.error('Error in fetchExistingReview:', error)
    }
  }, [tourId])

  useEffect(() => {
    // Check current user
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          fetchExistingReview(currentUser.id)
        }
      })

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          fetchExistingReview(currentUser.id)
        } else {
          setExistingReview(null)
          setRating(5)
          setComment('')
        }
      })

      // Fetch reviews
      fetchReviews()

      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [fetchReviews, fetchExistingReview])

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      setError(dict?.reviews?.errorLogin || 'Please login to submit a review')
      return
    }

    if (!supabase) {
      setError(dict?.reviews?.errorConfig || 'Service temporarily unavailable.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setMessage('')

      // Translate the comment to Thai and Chinese
      const translationResponse = await fetch('/api/reviews/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      })

      let translatedComment = {
        comment_en: comment,
        comment_th: comment,
        comment_zh: comment
      }

      if (translationResponse.ok) {
        translatedComment = await translationResponse.json()
      } else {
        console.warn('Translation failed, using original comment for all languages')
      }

      const { error } = await supabase
        .from('reviews')
        .upsert([
          {
            tour_id: Number(tourId),
            user_id: user.id,
            rating,
            comment,
            comment_en: translatedComment.comment_en,
            comment_th: translatedComment.comment_th,
            comment_zh: translatedComment.comment_zh,
          }
        ], { onConflict: 'tour_id, user_id' })

      if (error) throw error

      const isUpdate = existingReview !== null
      setMessage(isUpdate ? (dict?.reviews?.successUpdate || 'Review updated successfully!') : (dict?.reviews?.successSubmit || 'Review submitted successfully!'))

      // Set isEditing to false after successful submission
      setIsEditing(false)

      // Refetch the user's review to ensure state is accurate
      await fetchExistingReview(user.id)

      // Refresh reviews
      fetchReviews()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate && onRate(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition' : ''}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{dict?.reviews?.title || 'Customer Reviews'}</h2>

      {!supabase ? null : (
        <>
          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                  <div className="text-sm text-gray-600">{dict?.reviews?.outOf5 || 'out of 5'}</div>
                </div>
                <div>
                  {renderStars(Math.round(averageRating))}
                  <div className="text-sm text-gray-600 mt-1">
                    {dict?.reviews?.basedOn || 'Based on'} {reviews.length} {reviews.length === 1 ? (dict?.reviews?.reviewSingular || 'review') : (dict?.reviews?.reviewPlural || 'reviews')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Review Form */}
          {user && (!existingReview || isEditing) && (
            <form ref={formRef} onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {existingReview ? (dict?.reviews?.editReview || 'Edit Your Review') : (dict?.reviews?.writeReview || 'Write a Review')}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {dict?.reviews?.rating || 'Rating'}
                </label>
                {renderStars(rating, true, setRating)}
              </div>

              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  {dict?.reviews?.yourReview || 'Your Review'}
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={dict?.reviews?.placeholder || "Share your experience with this tour..."}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (dict?.reviews?.submitting || 'Submitting...') : (existingReview ? (dict?.reviews?.updateReview || 'Update Review') : (dict?.reviews?.submitReview || 'Submit Review'))}
              </button>
            </form>
          )}

          {/* Login Prompt */}
          {!user && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-gray-700 mb-3">{dict?.reviews?.loginPrompt || 'Please login to write a review'}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
              >
                {dict?.reviews?.loginButton || 'Login'}
              </Link>
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton variant="avatar" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>{dict?.reviews?.noReviewsYet || 'No reviews yet. Be the first to review this tour!'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {review.profiles ? getProfileDisplayName(review.profiles) : (review.user_id ? `User ${String(review.user_id).slice(-6)}` : 'Anonymous')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{getLocalizedComment(review, lang)}</p>

                  {/* Update Review Button for user's own review */}
                  {user && review.user_id === user.id && (
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        // Scroll to form smoothly
                        setTimeout(() => {
                          if (formRef.current) {
                            window.scrollTo({
                              top: formRef.current.offsetTop - SCROLL_OFFSET,
                              behavior: 'smooth'
                            })
                          }
                        }, SCROLL_DELAY)
                      }}
                      className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      {dict?.reviews?.updateButton || 'Update Review'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
