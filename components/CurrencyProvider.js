'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

// Fallback exchange rates - used if API fails
const FALLBACK_RATES = {
  USD: 1,
  INR: 83.12,
  THB: 34.50,
  NPR: 133.00,
}

export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  THB: '฿',
  NPR: 'Rs',
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES)

  // Load saved currency from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('GOHOLIDAY_CURRENCY')
      if (saved && CURRENCY_SYMBOLS[saved]) {
        setCurrencyState(saved)
      }
    } catch (e) {
      // localStorage not available
    }
  }, [])

  // Persist currency to localStorage whenever it changes
  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency)
    try {
      localStorage.setItem('GOHOLIDAY_CURRENCY', newCurrency)
    } catch (e) {
      // localStorage not available
    }
  }

  // Fetch real-time exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (response.ok) {
          const data = await response.json()
          setExchangeRates({
            USD: 1,
            INR: data.rates.INR || FALLBACK_RATES.INR,
            THB: data.rates.THB || FALLBACK_RATES.THB,
            NPR: data.rates.NPR || FALLBACK_RATES.NPR,
          })
        }
      } catch (error) {
        console.warn('Failed to fetch exchange rates, using fallback:', error)
        // Keep using fallback rates
      }
    }

    fetchRates()
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000)
    return () => clearInterval(interval)
  }, [])

  const convertPrice = (price, fromCurrency = 'USD') => {
    // Validate currencies exist in exchangeRates
    const validFromCurrency = exchangeRates[fromCurrency] ? fromCurrency : 'USD'
    const validToCurrency = exchangeRates[currency] ? currency : 'USD'

    // Convert from source currency to USD first
    const priceInUSD = price / exchangeRates[validFromCurrency]
    // Then convert from USD to target currency
    const converted = priceInUSD * exchangeRates[validToCurrency]

    return `${CURRENCY_SYMBOLS[validToCurrency] || '$'}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
