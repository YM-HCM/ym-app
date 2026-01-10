import { createClient } from './client'
import type { OnboardingData, YMRoleEntry, YMProjectEntry, EducationEntry } from '@/contexts/OnboardingContext'

/**
 * User profile data stored in the users table
 */
interface UserProfileData {
  phone?: string
  personal_email?: string
  ethnicity?: string
  date_of_birth?: string // ISO date string
  education_level?: string
  education?: EducationEntry[]
  skills?: string[]
  onboarding_completed_at?: string
}

/**
 * Membership data for geographic location
 */
interface MembershipData {
  user_id: string
  neighbor_net_id?: string
  status: 'active'
  joined_at: string
}

/**
 * Role assignment data
 */
interface RoleAssignmentData {
  user_id: string
  role_type_id?: string
  role_type_custom?: string
  amir_user_id?: string
  amir_custom_name?: string
  start_date?: string
  end_date?: string
  is_active: boolean
}

/**
 * User project data
 */
interface UserProjectData {
  user_id: string
  project_type?: string
  project_type_custom?: string
  role?: string
  amir_user_id?: string
  amir_custom_name?: string
  start_month?: number
  start_year?: number
  end_month?: number
  end_year?: number
  is_current: boolean
  description?: string
}

/**
 * Fetches the current user's profile from the users table
 */
export async function getUserProfile(authId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Checks if a user has completed onboarding
 * Returns true if onboarding_completed_at is set
 */
export async function checkOnboardingComplete(authId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('onboarding_completed_at')
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }

  return data?.onboarding_completed_at !== null
}

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date | undefined): string | undefined {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

/**
 * Converts month/year to ISO date string (first day of month)
 */
function monthYearToDate(month?: number, year?: number): string | undefined {
  if (!month || !year) return undefined
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/**
 * Saves all onboarding data to Supabase
 * This function handles:
 * 1. Updating the user profile (personal info, education, skills)
 * 2. Creating/updating membership (location)
 * 3. Creating role assignments (YM roles)
 * 4. Creating user projects (YM projects)
 */
export async function saveOnboardingData(
  authId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // First, get the user's internal ID from auth_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single()

    if (userError || !userData) {
      console.error('Error finding user:', userError)
      return { success: false, error: 'User not found' }
    }

    const userId = userData.id

    // 1. Update user profile with personal info, education, and skills
    const profileData: UserProfileData = {
      phone: data.phoneNumber,
      personal_email: data.personalEmail,
      ethnicity: data.ethnicity,
      date_of_birth: formatDateToISO(data.dateOfBirth),
      education_level: data.educationLevel,
      education: data.education?.map(edu => ({
        id: edu.id,
        schoolName: edu.schoolName || edu.schoolCustom,
        degreeType: edu.degreeType,
        fieldOfStudy: edu.fieldOfStudy,
        graduationYear: edu.graduationYear
      })) || [],
      skills: data.skills || [],
      onboarding_completed_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    // 2. Create membership for geographic location (if neighborNetId is provided)
    if (data.neighborNetId) {
      // First, deactivate any existing active memberships
      await supabase
        .from('memberships')
        .update({ status: 'inactive' })
        .eq('user_id', userId)
        .eq('status', 'active')

      // Create new membership
      const membershipData: MembershipData = {
        user_id: userId,
        neighbor_net_id: data.neighborNetId,
        status: 'active',
        joined_at: new Date().toISOString().split('T')[0]
      }

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert(membershipData)

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        // Don't fail completely, just log the error
      }
    }

    // 3. Create role assignments (YM Roles)
    if (data.ymRoles && data.ymRoles.length > 0) {
      // Delete existing role assignments for this user (to replace with new ones)
      await supabase
        .from('role_assignments')
        .delete()
        .eq('user_id', userId)

      const roleAssignments: RoleAssignmentData[] = data.ymRoles.map((role: YMRoleEntry) => ({
        user_id: userId,
        role_type_id: role.roleTypeId || undefined,
        role_type_custom: role.roleTypeCustom || undefined,
        amir_user_id: role.amirUserId || undefined,
        amir_custom_name: role.amirCustomName || undefined,
        start_date: monthYearToDate(role.startMonth, role.startYear),
        end_date: role.isCurrent ? undefined : monthYearToDate(role.endMonth, role.endYear),
        is_active: role.isCurrent
      }))

      const { error: rolesError } = await supabase
        .from('role_assignments')
        .insert(roleAssignments)

      if (rolesError) {
        console.error('Error creating role assignments:', rolesError)
        // Don't fail completely, just log the error
      }
    }

    // 4. Create user projects (YM Projects)
    if (data.ymProjects && data.ymProjects.length > 0) {
      // Delete existing projects for this user (to replace with new ones)
      await supabase
        .from('user_projects')
        .delete()
        .eq('user_id', userId)

      const userProjects: UserProjectData[] = data.ymProjects.map((project: YMProjectEntry) => ({
        user_id: userId,
        project_type: project.projectType || undefined,
        project_type_custom: project.projectTypeCustom || undefined,
        role: project.role || undefined,
        amir_user_id: project.amirUserId || undefined,
        amir_custom_name: project.amirCustomName || undefined,
        start_month: project.startMonth,
        start_year: project.startYear,
        end_month: project.isCurrent ? undefined : project.endMonth,
        end_year: project.isCurrent ? undefined : project.endYear,
        is_current: project.isCurrent,
        description: project.description || undefined
      }))

      const { error: projectsError } = await supabase
        .from('user_projects')
        .insert(userProjects)

      if (projectsError) {
        console.error('Error creating user projects:', projectsError)
        // Don't fail completely, just log the error
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error saving onboarding data:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Fetches all required data to determine if onboarding is complete
 * Checks if all required fields are filled
 */
export async function getOnboardingStatus(authId: string): Promise<{
  isComplete: boolean
  missingFields: string[]
  user: Record<string, unknown> | null
}> {
  const supabase = createClient()

  // Get user profile
  const { data: user, error: userError } = await supabase
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

  if (userError || !user) {
    return { isComplete: false, missingFields: ['user_not_found'], user: null }
  }

  // If already marked as complete, return early
  if (user.onboarding_completed_at) {
    return { isComplete: true, missingFields: [], user }
  }

  // Check required fields
  const missingFields: string[] = []

  // Step 1: Personal Info (all optional for now, but we track them)
  // Phone, email, ethnicity, DOB are all optional

  // Step 2: Location - check if user has an active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    missingFields.push('location')
  }

  // Step 5: Education level is required
  if (!user.education_level) {
    missingFields.push('education_level')
  }

  // Step 6: At least 3 skills required
  const skills = user.skills as string[] | null
  if (!skills || skills.length < 3) {
    missingFields.push('skills')
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    user
  }
}
