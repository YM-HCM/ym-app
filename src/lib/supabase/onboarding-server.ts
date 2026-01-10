import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side function to check if a user has completed onboarding
 * Used by server components and API routes
 */
export async function checkOnboardingCompleteServer(authId: string): Promise<{
  isComplete: boolean
  userId: string | null
}> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors when setting cookies in server components
          }
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('users')
    .select('id, onboarding_completed_at')
    .eq('auth_id', authId)
    .single()

  if (error || !data) {
    // User doesn't exist in our users table - they need to complete onboarding
    return { isComplete: false, userId: null }
  }

  return {
    isComplete: data.onboarding_completed_at !== null,
    userId: data.id
  }
}

/**
 * Gets the required onboarding step based on what's missing
 * Returns 1 by default (start from beginning)
 */
export async function getRequiredOnboardingStep(authId: string): Promise<number> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors when setting cookies in server components
          }
        },
      },
    }
  )

  // Get user profile with all onboarding fields
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      phone,
      personal_email,
      ethnicity,
      date_of_birth,
      education_level,
      education,
      skills,
      onboarding_completed_at
    `)
    .eq('auth_id', authId)
    .single()

  // If user doesn't exist or error, start from step 1
  if (error || !user) {
    return 1
  }

  // If onboarding is complete, return 0 (no step needed)
  if (user.onboarding_completed_at) {
    return 0
  }

  // Check which step is incomplete and return that step
  // Step 1: Personal Info - phone, personal_email, ethnicity, date_of_birth
  // These are all optional, so we don't require them

  // Step 2: Location - check for active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    // Check if they have any personal info filled (means they passed step 1)
    const hasAnyPersonalInfo = user.phone || user.personal_email || user.ethnicity || user.date_of_birth
    if (!hasAnyPersonalInfo) {
      return 1 // Start from step 1
    }
    return 2 // Need to complete location
  }

  // Steps 3 & 4: YM Roles and Projects are optional

  // Step 5: Education level is required
  if (!user.education_level) {
    return 5
  }

  // Step 6: Skills - need at least 3
  const skills = user.skills as string[] | null
  if (!skills || skills.length < 3) {
    return 6
  }

  // All required fields are complete, they just need to finish step 7
  return 7
}
