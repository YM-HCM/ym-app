"use client"

import { ReactNode } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { calculateProgress } from "../constants"

interface OnboardingLayoutProps {
  /** Current step number (1-7) */
  step: number
  /** Main content of the step */
  children: ReactNode
  /** Error message to display above navigation */
  error?: string | null
  /** Whether the form can proceed (enables Next button) */
  isValid?: boolean
  /** Whether data is currently being saved */
  isSaving?: boolean
  /** Whether context data is still loading */
  isLoading?: boolean
  /** Handler for the Next/Complete button */
  onNext?: () => void
  /** Handler for the Back button */
  onBack?: () => void
  /** Text for the next button (defaults to "Next") */
  nextButtonText?: string
  /** Whether to show the back button (defaults to true for steps > 1) */
  showBack?: boolean
}

/**
 * Common layout wrapper for onboarding steps.
 * Provides consistent structure: progress bar, content area, error display, and navigation.
 */
export function OnboardingLayout({
  step,
  children,
  error,
  isValid = true,
  isSaving = false,
  isLoading = false,
  onNext,
  onBack,
  nextButtonText = "Next",
  showBack = step > 1,
}: OnboardingLayoutProps) {
  const progressPercentage = calculateProgress(step)

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Progress Bar */}
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main Content */}
      {children}

      {/* Error Message */}
      {error && (
        <div className="mb-4 w-full max-w-md mx-auto rounded-md bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex w-full items-center justify-center gap-4 pb-4">
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack} disabled={isSaving} className="w-40">
            Back
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} disabled={!isValid || isSaving || isLoading} className="w-40">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              nextButtonText
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

interface OnboardingContentProps {
  /** Page title */
  title: string
  /** Page subtitle/description */
  subtitle?: string
  /** Content below the heading */
  children: ReactNode
  /** Whether content should be centered vertically (default: false for multi-card steps) */
  centered?: boolean
  /** Max width class for content (defaults to max-w-md) */
  maxWidth?: string
}

/**
 * Content wrapper for onboarding steps with consistent heading styling.
 */
export function OnboardingContent({
  title,
  subtitle,
  children,
  centered = true,
  maxWidth = "max-w-md",
}: OnboardingContentProps) {
  return (
    <div className={`flex flex-1 flex-col items-center ${centered ? "justify-center gap-12" : "py-12"}`}>
      {/* Heading */}
      <div className={`text-center ${centered ? "" : "mb-8"}`}>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Form Fields / Content */}
      <div className={`flex w-full ${maxWidth} flex-col gap-5`}>
        {children}
      </div>
    </div>
  )
}

interface OnboardingLoadingStateProps {
  /** Loading message */
  message?: string
}

/**
 * Loading state for onboarding steps that fetch data.
 */
export function OnboardingLoadingState({ message = "Loading..." }: OnboardingLoadingStateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

interface OnboardingErrorStateProps {
  /** Error message */
  message: string
  /** Handler for retry button */
  onRetry?: () => void
}

/**
 * Error state for onboarding steps when data fetching fails.
 */
export function OnboardingErrorState({ message, onRetry }: OnboardingErrorStateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center max-w-md">
        <p className="text-sm text-destructive">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
