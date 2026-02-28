'use client'

import { useState } from 'react'
import { useCurrency, CURRENCY_SYMBOLS } from './CurrencyProvider'

// Currency country codes for visual identification
const CURRENCY_FLAGS = {
  USD: 'US',
  INR: 'IN',
  THB: 'TH',
  NPR: 'NP',
}

export default function CurrencySwitcher({ mobile = false }) {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'THB', name: 'Thai Baht' },
    { code: 'NPR', name: 'Nepali Rupee' },
  ]

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) {
      setIsOpen(false)
      return
    }
    setCurrency(newCurrency)
    setIsOpen(false)
  }

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]

  // Mobile view with text
  if (mobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-primary-200"
          aria-label={`Select currency - Current: ${currentCurrency.code}`}
          aria-expanded={isOpen}
        >
          <span className="inline-flex items-center justify-center w-7 h-5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-600 leading-none">{CURRENCY_FLAGS[currency]}</span>
          <span className="flex-1 text-left font-medium">
            <span className="text-base">{CURRENCY_SYMBOLS[currency]}</span> {currentCurrency.code}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Inline accordion options */}
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
            {currencies.map((curr) => {
              const isActive = curr.code === currency

              return (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${isActive ? 'bg-primary-50 text-primary-600 font-medium' : ''
                    }`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-600 leading-none">{CURRENCY_FLAGS[curr.code]}</span>
                  <span className="text-lg">{CURRENCY_SYMBOLS[curr.code]}</span>
                  <span className="flex-1 text-left">{curr.code}</span>
                  {isActive && (
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="relative">
      {/* Desktop Button - shows flag + symbol */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-1.5 px-1.5 py-2 rounded-2xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-primary-200"
        aria-label={`Select currency - Current: ${currency}`}
        aria-expanded={isOpen}
      >
        <span className="inline-flex items-center justify-center w-7 h-5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-600 leading-none">{CURRENCY_FLAGS[currency]}</span>
        <span className="font-semibold text-sm">{CURRENCY_SYMBOLS[currency]}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-lg bg-white border border-primary-200 z-50 animate-slide-down">
            <div className="py-1">
              {currencies.map((curr) => {
                const isActive = curr.code === currency

                return (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${isActive ? 'bg-primary-50 text-primary-600 font-medium' : ''
                      }`}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-600 leading-none">{CURRENCY_FLAGS[curr.code]}</span>
                    <span className="text-base font-medium w-5">{CURRENCY_SYMBOLS[curr.code]}</span>
                    <span className="flex-1 text-left">{curr.code}</span>
                    {isActive && (
                      <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
