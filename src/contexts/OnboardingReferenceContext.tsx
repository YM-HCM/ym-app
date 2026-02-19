'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchSubregions, fetchAllNeighborNets, type Subregion, type NeighborNet } from '@/lib/supabase/queries/location'
import { fetchRoleTypes, type RoleType } from '@/lib/supabase/queries/roles'
import { fetchCompletedUsers, type UserOption } from '@/lib/supabase/queries/users'

interface OnboardingReferenceData {
  subregions: Subregion[]
  neighborNets: NeighborNet[]
  roleTypes: RoleType[]
  users: UserOption[]
  isLoading: boolean
  error: string | null
}

const OnboardingReferenceContext = createContext<OnboardingReferenceData | undefined>(undefined)

export function OnboardingReferenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingReferenceData>({
    subregions: [],
    neighborNets: [],
    roleTypes: [],
    users: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const loadAll = async () => {
      const [subregionsResult, neighborNetsResult, roleTypesResult, usersResult] = await Promise.all([
        fetchSubregions(),
        fetchAllNeighborNets(),
        fetchRoleTypes(),
        fetchCompletedUsers(),
      ])

      // Check for critical errors (subregions and roleTypes are required)
      const criticalError = subregionsResult.error ?? neighborNetsResult.error ?? roleTypesResult.error
      if (criticalError) {
        setState(prev => ({ ...prev, error: criticalError, isLoading: false }))
        return
      }

      setState({
        subregions: subregionsResult.data || [],
        neighborNets: neighborNetsResult.data || [],
        roleTypes: roleTypesResult.data || [],
        // Users can be empty (no one completed onboarding yet) — that's OK
        users: usersResult.data || [],
        isLoading: false,
        error: null,
      })
    }

    loadAll()
  }, [])

  return (
    <OnboardingReferenceContext.Provider value={state}>
      {children}
    </OnboardingReferenceContext.Provider>
  )
}

export function useOnboardingReference() {
  const context = useContext(OnboardingReferenceContext)
  if (context === undefined) {
    throw new Error('useOnboardingReference must be used within an OnboardingReferenceProvider')
  }
  return context
}
