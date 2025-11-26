"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Welcome from "./welcome"
import PersonalInfo from "./personal-info"
import Step3 from "./step3"
import Step4 from "./step4"
import Step5 from "./step5"
import Step6 from "./step6"
import Step7 from "./step7"

function OnboardingContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const step = searchParams.get("step")
    if (step) {
      setCurrentStep(parseInt(step, 10))
    }
  }, [searchParams])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Welcome />
      case 2:
        return <PersonalInfo />
      case 3:
        return <Step3 />
      case 4:
        return <Step4 />
      case 5:
        return <Step5 />
      case 6:
        return <Step6 />
      case 7:
        return <Step7 />
      default:
        return <Welcome />
    }
  }

  return <>{renderStep()}</>
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

