'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { YMLoginForm } from '@/components/auth/YMLoginForm'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Redirect if already logged in
  // TODO: Make this dynamic - check if user has completed onboarding
  // If onboarding_completed: redirect to /home
  // If not completed: redirect to /onboarding?step=1
  useEffect(() => {
    if (user && !loading) {
      router.push('/onboarding?step=1')
    }
  }, [user, loading, router])

  const handleGoogleSuccess = () => {
    // TODO: Make this dynamic based on onboarding completion status
    router.push('/onboarding?step=1')
  }

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <YMLoginForm
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          error={error}
        />


      </div>
    </div>
  )
}