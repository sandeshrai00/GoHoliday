'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
    useEffect(() => {
        // Optionally log to error reporting service
        console.error('Caught by error boundary:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col px-4 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
                Something went wrong!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
                We apologize for the inconvenience. {error.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition shadow-lg"
            >
                Try again
            </button>
        </div>
    )
}
