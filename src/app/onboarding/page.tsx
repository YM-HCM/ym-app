"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingProvider } from "@/contexts/OnboardingContext"
import { OnboardingReferenceProvider } from "@/contexts/OnboardingReferenceContext"
import { PageLoader } from "@/components/ui/page-loader"
import { ONBOARDING_TOTAL_STEPS } from "./constants"
import Step1PersonalInfo from "./step1-personal-info"
import Step2Location from "./step2-location"
import Step3YmRoles from "./step3-ym-roles"
import Step4YmProjects from "./step4-ym-projects"
import Step5Education from "./step5-education"
import Step6Skills from "./step6-skills"
import Step7Complete from "./step7-complete"

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1PersonalInfo,
  2: Step2Location,
  3: Step3YmRoles,
  4: Step4YmProjects,
  5: Step5Education,
  6: Step6Skills,
  7: Step7Complete,
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const step = searchParams.get("step")
    if (step) {
      const parsed = parseInt(step, 10)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= ONBOARDING_TOTAL_STEPS) {
        setCurrentStep(parsed)
      }
    }
  }, [searchParams])

  const StepComponent = STEP_COMPONENTS[currentStep] ?? Step1PersonalInfo

  return <StepComponent />
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <title>Onboarding | Young Muslims App</title>
      <OnboardingReferenceProvider>
        <Suspense fallback={<PageLoader />}>
          <OnboardingContent />
        </Suspense>
      </OnboardingReferenceProvider>
    </OnboardingProvider>
  )
}

