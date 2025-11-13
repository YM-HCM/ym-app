"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function Step1() {
  const router = useRouter()

  // Calculate progress: Step 1 of 15 = 6.7%
  const currentStep = 1
  const totalSteps = 15
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNext = () => {
    router.push("/onboarding?step=2")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Progress Bar */}
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-20">
        {/* Heading */}
        <h1 className="text-center text-5xl font-semibold tracking-tight">
          Welcome to YM App
        </h1>

        <p className="text-center text-xl text-muted-foreground">
          Let&apos;s get started with your onboarding journey
        </p>
      </div>

      {/* Next Button */}
      <div className="flex w-full items-center justify-center pb-4">
        <Button onClick={handleNext} className="w-60">
          Next
        </Button>
      </div>
    </div>
  )
}

