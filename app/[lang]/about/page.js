'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getDictionary } from '@/lib/i18n'

export default function AboutPage() {
    const params = useParams()
    const lang = params?.lang || 'en'
    const [dict, setDict] = useState(null)

    useEffect(() => {
        getDictionary(lang).then(setDict)
    }, [lang])

    if (!dict) return null

    const about = dict.about || {}

    return (
        <div className="min-h-screen flex flex-col">
            <Header lang={lang} dict={dict} />

            <main className="flex-grow bg-white">
                {/* Hero Section */}
                <section className="relative bg-primary-900 py-24 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                        <Image
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"
                            alt="About Us Hero Background"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <h1 className="text-4xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                            {about.title || 'About GoHolidays'}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto font-medium">
                            {about.subtitle || 'Your Trusted Cross-Border Travel Partner'}
                        </p>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                                <div className="md:w-1/2">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                        {about.ourStoryTitle || 'Our Story'}
                                    </h2>
                                    <div className="h-1.5 w-20 bg-primary-600 rounded-full mb-8"></div>
                                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                        {about.ourStoryContent}
                                    </p>
                                </div>
                                <div className="md:w-1/2 relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl">
                                    <Image
                                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071"
                                        alt="Nepal Temple"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 bg-gray-50 border-y border-gray-100">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto">
                            <div className="inline-block p-3 bg-primary-100 rounded-2xl mb-6">
                                <svg className="w-8 h-8 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                {about.missionTitle || 'Our Mission'}
                            </h2>
                            <p className="text-xl text-gray-600 italic leading-relaxed">
                                "{about.missionContent}"
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Us / Expertise Section */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
                            {about.whyUsTitle || 'Why Travel With Us?'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{about.expertise1Title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {about.expertise1Desc}
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{about.expertise2Title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {about.expertise2Desc}
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{about.expertise3Title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {about.expertise3Desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dict={dict} />
        </div>
    )
}
