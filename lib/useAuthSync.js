'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Broadcast an auth event over Supabase Realtime to all connected 
 * clients listening to this user's channel.
 * 
 * @param {string} type - Event type (e.g., 'email_updated')
 * @param {string} userId - The ID of the user the event belongs to
 * @param {Object} data - Additional data payload
 */
// Keep track of recent broadcasts to prevent loops/spam
const lastBroadcasts = new Map()

export async function broadcastAuthEvent(type, userId, data = {}) {
    if (typeof window === 'undefined' || !supabase || !userId) return

    // Prevent rapid duplicate broadcasts for the same event type (2 second cooldown)
    const broadcastKey = `${userId}:${type}`
    const now = Date.now()
    if (lastBroadcasts.has(broadcastKey) && now - lastBroadcasts.get(broadcastKey) < 2000) {
        console.log('[Broadcast] Skipping rapid duplicate:', type)
        return
    }
    lastBroadcasts.set(broadcastKey, now)

    try {
        const channelName = `auth-sync-${userId}`
        const channel = supabase.channel(channelName)

        // Subscribe and broadcast the event
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: type,
                    payload: { data, timestamp: Date.now() }
                })

                // Clean up the channel after a short delay
                setTimeout(() => {
                    supabase.removeChannel(channel)
                }, 1000)
            }
        })
    } catch (e) {
        console.error('Failed to broadcast auth event via Realtime:', e)
    }
}

/**
 * Custom hook for cross-browser, cross-tab auth synchronization
 * using Supabase Realtime WebSockets.
 * 
 * @param {Object} options
 * @param {string} options.userId - The ID of the current user (required to scope the channel)
 * @param {function} options.onAuthEvent - Callback when an auth event is received
 */
export function useAuthSync({ userId, onAuthEvent } = {}) {
    const onAuthEventRef = useRef(onAuthEvent)

    // Keep ref up to date
    useEffect(() => {
        onAuthEventRef.current = onAuthEvent
    }, [onAuthEvent])

    // Set up Supabase Realtime subscription
    useEffect(() => {
        if (typeof window === 'undefined' || !supabase || !userId) return

        const channelName = `auth-sync-${userId}`
        const channel = supabase.channel(channelName)

        // Listen for broadcast events
        channel
            .on('broadcast', { event: 'email_updated' }, (payload) => {
                if (onAuthEventRef.current) {
                    onAuthEventRef.current({ type: 'email_updated', data: payload.payload?.data })
                }
            })
            .on('broadcast', { event: 'email_verified' }, (payload) => {
                if (onAuthEventRef.current) {
                    onAuthEventRef.current({ type: 'email_verified', data: payload.payload?.data })
                }
            })
            .subscribe((status, err) => {
                if (err) console.error('Error subscribing to auth-sync channel:', err)
            })

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    // Focus listener to refresh session when returning to tab
    useEffect(() => {
        // Only meaningful once we have a logged-in userId.
        // Avoid extra auth calls during recovery/magic-link flows.
        if (typeof window === 'undefined' || !supabase || !userId) return

        let lastEmail = null

        // Grab initial email to detect changes upon return
        supabase.auth.getUser().then(({ data }) => {
            lastEmail = data?.user?.email
        })

        const handleFocus = async () => {
            try {
                // Force a session refresh
                const { data: { user }, error } = await supabase.auth.refreshSession()

                // If the email has changed while we were away, notify the app
                if (!error && user && lastEmail && user.email !== lastEmail) {
                    if (onAuthEventRef.current) {
                        onAuthEventRef.current({
                            type: 'email_updated',
                            data: { newEmail: user.email, oldEmail: lastEmail }
                        })
                    }
                    lastEmail = user.email
                }
            } catch (err) {
                console.error("Failed to refresh session on focus:", err)
            }
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [userId])

    // Maintain backward compatibility with returned object, but polling functions are no-ops
    const startPolling = useCallback(() => { }, [])
    const stopPolling = useCallback(() => { }, [])

    return { startPolling, stopPolling }
}
