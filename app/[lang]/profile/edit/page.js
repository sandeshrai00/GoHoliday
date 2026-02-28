'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileSidebar from '@/components/ProfileSidebar'

// Country codes for mobile numbers
const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada', flag: 'US' },
  { code: '+44', country: 'UK', flag: 'GB' },
  { code: '+61', country: 'Australia', flag: 'AU' },
  { code: '+81', country: 'Japan', flag: 'JP' },
  { code: '+86', country: 'China', flag: 'CN' },
  { code: '+91', country: 'India', flag: 'IN' },
  { code: '+66', country: 'Thailand', flag: 'TH' },
  { code: '+977', country: 'Nepal', flag: 'NP' },
  { code: '+65', country: 'Singapore', flag: 'SG' },
  { code: '+82', country: 'South Korea', flag: 'KR' },
  { code: '+33', country: 'France', flag: 'FR' },
  { code: '+49', country: 'Germany', flag: 'DE' },
  { code: '+39', country: 'Italy', flag: 'IT' },
  { code: '+34', country: 'Spain', flag: 'ES' },
  { code: '+31', country: 'Netherlands', flag: 'NL' },
  { code: '+46', country: 'Sweden', flag: 'SE' },
  { code: '+47', country: 'Norway', flag: 'NO' },
  { code: '+45', country: 'Denmark', flag: 'DK' },
  { code: '+41', country: 'Switzerland', flag: 'CH' },
  { code: '+43', country: 'Austria', flag: 'AT' },
  { code: '+32', country: 'Belgium', flag: 'BE' },
  { code: '+351', country: 'Portugal', flag: 'PT' },
  { code: '+353', country: 'Ireland', flag: 'IE' },
  { code: '+358', country: 'Finland', flag: 'FI' },
  { code: '+48', country: 'Poland', flag: 'PL' },
  { code: '+420', country: 'Czech Republic', flag: 'CZ' },
  { code: '+36', country: 'Hungary', flag: 'HU' },
  { code: '+40', country: 'Romania', flag: 'RO' },
  { code: '+30', country: 'Greece', flag: 'GR' },
  { code: '+90', country: 'Turkey', flag: 'TR' },
  { code: '+7', country: 'Russia', flag: 'RU' },
  { code: '+52', country: 'Mexico', flag: 'MX' },
  { code: '+55', country: 'Brazil', flag: 'BR' },
  { code: '+54', country: 'Argentina', flag: 'AR' },
  { code: '+56', country: 'Chile', flag: 'CL' },
  { code: '+57', country: 'Colombia', flag: 'CO' },
  { code: '+51', country: 'Peru', flag: 'PE' },
  { code: '+58', country: 'Venezuela', flag: 'VE' },
  { code: '+27', country: 'South Africa', flag: 'ZA' },
  { code: '+234', country: 'Nigeria', flag: 'NG' },
  { code: '+254', country: 'Kenya', flag: 'KE' },
  { code: '+20', country: 'Egypt', flag: 'EG' },
  { code: '+971', country: 'UAE', flag: 'AE' },
  { code: '+966', country: 'Saudi Arabia', flag: 'SA' },
  { code: '+972', country: 'Israel', flag: 'IL' },
  { code: '+64', country: 'New Zealand', flag: 'NZ' },
  { code: '+63', country: 'Philippines', flag: 'PH' },
  { code: '+60', country: 'Malaysia', flag: 'MY' },
  { code: '+84', country: 'Vietnam', flag: 'VN' },
  { code: '+62', country: 'Indonesia', flag: 'ID' },
  { code: '+92', country: 'Pakistan', flag: 'PK' },
  { code: '+880', country: 'Bangladesh', flag: 'BD' },
]

