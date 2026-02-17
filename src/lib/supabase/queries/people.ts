import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

// Type aliases for cleaner code
type Tables = Database['public']['Tables']
type RoleTypeRow = Tables['role_types']['Row']
type NeighborNetRow = Tables['neighbor_nets']['Row']
type SubregionRow = Tables['subregions']['Row']
type RegionRow = Tables['regions']['Row']

export interface PersonListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  region: { id: string; name: string } | null
  subregion: { id: string; name: string } | null
  neighborNet: { id: string; name: string } | null
  roles: { id: string; name: string; category: string }[]
  skills: string[]
  yearsInYM?: number
  isClaimed: boolean
}

export interface FilterOption {
  id: string
  name: string
}

export interface FilterCategories {
  regions: FilterOption[]
  subregions: FilterOption[]
  neighborNets: FilterOption[]
  roles: FilterOption[]
  skills: FilterOption[]
}

/**
 * Fetch all people for the directory with their roles and geographic info
 */
export async function fetchPeopleForDirectory(): Promise<PersonListItem[]> {
  const supabase = await createClient()

  // Fetch all users — claimed (onboarded) users first, then unclaimed
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('claimed_at', { ascending: false, nullsFirst: false })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return []
  }

  if (!users || users.length === 0) {
    return []
  }

  const userIds = users.map((u) => u.id)

  // Fetch role assignments and memberships in parallel (independent queries)
  const [
    { data: roleAssignments, error: rolesError },
    { data: memberships, error: membershipsError },
  ] = await Promise.all([
    supabase
      .from('role_assignments')
      .select(`
        *,
        role_types (*)
      `)
      .in('user_id', userIds)
      .eq('is_active', true),
    supabase
      .from('memberships')
      .select(`
        *,
        neighbor_nets (
          *,
          subregions (
            *,
            regions (*)
          )
        )
      `)
      .in('user_id', userIds)
      .eq('status', 'active'),
  ])

  if (rolesError) {
    console.error('Error fetching role assignments:', rolesError)
  }
  if (membershipsError) {
    console.error('Error fetching memberships:', membershipsError)
  }

  // Build the PersonListItem array
  return users.map((user) => {
    const userMembership = memberships?.find((m) => m.user_id === user.id)
    const userRoles = roleAssignments?.filter((ra) => ra.user_id === user.id) || []

    // Extract geographic info from membership
    const nn = userMembership?.neighbor_nets as (NeighborNetRow & {
      subregions: SubregionRow & { regions: RegionRow }
    }) | null

    const neighborNet = nn ? { id: nn.id, name: nn.name } : null
    const subregion = nn?.subregions ? { id: nn.subregions.id, name: nn.subregions.name } : null
    const region = nn?.subregions?.regions ? { id: nn.subregions.regions.id, name: nn.subregions.regions.name } : null

    // Calculate years in YM
    let yearsInYM: number | undefined
    if (userMembership?.joined_at) {
      const joinedYear = new Date(userMembership.joined_at).getFullYear()
      yearsInYM = new Date().getFullYear() - joinedYear
    }

    // Map roles
    const roles = userRoles.map((ra) => {
      const roleType = ra.role_types as RoleTypeRow | null
      return {
        id: roleType?.id || ra.id,
        name: roleType?.name || ra.role_type_custom || 'Unknown Role',
        category: roleType?.category || 'other',
      }
    })

    return {
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email,
      avatarUrl: user.avatar_url || undefined,
      region,
      subregion,
      neighborNet,
      roles,
      skills: user.skills || [],
      yearsInYM,
      isClaimed: user.claimed_at !== null,
    }
  })
}

/**
 * Fetch filter options from database
 */
export async function fetchFilterCategories(): Promise<FilterCategories> {
  const supabase = await createClient()

  const [regionsRes, subregionsRes, neighborNetsRes, roleTypesRes, usersSkillsRes] = await Promise.all([
    supabase.from('regions').select('id, name').eq('is_active', true).order('name'),
    supabase.from('subregions').select('id, name').eq('is_active', true).order('name'),
    supabase.from('neighbor_nets').select('id, name').eq('is_active', true).order('name'),
    supabase.from('role_types').select('id, name').order('sort_order'),
    supabase.from('users').select('skills').not('onboarding_completed_at', 'is', null),
  ])

  // Log any errors from filter queries
  if (regionsRes.error) console.error('Error fetching regions:', regionsRes.error)
  if (subregionsRes.error) console.error('Error fetching subregions:', subregionsRes.error)
  if (neighborNetsRes.error) console.error('Error fetching neighbor_nets:', neighborNetsRes.error)
  if (roleTypesRes.error) console.error('Error fetching role_types:', roleTypesRes.error)
  if (usersSkillsRes.error) console.error('Error fetching user skills:', usersSkillsRes.error)

  // Build unique skills list
  const skillSet = new Set<string>()
  usersSkillsRes.data?.forEach((u) => {
    u.skills?.forEach((skill) => skillSet.add(skill))
  })
  const skills = Array.from(skillSet)
    .sort()
    .map((s) => ({ id: s.toLowerCase().replace(/\s+/g, '-'), name: s }))

  return {
    regions: regionsRes.data || [],
    subregions: subregionsRes.data || [],
    neighborNets: neighborNetsRes.data || [],
    roles: roleTypesRes.data || [],
    skills,
  }
}
