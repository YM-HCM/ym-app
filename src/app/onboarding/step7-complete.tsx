"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { useAuth } from "@/contexts/AuthContext"
import { saveOnboardingData } from "@/lib/supabase/onboarding"
import { calculateProgress } from "./constants"

export default function Step7() {
  const router = useRouter()
  const { data, clearData } = useOnboarding()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progressPercentage = calculateProgress(7)

  const handleComplete = async () => {
    if (!user?.id) {
      setError("You must be logged in to complete onboarding")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await saveOnboardingData(user.id, data)

      if (!result.success) {
        setError(result.error || "Failed to save your profile. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Clear context data after saving
      clearData()

      // Navigate to home/dashboard
      router.push("/home")
    } catch (err) {
      console.error("Error completing onboarding:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Progress Bar */}
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        {/* Success Icon */}
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            You&apos;re all set!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Thanks for completing your profile. We&apos;re excited to have you here.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 w-full max-w-md mx-auto rounded-md bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation Button */}
      <div className="flex w-full items-center justify-center pb-4">
        <Button
          onClick={handleComplete}
          className="w-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </div>
    </div>
  )
}