export default function ProfileEditPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dict, setDict] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    country_code: '+1',
    gender: '',
    date_of_birth: ''
  })

  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false)
  const [countryCodeSearch, setCountryCodeSearch] = useState('')
  const dropdownRef = useRef(null)

  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'en'

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryCodeDropdown(false)
        setCountryCodeSearch('')
      }
    }

    if (showCountryCodeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountryCodeDropdown])

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not initialized')
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push(`/${lang}/login`)
          return
        }

        setUser(session.user)

        // Fetch profile data from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          // Parse phone number to extract country code and number
          let extractedCountryCode = '+1'
          let extractedPhoneNumber = profileData?.phone_number || ''

          if (extractedPhoneNumber) {
            // Try to match a country code at the beginning
            const matchedCode = COUNTRY_CODES.find(c => extractedPhoneNumber.startsWith(c.code))
            if (matchedCode) {
              extractedCountryCode = matchedCode.code
              extractedPhoneNumber = extractedPhoneNumber.substring(matchedCode.code.length).trim()
            }
          }

          setFormData({
            first_name: profileData?.first_name || '',
            last_name: profileData?.last_name || '',
            phone_number: extractedPhoneNumber,
            country_code: extractedCountryCode,
            gender: profileData?.gender || '',
            date_of_birth: profileData?.date_of_birth || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push(`/${lang}/login`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          router.push(`/${lang}/login`)
        } else {
          setUser(session.user)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [lang, router])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    if (!formData.first_name.trim()) {
      setMessage({
        type: 'error',
        text: dict?.profileSettings?.firstNameRequired || 'Please enter your first name'
      })
      return
    }

    if (!formData.last_name.trim()) {
      setMessage({
        type: 'error',
        text: dict?.profileSettings?.lastNameRequired || 'Please enter your last name'
      })
      return
    }

    if (!currentPassword || !currentPassword.trim()) {
      setMessage({
        type: 'error',
        text: dict?.profileSettings?.passwordRequired || 'Please enter your current password for verification'
      })
      return
    }

    setIsSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Verify the current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        setMessage({
          type: 'error',
          text: dict?.profileSettings?.incorrectPassword || dict?.profile?.incorrectPassword || 'Incorrect password. Please try again.'
        })
        setIsSaving(false)
        return
      }

      // Combine country code and phone number with space delimiter
      // Format: "+[code] [number]" (e.g., "+1 5551234567")
      // Note: The extraction logic in loadProfile relies on this exact format
      const fullPhoneNumber = formData.phone_number
        ? `${formData.country_code} ${formData.phone_number}`.trim()
        : ''

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone_number: fullPhoneNumber,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({
        type: 'success',
        text: dict?.profileSettings?.updateSuccess || 'Your profile has been updated successfully!'
      })

      // Clear password field
      setCurrentPassword('')

      // Optionally redirect back to profile page after a delay
      setTimeout(() => {
        router.push(`/${lang}/profile`)
      }, 1500)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: dict?.profileSettings?.updateError || 'Failed to update profile. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/${lang}/profile`)
  }

  const filteredCountryCodes = COUNTRY_CODES.filter(item =>
    item.country.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
    item.code.includes(countryCodeSearch)
  )

  if (loading) {
    return (
      <>
        <Header lang={lang} dict={dict} />
        <div className="min-h-screen flex items-center justify-center bg-white pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">{dict?.common?.loading || 'Loading...'}</p>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header lang={lang} dict={dict} />
        <div className="min-h-screen flex items-center justify-center bg-white pt-24">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to edit your profile.</p>
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </>
    )
  }

  return (
    <>
      <Header lang={lang} dict={dict} />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <ProfileSidebar lang={lang} dict={dict} />

            {/* Main Content */}
            <div className="flex-1">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {dict?.profileSettings?.title || 'Profile Settings'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {dict?.profileSettings?.subtitle || 'Manage your personal information'}
                </p>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleSaveProfile}>
                <div className="bg-white border border-gray-200 rounded-lg mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  </div>

                  <div className="px-6 py-6">
                    <div className="space-y-4">
                      {/* First Name */}
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.profileSettings?.firstName || 'First Name'} *
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          placeholder={dict?.profileSettings?.firstNamePlaceholder || 'Enter your first name'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                          disabled={isSaving}
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.profileSettings?.lastName || 'Last Name'} *
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          placeholder={dict?.profileSettings?.lastNamePlaceholder || 'Enter your last name'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                          disabled={isSaving}
                          required
                        />
                      </div>

                      {/* Mobile Number with Country Code */}
                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.profileSettings?.mobileNumber || 'Mobile Number'}
                        </label>
                        <div className="flex gap-2">
                          {/* Country Code Dropdown */}
                          <div className="relative w-32" ref={dropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                              disabled={isSaving}
                              aria-expanded={showCountryCodeDropdown}
                              aria-haspopup="listbox"
                              aria-label="Select country code"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent bg-white text-left disabled:opacity-50"
                            >
                              {formData.country_code}
                            </button>

                            {showCountryCodeDropdown && (
                              <div
                                role="listbox"
                                aria-label="Country codes"
                                className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
                              >
                                <div className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={countryCodeSearch}
                                    onChange={(e) => setCountryCodeSearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent text-sm"
                                  />
                                </div>
                                <div className="max-h-60 overflow-auto" role="list">
                                  {filteredCountryCodes.map((item) => (
                                    <button
                                      key={item.code}
                                      type="button"
                                      role="option"
                                      aria-selected={formData.country_code === item.code}
                                      onClick={() => {
                                        handleInputChange('country_code', item.code)
                                        setShowCountryCodeDropdown(false)
                                        setCountryCodeSearch('')
                                      }}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2"
                                    >
                                      <span className="inline-flex items-center justify-center w-7 h-5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-500 leading-none">{item.flag}</span>
                                      <span className="font-medium">{item.code}</span>
                                      <span className="text-gray-600">{item.country}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Phone Number Input */}
                          <input
                            type="tel"
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            placeholder={dict?.profileSettings?.mobileNumberPlaceholder || 'Enter your mobile number'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {dict?.profileSettings?.gender || 'Gender'}
                        </label>
                        <div className="flex gap-4">
                          {[
                            { value: 'male', label: dict?.profileSettings?.male || 'Male' },
                            { value: 'female', label: dict?.profileSettings?.female || 'Female' },
                            { value: 'other', label: dict?.profileSettings?.other || 'Other' }
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={`flex-1 relative cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              aria-disabled={isSaving}
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={option.value}
                                checked={formData.gender === option.value}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                disabled={isSaving}
                                className="sr-only"
                              />
                              <div className={`
                                flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
                                ${formData.gender === option.value
                                  ? 'border-primary-700 bg-primary-50'
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                                }
                              `}>
                                <div className={`
                                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                  ${formData.gender === option.value
                                    ? 'border-primary-700 bg-primary-700'
                                    : 'border-gray-300 bg-white'
                                  }
                                `}>
                                  {formData.gender === option.value && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${formData.gender === option.value ? 'text-primary-700' : 'text-gray-700'}`}>
                                  {option.label}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.profileSettings?.dateOfBirth || 'Date of Birth'}
                        </label>
                        <input
                          type="date"
                          id="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          placeholder={dict?.profileSettings?.dateOfBirthPlaceholder || 'Select your date of birth'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                          disabled={isSaving}
                        />
                      </div>

                      {/* Current Password - Required for Security */}
                      <div className="pt-4 border-t border-gray-200">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.profileSettings?.currentPassword || 'Current Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder={dict?.profileSettings?.currentPasswordPlaceholder || 'Enter your current password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent pr-10"
                            disabled={isSaving}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {dict?.profileSettings?.passwordHelp || 'Required for security verification'}
                        </p>
                      </div>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                      <div className={`mt-4 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                        }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-2 bg-primary-700 text-white rounded-full font-medium hover:bg-primary-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-auto"
                      >
                        {isSaving ? (dict?.profileSettings?.saving || 'Saving...') : (dict?.profileSettings?.save || 'Save Changes')}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-8 py-2 bg-white text-gray-700 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-auto"
                      >
                        {dict?.profileSettings?.cancel || dict?.common?.cancel || 'Cancel'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </>
  )
}
