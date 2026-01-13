'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchUserProfileById } from '@/lib/supabase/queries/profile'
import type { ProfileFormState } from './useProfileForm'

interface UsePersonProfileReturn {
  personData: ProfileFormState | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch any user's profile by their user ID
 * @param userId - The user ID to fetch profile for
 */
export function usePersonProfile(userId: string): UsePersonProfileReturn {
  const [personData, setPersonData] = useState<ProfileFormState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchUserProfileById(userId)

    if (fetchError) {
      setError(fetchError)
      setPersonData(null)
    } else {
      setPersonData(data)
    }

    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    personData,
    isLoading,
    error,
    refetch: fetchProfile,
  }
}
