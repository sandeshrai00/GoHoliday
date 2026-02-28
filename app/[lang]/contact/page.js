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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getDictionary(lang).then(setDict)
    }, [lang])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus({ type: '', message: '' })

        // Simulate form submission
        try {
            // In a real app, you would send this to an API
            await new Promise(resolve => setTimeout(resolve, 1500))
            setStatus({
                type: 'success',
                message: dict?.booking?.successMessage || 'Thank you! Your message has been sent successfully. We will get back to you soon.'
            })
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            setStatus({
                type: 'error',
                message: dict?.booking?.errorMessage || 'Something went wrong. Please try again later.'
            })
        } finally {
            setLoading(false)
        }
    }

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

                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                                            <p className="text-gray-600">info@goholiday.com</p>
                                            <p className="text-gray-600">support@goholiday.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Call Us</h3>
                                            <p className="text-gray-600">+66 2 123 4567 (Thailand)</p>
                                            <p className="text-gray-600">+977 1 4567890 (Nepal)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Our Offices</h3>
                                            <p className="text-gray-600">Sukhumvit Rd, Bangkok, Thailand</p>
                                            <p className="text-gray-600">Thamel, Kathmandu, Nepal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {status.message && (
                                        <div className={`p-4 rounded-2xl text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {status.message}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            placeholder="Tour Inquiry"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                            placeholder="Tell us how we can help you..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary-800 text-white rounded-xl font-bold hover:bg-primary-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dict={dict} />
        </div>
    )
}
