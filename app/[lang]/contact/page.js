'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getDictionary } from '@/lib/i18n'

export default function ContactPage() {
    const params = useParams()
    const lang = params?.lang || 'en'
    const [dict, setDict] = useState(null)

    useEffect(() => {
        getDictionary(lang).then(setDict)
    }, [lang])

    if (!dict) return null

    return (
        <div className="min-h-screen flex flex-col">
            <Header lang={lang} dict={dict} />

            <main className="flex-grow bg-white">
                {/* Hero Section */}
                <section className="relative bg-primary-900 py-20 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2070"
                            alt="Contact Hero Background"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{dict.footer.contact}</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Have questions about our tours? We're here to help you plan your perfect Nepal or Thailand journey.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto bg-gray-50 rounded-[3rem] p-12 md:p-20 border border-gray-100 shadow-sm">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h2>
                                <p className="text-lg text-gray-600">Connect with our regional experts via email, phone, or visit our local offices.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Email */}
                                <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Email Us</h3>
                                    <a href="mailto:support@goholidays.me" className="text-primary-800 font-medium hover:underline mb-1">support@goholidays.me</a>
                                    <a href="mailto:sandesh@goholidays.me" className="text-primary-800 font-medium hover:underline">sandesh@goholidays.me</a>
                                </div>

                                {/* Phone */}
                                <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
                                    <p className="text-2xl font-bold text-gray-800">xxxxx</p>
                                    <p className="text-gray-500 mt-2 text-sm italic">Available for WhatsApp & Voice</p>
                                </div>

                                {/* Offices */}
                                <div className="md:col-span-2 flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Our Offices</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 w-full">
                                        <div>
                                            <p className="font-bold text-gray-900">Bangkok, Thailand</p>
                                            <p className="text-gray-600">Sukhumvit Rd, 10110</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Kathmandu, Nepal</p>
                                            <p className="text-gray-600">Thamel, Ward No. 26</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dict={dict} />
        </div>
    )
}
