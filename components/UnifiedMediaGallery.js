'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { CldVideoPlayer } from 'next-cloudinary'
import Skeleton from './Skeleton'
import 'next-cloudinary/dist/cld-video-player.css'

export default function UnifiedMediaGallery({ videos = [], images = [], tourTitle = 'Tour' }) {
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [activeMedia, setActiveMedia] = useState([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const scrollRef = useRef(null)

    // Combine videos and images into a single media array
    useEffect(() => {
        let parsedVideos = videos;
        let parsedImages = images;

        if (typeof videos === 'string') {
            try { parsedVideos = JSON.parse(videos); } catch (e) { parsedVideos = []; }
        }
        if (typeof images === 'string') {
            try { parsedImages = JSON.parse(images); } catch (e) { parsedImages = []; }
        }

        const safeVideos = Array.isArray(parsedVideos) ? parsedVideos : [];
        const safeImages = Array.isArray(parsedImages) ? parsedImages : [];

        const combinedMedia = [
            ...safeVideos.map(v => ({ type: 'video', src: typeof v === 'string' ? v : v.public_id })),
            ...safeImages.map(img => ({ type: 'image', src: img }))
        ]
        setActiveMedia(combinedMedia)
        // Simulate a small delay for smoother transition if initializing instantly
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [videos, images])

    // Track scroll position to update active index for thumbnails
    const handleScroll = (e) => {
        if (!scrollRef.current) return;
        const scrollLeft = e.target.scrollLeft;
        const itemWidth = e.target.offsetWidth * 0.85 + 16; // 85% width + 16px gap
        const index = Math.round(scrollLeft / itemWidth);
        if (index !== activeIndex && index >= 0 && index < activeMedia.length) {
            setActiveIndex(index);
        }
    };

    const scrollToIndex = (index) => {
        if (!scrollRef.current) return;
        const itemWidth = scrollRef.current.offsetWidth * 0.85 + 16;
        scrollRef.current.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
        });
        setActiveIndex(index);
    }

    const closeLightbox = useCallback(() => {
        setSelectedIndex(null)
        // If we have a gallery state in history, go back to clear it
        if (window.history.state?.gallery) {
            window.history.back()
        }
    }, [])

    const openLightbox = (index) => {
        setSelectedIndex(index)
        // Push state so back button/gesture closes lightbox instead of page navigation
        window.history.pushState({ gallery: true }, '')
    }

    // Handle browser back button / mobile back gesture
    useEffect(() => {
        const handlePopState = (e) => {
            if (selectedIndex !== null) {
                setSelectedIndex(null)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [selectedIndex])

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeLightbox()
        }
    }

    const goToPrevious = useCallback(() => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeMedia.length - 1))
    }, [activeMedia.length])

    const goToNext = useCallback(() => {
        setSelectedIndex((prev) => (prev < activeMedia.length - 1 ? prev + 1 : 0))
    }, [activeMedia.length])

    // Keyboard navigation
    useEffect(() => {
        if (selectedIndex === null) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') goToPrevious()
            if (e.key === 'ArrowRight') goToNext()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIndex, closeLightbox, goToPrevious, goToNext])

    // Touch Swipe handling
    const minSwipeDistance = 50

    const onTouchStart = (e) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isLeftSwipe) goToNext()
        if (isRightSwipe) goToPrevious()
    }

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [selectedIndex])

    if (loading || activeMedia.length === 0) {
        return (
            <div className="w-full">
                {/* Mobile Skeleton */}
                <div className="md:hidden">
                    <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-1">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-none w-[85%] aspect-[4/3]">
                                <Skeleton variant="galleryItem" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-1 mb-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="flex-none w-14 h-10" />
                        ))}
                    </div>
                </div>
                {/* Desktop Skeleton */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
                    <Skeleton className="col-span-2 row-span-2 h-full" />
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full ${selectedIndex !== null ? 'relative z-[9999]' : ''}`}>
            {/* Mobile: Horizontal scroll (Play Store style) */}
            <div className="md:hidden">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-5 pb-6 px-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {activeMedia.map((item, index) => (
                        <div
                            key={index}
                            className="flex-none w-[88%] aspect-[4/3] snap-center snap-always transition-transform duration-300"
                            onClick={() => openLightbox(index)}
                        >
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-gray-50">
                                {item.type === 'video' ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-gray-900 border-4 border-white/10">
                                        <div className="absolute inset-0 z-10 bg-black/30 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl scale-100 active:scale-90 transition-transform">
                                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="p-4 text-white/40 text-xs font-bold uppercase tracking-widest text-center">
                                            Video Experience
                                        </div>
                                    </div>
                                ) : (
                                    <Image
                                        src={item.src}
                                        alt={`${tourTitle} - ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="88vw"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Mini Previews (Thumbnails) - More Professional */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar py-4 px-1 mb-2">
                    {activeMedia.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`relative flex-none w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-500 ${activeIndex === index
                                ? 'border-primary-600 scale-110 shadow-lg ring-4 ring-primary-50'
                                : 'border-gray-100 opacity-60 hover:opacity-100'
                                }`}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            ) : (
                                <Image
                                    src={item.src}
                                    alt="thumb"
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            )}
                            {activeIndex === index && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-600 animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop: Professional Grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
                {/* Big first item (video or first image) */}
                <div
                    className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                    onClick={() => openLightbox(0)}
                >
                    {activeMedia[0].type === 'video' ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all scale-100 group-hover:scale-110">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-white opacity-40">Play Video</div>
                        </div>
                    ) : (
                        <>
                            <Image
                                src={activeMedia[0].src}
                                alt={tourTitle}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 1200px) 50vw, 800px"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                        </>
                    )}
                </div>

                {/* Secondary items */}
                {activeMedia.slice(1, 5).map((item, index) => (
                    <div
                        key={index + 1}
                        className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                        onClick={() => openLightbox(index + 1)}
                    >
                        {item.type === 'video' ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Image
                                    src={item.src}
                                    alt={`${tourTitle} - ${index + 2}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="25vw"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                            </>
                        )}

                        {/* "See more" overlay on the last item if there are more than 5 items */}
                        {index === 3 && activeMedia.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <span className="text-white font-bold text-xl">+{activeMedia.length - 5}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 touch-none"
                    onClick={handleBackdropClick}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Header/Close */}
                    <div className="absolute top-0 left-0 right-0 p-4 md:p-8 pt-20 md:pt-20 flex justify-between items-center z-[110] pointer-events-none">
                        <button
                            onClick={closeLightbox}
                            className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl text-white text-sm font-black transition-all pointer-events-auto shadow-2xl active:scale-95 group"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>BACK</span>
                        </button>

                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-white/90 font-black bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-xs tracking-widest">
                                {selectedIndex + 1} / {activeMedia.length}
                            </div>
                        </div>

                        {/* Mobile Only Counter */}
                        <div className="md:hidden text-white/90 font-black bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-[10px] tracking-widest">
                            {selectedIndex + 1} / {activeMedia.length}
                        </div>
                    </div>

                    {/* Media Content */}
                    <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center pointer-events-none">
                        {activeMedia[selectedIndex].type === 'video' ? (
                            <div className="w-full h-full pointer-events-auto flex items-center justify-center">
                                <CldVideoPlayer
                                    key={activeMedia[selectedIndex].src}
                                    width="1920"
                                    height="1080"
                                    src={activeMedia[selectedIndex].src}
                                    colors={{ accent: '#3b82f6', base: '#000000', text: '#ffffff' }}
                                    className="rounded-xl overflow-hidden shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-full pointer-events-auto">
                                <Image
                                    src={activeMedia[selectedIndex].src}
                                    alt={`${tourTitle} - Full`}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="contents">
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 active:scale-95 pointer-events-auto z-30"
                            aria-label="Previous"
                        >
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 active:scale-95 pointer-events-auto z-30"
                            aria-label="Next"
                        >
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Thumbnails Strip (Desktop Only) */}
                    <div className="hidden md:flex gap-2 mt-8 overflow-x-auto max-w-full px-4 py-2">
                        {activeMedia.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx); }}
                                className={`relative w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedIndex === idx ? 'border-primary-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <Image src={item.src} alt="thumb" fill className="object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}
