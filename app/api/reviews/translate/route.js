import { NextResponse } from 'next/server'
import { translateReviewComment } from '@/lib/translate'
import { createRateLimiter } from '@/lib/rateLimit'

const translateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  name: 'translatePOST',
  message: 'Too many requests. Please try again later.'
})

export async function POST(request) {
  try {
    // Rate limiting
    const rateLimitResult = translateRateLimiter(request);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: rateLimitResult.status }
      )
    }

    const data = await request.json()
    const { comment } = data

    // Validation
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }

    // Input length validation
    if (typeof comment !== 'string' || comment.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be a string under 2000 characters' },
        { status: 400 }
      )
    }

    // Translate comment to Thai and Chinese
    const translatedComment = await translateReviewComment(comment.trim())

    return NextResponse.json(translatedComment)
  } catch (error) {
    console.error('Translate review comment error:', error.message)
    return NextResponse.json(
      { error: 'An error occurred while translating the comment' },
      { status: 500 }
    )
  }
}
