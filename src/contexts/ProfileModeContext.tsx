'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ProfileModeContextValue {
  isEditable: boolean
}

const ProfileModeContext = createContext<ProfileModeContextValue | undefined>(undefined)

export function ProfileModeProvider({
  isEditable,
  children,
}: {
  isEditable: boolean
  children: ReactNode
}) {
  return (
    <ProfileModeContext.Provider value={{ isEditable }}>
      {children}
    </ProfileModeContext.Provider>
  )
}

export function useProfileMode() {
  const context = useContext(ProfileModeContext)
  if (!context) {
    throw new Error('useProfileMode must be used within ProfileModeProvider')
  }
  return context
}
