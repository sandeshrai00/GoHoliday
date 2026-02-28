import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await login(email, password)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      // Artificial delay to prevent brute-force attacks
      await new Promise(resolve => setTimeout(resolve, 1500));

      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
