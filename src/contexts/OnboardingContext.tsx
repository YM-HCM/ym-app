'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Onboarding form data collected across all steps
export interface OnboardingData {
  // Step 1: Personal Info
  phoneNumber?: string
  personalEmail?: string
  ethnicity?: string
  dateOfBirth?: Date
  // Future steps will add more fields here
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  clearData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({})

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }

  const clearData = () => {
    setData({})
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
