'use client'

import { Phone, Mail, Globe, Calendar } from 'lucide-react'
import { InlineEditField } from './InlineEditField'
import { useProfileMode } from '@/contexts/ProfileModeContext'
import { format } from 'date-fns'

// Common ethnicities - matching step1-personal-info.tsx
const ETHNICITIES = [
  'Afghan', 'Algerian', 'Bangladeshi', 'Egyptian', 'Emirati', 'Ethiopian',
  'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Jordanian', 'Kuwaiti',
  'Lebanese', 'Libyan', 'Malaysian', 'Moroccan', 'Nigerian', 'Pakistani',
  'Palestinian', 'Saudi', 'Somali', 'Sudanese', 'Syrian', 'Tunisian',
  'Turkish', 'Yemeni', 'Other',
].map(eth => ({ value: eth.toLowerCase(), label: eth }))

// Format phone number as user types: (555) 123-4567
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  const limited = digits.slice(0, 10)

  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
}

// Check if phone has 10 digits
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10
}

// Basic email validation: has @ and domain with TLD
function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

// Read-only field display component
function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground">
        {value || '—'}
      </div>
    </div>
  )
}

interface PersonalInfoSectionProps {
  phoneNumber?: string
  personalEmail?: string
  googleEmail?: string
  ethnicity?: string
  dateOfBirth?: Date
  onPhoneChange: (value: string) => void
  onPersonalEmailChange: (value: string) => void
  onEthnicityChange: (value: string) => void
  onDateOfBirthChange: (value: Date | undefined) => void
}

export function PersonalInfoSection({
  phoneNumber = '',
  personalEmail = '',
  googleEmail,
  ethnicity = '',
  dateOfBirth,
  onPhoneChange,
  onPersonalEmailChange,
  onEthnicityChange,
  onDateOfBirthChange,
}: PersonalInfoSectionProps) {
  const { isEditable } = useProfileMode()

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Personal Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditable ? 'Your contact details and personal info' : 'Contact details and personal info'}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {isEditable ? (
          <>
            <InlineEditField
              type="tel"
              label="Phone Number"
              value={phoneNumber}
              onChange={onPhoneChange}
              icon={<Phone className="h-4 w-4" />}
              placeholder="(555) 123-4567"
              formatter={formatPhoneNumber}
              validator={isValidPhone}
              errorMessage="Please enter a valid 10-digit phone number"
            />

            <InlineEditField
              type="email"
              label="Personal Email"
              value={personalEmail}
              onChange={onPersonalEmailChange}
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@example.com"
              validator={isValidEmail}
              errorMessage="Please enter a valid email address"
            />

            {googleEmail && (
              <InlineEditField
                type="email"
                label="YM Email"
                value={googleEmail}
                onChange={() => {}}
                icon={<Mail className="h-4 w-4" />}
                disabled
              />
            )}

            <InlineEditField
              type="select"
              label="Ethnicity"
              value={ethnicity}
              onChange={onEthnicityChange}
              icon={<Globe className="h-4 w-4" />}
              options={ETHNICITIES}
              placeholder="Select ethnicity"
            />

            <InlineEditField
              type="date"
              label="Date of Birth"
              value={dateOfBirth}
              onChange={onDateOfBirthChange}
              icon={<Calendar className="h-4 w-4" />}
              placeholder="Select date"
            />
          </>
        ) : (
          <>
            <ReadOnlyField
              label="Phone Number"
              value={phoneNumber}
              icon={<Phone className="h-4 w-4" />}
            />

            <ReadOnlyField
              label="Personal Email"
              value={personalEmail}
              icon={<Mail className="h-4 w-4" />}
            />

            {googleEmail && (
              <ReadOnlyField
                label="YM Email"
                value={googleEmail}
                icon={<Mail className="h-4 w-4" />}
              />
            )}

            <ReadOnlyField
              label="Ethnicity"
              value={ETHNICITIES.find(e => e.value === ethnicity)?.label || ethnicity}
              icon={<Globe className="h-4 w-4" />}
            />

            <ReadOnlyField
              label="Date of Birth"
              value={dateOfBirth ? format(dateOfBirth, 'MMMM d, yyyy') : ''}
              icon={<Calendar className="h-4 w-4" />}
            />
          </>
        )}
      </div>
    </section>
  )
}
