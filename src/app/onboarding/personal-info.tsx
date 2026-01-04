"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Globe, Mail, Phone } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { calculateProgress } from "./constants"

// Common ethnicities - can be expanded as needed
const ETHNICITIES = [
  "Afghan",
  "Algerian",
  "Bangladeshi",
  "Egyptian",
  "Emirati",
  "Ethiopian",
  "Indian",
  "Indonesian",
  "Iranian",
  "Iraqi",
  "Jordanian",
  "Kuwaiti",
  "Lebanese",
  "Libyan",
  "Malaysian",
  "Moroccan",
  "Nigerian",
  "Pakistani",
  "Palestinian",
  "Saudi",
  "Somali",
  "Sudanese",
  "Syrian",
  "Tunisian",
  "Turkish",
  "Yemeni",
  "Other",
] as const

export default function PersonalInfo() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  // Initialize from context (supports back navigation)
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber ?? "")
  const [personalEmail, setPersonalEmail] = useState(data.personalEmail ?? "")
  const [ethnicity, setEthnicity] = useState(data.ethnicity ?? "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(data.dateOfBirth)

  const progressPercentage = calculateProgress(1)

  const handleNext = () => {
    // Save to context before navigating
    updateData({ phoneNumber, personalEmail, ethnicity, dateOfBirth })
    router.push("/onboarding?step=2")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Progress Bar */}
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome! Let&apos;s get started
          </h1>
          <p className="mt-3 text-muted-foreground">
            First, tell us a bit about yourself
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex w-full max-w-md flex-col gap-5">
          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Personal Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personalEmail">Personal Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="personalEmail"
                type="email"
                placeholder="you@example.com"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Ethnicity */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={ethnicity} onValueChange={setEthnicity}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select your ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  {ETHNICITIES.map((eth) => (
                    <SelectItem key={eth} value={eth.toLowerCase()}>
                      {eth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP") : "Select your date of birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1940}
                  toYear={new Date().getFullYear() - 10}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex w-full items-center justify-center gap-4 pb-4">
        {/* No previous button for first step */}
        <Button onClick={handleNext} className="w-40">
          Next
        </Button>
      </div>
    </div>
  )
}

