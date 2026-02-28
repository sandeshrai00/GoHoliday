'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteTourButton({ tourId, tourTitle }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/tours/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete tour')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting the tour')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex-1 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 text-[9px] uppercase font-black tracking-widest disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
