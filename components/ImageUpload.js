'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function ImageUpload({ images = [], onUpload, onRemove, isBanner = false }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  let parsedImages = images;
  if (typeof images === 'string') {
    try { parsedImages = JSON.parse(images); } catch (e) { parsedImages = []; }
  }
  const safeImages = Array.isArray(parsedImages) ? parsedImages : [];

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setError('')
    setUploading(true)

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select image files only')
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File too large. Max 10MB per image.')
          continue
        }

        if (cloudName) {
          // Upload directly to Cloudinary unsigned upload API
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', 'ml_default')

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          })

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            throw new Error(errData?.error?.message || 'Upload failed')
          }

          const data = await res.json()
          if (data.secure_url) {
            onUpload(data.secure_url)
          }
        } else {
          // Fallback: create a local object URL preview
          const objectUrl = URL.createObjectURL(file)
          onUpload(objectUrl)
        }

        // If banner mode, only upload first file
        if (isBanner) break
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!isBanner}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{isBanner ? 'Choose Banner Image' : 'Choose Images'}</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      {/* Image Previews */}
      {safeImages.length > 0 && (
        <div className={`grid gap-3 ${isBanner ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {safeImages.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Remove image"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
