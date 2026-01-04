"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { calculateProgress } from "./constants"

export default function Step2() {
  const router = useRouter()
  const progressPercentage = calculateProgress(2)

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-20">
        <h1 className="text-center text-5xl font-semibold tracking-tight">
          Step 2 - Coming Soon
        </h1>
      </div>
      <div className="flex w-full items-center justify-center pb-4">
        <Button onClick={() => router.push("/onboarding?step=3")} className="w-60">
          Next
        </Button>
      </div>
    </div>
  )
}
