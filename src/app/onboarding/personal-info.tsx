"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Mail, Phone, User } from "lucide-react"
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

export default function PersonalInfo() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [birthdate, setBirthdate] = useState<Date>()
  const [ethnicity, setEthnicity] = useState("")

  // Calculate progress: Step 2 of 15 = 13.3%
  const currentStep = 2
  const totalSteps = 15
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNext = () => {
    // TODO: Add validation
    // TODO: Save data to state management or backend

    // Continue to step 3
    router.push("/onboarding?step=3")
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
          Tell us a little more about yourself
        </h1>

        {/* Form Fields */}
        <div className="flex w-full max-w-md flex-col gap-6">
          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Personal Email */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Personal email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Birthdate */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="birthdate">Birthdate</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {birthdate ? format(birthdate, "PPP") : "Select your birthdate"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthdate}
                  onSelect={setBirthdate}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Ethnicity */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Select value={ethnicity} onValueChange={setEthnicity}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select an ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black">Black or African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                  <SelectItem value="native">Native American or Alaska Native</SelectItem>
                  <SelectItem value="pacific">Native Hawaiian or Pacific Islander</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="two-or-more">Two or More Races</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
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

