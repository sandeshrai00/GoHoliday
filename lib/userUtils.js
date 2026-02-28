/**
 * Get a user-friendly display name from a Supabase user object
 * @param {Object} user - Supabase user object
 * @returns {string} Display name (full name or email username)
 */
export function getUserDisplayName(user) {
  if (!user) return 'Anonymous'

  // Prioritize first_name and last_name
  const firstName = user.user_metadata?.first_name
  const lastName = user.user_metadata?.last_name

  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  }

  // Fallback to full_name or email
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
}

/**
 * Get a profile display name from a profiles object
 * @param {Object} profile - Profile object with full_name and email
 * @returns {string} Display name (full name or email username)
 */
export function getProfileDisplayName(profile) {
  if (!profile) return 'Verified User'

  // Prioritize first_name and last_name if available
  const firstName = profile.first_name
  const lastName = profile.last_name

  if (firstName || lastName) {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim()
    if (name) return name
  }

  return profile.full_name || profile.email?.split('@')[0] || 'Verified User'
}
