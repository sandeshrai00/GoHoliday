'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/components/CurrencyProvider'
import { useAuth } from '@/components/AuthProvider'

const bookingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(6, 'Please enter a valid phone number'),
    guests: z.number().min(1, 'At least 1 adult guest is required'),
    children: z.number().min(0),
    contact_method: z.enum(['whatsapp', 'email']),
    message: z.string().max(2000, 'Message is too long').optional(),
})

export default function BookingForm({ tourId, tourTitle, basePrice, currency = 'USD', dict, onClose }) {
    const router = useRouter()
    const { convertPrice } = useCurrency()
    const b = dict?.booking || {}

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            guests: 1,
            children: 0,
            contact_method: 'whatsapp',
            message: ''
        }
    })

    // Watch values to compute total price
    const guestsWatch = watch('guests', 1)
    const childrenWatch = watch('children', 0)
    const contactMethodWatch = watch('contact_method', 'whatsapp')
    const [totalPrice, setTotalPrice] = useState(basePrice)

    // Update total price when guests or children change
    useEffect(() => {
        const adultTotal = (guestsWatch || 1) * basePrice
        const childTotal = (childrenWatch || 0) * (basePrice * 0.5)
        setTotalPrice(adultTotal + childTotal)
    }, [guestsWatch, childrenWatch, basePrice])

    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                let phone =
                    user.phone ||
                    user.user_metadata?.phone ||
                    user.user_metadata?.phone_number ||
                    user.user_metadata?.mobile ||
                    user.app_metadata?.phone ||
                    '';

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('phone_number')
                    .eq('id', user.id)
                    .single();

                if (profileData?.phone_number) {
                    phone = profileData.phone_number;
                }

                if (user.email) setValue('email', user.email)
                if (user.user_metadata?.full_name || user.user_metadata?.name) {
                    setValue('name', user.user_metadata?.full_name || user.user_metadata?.name)
                }
                if (phone) setValue('phone', phone)
            }
        }
        loadProfile()
    }, [user, setValue])

    const handleGuestsChange = (change) => {
        setValue('guests', Math.max(1, guestsWatch + change), { shouldValidate: true })
    }

    const handleChildrenChange = (change) => {
        setValue('children', Math.max(0, childrenWatch + change), { shouldValidate: true })
    }

    const onSubmit = async (data) => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tour_id: tourId,
                    user_id: user?.id,
                    total_price: totalPrice,
                    ...data
                })
            })

            const responseData = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Removed auto-close to allow user to see WhatsApp button
            } else {
                setError(responseData.error || (b.errorMessage || 'Failed to submit booking'))
            }
        } catch (err) {
            setError(b.errorMessage || 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        const whatsappMsg = encodeURIComponent(`Hi, I just booked ${tourTitle} and would like to confirm my booking.`)
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`

        return (
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl border-2 border-green-500 text-center animate-fade-in relative">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 leading-tight uppercase tracking-tighter">
                    {b.successTitle || 'Your request has been received'}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                    {b.successMessage || 'Our team will contact you shortly.'}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        {b.successMessageFaster || 'For faster confirmation:'}
                    </p>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-600/20 active:scale-95 w-full justify-center"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118 1.157-.175 1.758-.967 1.758-1.761.017-.791-.412-1.558-.809-1.734zM12 21.463C6.794 21.463 2.536 17.205 2.536 12c0-5.204 4.257-9.463 9.463-9.463 5.204 0 9.463 4.257 9.463 9.463 0 5.204-4.257 9.463-9.463 9.463z" />
                        </svg>
                        {b.whatsappButton || 'Chat Now'}
                    </a>

                    <button
                        onClick={() => {
                            if (onClose) onClose()
                            else router.replace(`/${dict?.lang || 'en'}/tours`)
                        }}
                        className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        {dict?.common?.close || 'Dismiss'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 overflow-hidden relative">

            <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight uppercase tracking-tighter">
                {b.title || 'Book Your Trip'}
            </h2>
            <p className="text-gray-500 mb-8 text-lg font-medium">
                {b.fillDetails || 'Interested in'} <span className="text-primary-600 font-black">"{tourTitle}"</span>
            </p>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 animate-fade-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Guests Counter Section */}
                <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-200/60 space-y-4">
                    {/* Adults Row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">{b.adults || 'Adults'}</label>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{b.perPerson || dict?.common?.perPerson || 'per person'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleGuestsChange(-1)}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm active:scale-90"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                            </button>
                            <span className="text-xl font-black text-gray-900 w-6 text-center">{guestsWatch}</span>
                            <button
                                type="button"
                                onClick={() => handleGuestsChange(1)}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm active:scale-90"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Children Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">{b.children || 'Children'}</label>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{b.childDiscount || '50% off'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleChildrenChange(-1)}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm active:scale-90"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                            </button>
                            <span className="text-xl font-black text-gray-900 w-6 text-center">{childrenWatch}</span>
                            <button
                                type="button"
                                onClick={() => handleChildrenChange(1)}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm active:scale-90"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{b.fullName || 'Full Name'}</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name')}
                            className={`w-full px-5 py-3.5 bg-gray-50 border-2 rounded-[1.25rem] focus:bg-white focus:ring-4 transition-all outline-none font-bold placeholder-gray-300 ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 text-red-900' : 'border-transparent focus:border-primary-600 focus:ring-primary-600/5 text-gray-900'}`}
                            placeholder={b.fullNamePlaceholder || 'e.g. John Doe'}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500 font-bold px-2">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{b.email || 'Email'}</label>
                            <input
                                type="email"
                                id="email"
                                {...register('email')}
                                className={`w-full px-5 py-3.5 bg-gray-50 border-2 rounded-[1.25rem] focus:bg-white focus:ring-4 transition-all outline-none font-bold placeholder-gray-300 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 text-red-900' : 'border-transparent focus:border-primary-600 focus:ring-primary-600/5 text-gray-900'}`}
                                placeholder="name@email.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500 font-bold px-2">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{b.phone || 'Phone'}</label>
                            <input
                                type="tel"
                                id="phone"
                                {...register('phone')}
                                className={`w-full px-5 py-3.5 bg-gray-50 border-2 rounded-[1.25rem] focus:bg-white focus:ring-4 transition-all outline-none font-bold placeholder-gray-300 ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 text-red-900' : 'border-transparent focus:border-primary-600 focus:ring-primary-600/5 text-gray-900'}`}
                                placeholder={b.phonePlaceholder || '+66 00 000 0000'}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500 font-bold px-2">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{b.message || 'Additional Notes (Optional)'}</label>
                        <textarea
                            id="message"
                            {...register('message')}
                            rows={3}
                            className={`w-full px-5 py-3.5 bg-gray-50 border-2 rounded-[1.25rem] focus:bg-white focus:ring-4 transition-all outline-none font-bold placeholder-gray-300 resize-none ${errors.message ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 text-red-900' : 'border-transparent focus:border-primary-600 focus:ring-primary-600/5 text-gray-900'}`}
                            placeholder={b.messagePlaceholder || 'Any special requirements or questions?'}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500 font-bold px-2">{errors.message.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">{b.contactMethod || 'Contact via'}</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setValue('contact_method', 'whatsapp', { shouldValidate: true })}
                            className={`flex-1 group px-4 py-3 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all active:scale-95 ${contactMethodWatch === 'whatsapp'
                                ? 'bg-[#25D366] border-[#25D366] text-white shadow-xl shadow-green-600/20'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118 1.157-.175 1.758-.967 1.758-1.761.017-.791-.412-1.558-.809-1.734zM12 21.463C6.794 21.463 2.536 17.205 2.536 12c0-5.204 4.257-9.463 9.463-9.463 5.204 0 9.463 4.257 9.463 9.463 0 5.204-4.257 9.463-9.463 9.463z" />
                            </svg>
                            <span className="font-black text-[10px] uppercase tracking-wider">WhatsApp</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue('contact_method', 'email', { shouldValidate: true })}
                            className={`flex-1 group px-4 py-3 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all active:scale-95 ${contactMethodWatch === 'email'
                                ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-black text-[10px] uppercase tracking-wider">{b.emailContact || 'Email'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 group border border-gray-100">
                    <div className="text-center md:text-left">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{b.totalAmount || 'Total Investment'}</div>
                        <div className="text-3xl font-black text-gray-900 transition-transform origin-left">{convertPrice(totalPrice, currency)}</div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3.5 bg-primary-600 text-white rounded-xl font-black text-base uppercase tracking-widest hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? (b.processing || 'Processing...') : (b.submit || 'Book Now')}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (onClose) {
                            onClose()
                        } else {
                            router.back()
                        }
                    }}
                    className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.3em] hover:text-gray-900 transition-colors"
                >
                    {dict?.common?.cancel || 'Nevermind, go back'}
                </button>
            </form>
        </div>
    )
}
