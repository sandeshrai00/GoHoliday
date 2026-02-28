'use client'

import { useState, useRef } from 'react'

export default function VideoUpload({ videos = [], onUpload, onRemove }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    let parsedVideos = videos;
    if (typeof videos === 'string') {
        try { parsedVideos = JSON.parse(videos); } catch (e) { parsedVideos = []; }
    }
    const safeVideos = Array.isArray(parsedVideos) ? parsedVideos : [];

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        setError('')
        setUploading(true)

        try {
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('video/')) {
                    setError('Please select video files only')
                    continue
                }

                // Validate file size (max 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    setError('File too large. Max 100MB per video.')
                    continue
                }

                if (cloudName) {
                    // Upload directly to Cloudinary unsigned upload API
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('upload_preset', 'ml_default')
                    formData.append('resource_type', 'video')

                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                        method: 'POST',
                        body: formData
                    })

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}))
                        throw new Error(errData?.error?.message || 'Upload failed')
                    }

                    const data = await res.json()
                    if (data.public_id || data.secure_url) {
                        onUpload(data.public_id || data.secure_url)
                    }
                } else {
                    // Fallback: use the file name as identifier
                    onUpload(file.name)
                }
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError(err.message || 'Failed to upload video. Please try again.')
        } finally {
            setUploading(false)
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
                accept="video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Button */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Choose Videos</span>
                    </>
                )}
            </button>

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* Video Previews */}
            {safeVideos.length > 0 && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {safeVideos.map((vid, index) => (
                        <div key={index} className="relative group bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-slate-600 truncate font-medium">
                                    {typeof vid === 'string' ? vid : vid.public_id}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                                aria-label="Remove video"
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
