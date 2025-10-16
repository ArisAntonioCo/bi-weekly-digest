import type { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_EXPERT_NAMES = ['Bill Gurley', 'Brad Gerstner', 'Stan Druckenmiller', 'Mary Meeker', 'Beth Kindig'] as const

export interface ExpertProfile {
  id: string
  name: string
  display_order?: number | null
  is_default?: boolean | null
}

const ensureMinimumExperts = (experts: ExpertProfile[], minimum: number): ExpertProfile[] => {
  if (experts.length >= minimum) return experts
  return experts.slice() // return copy even if small; caller will handle fallback
}

export async function getUserExpertRoster(
  supabase: SupabaseClient,
  userId?: string,
  options?: {
    minimum?: number
    maximum?: number
  }
): Promise<ExpertProfile[]> {
  const minimum = options?.minimum ?? 3
  const maximum = options?.maximum ?? 5

  let preferredExpertIds: string[] | null = null

  if (userId) {
    const { data: preference } = await supabase
      .from('user_expert_preferences')
      .select('expert_ids')
      .eq('user_id', userId)
      .maybeSingle()

    if (preference?.expert_ids?.length) {
      preferredExpertIds = preference.expert_ids.filter(Boolean)
    }
  }

  if (preferredExpertIds?.length) {
    const { data: preferredExperts } = await supabase
      .from('experts')
      .select('id,name,display_order,is_default')
      .in('id', preferredExpertIds)
      .eq('is_active', true)

    if (preferredExperts?.length) {
      const ordered = preferredExpertIds
        .map((id) => preferredExperts.find((expert) => expert.id === id))
        .filter((expert): expert is ExpertProfile => Boolean(expert))

      const limited = ordered.slice(0, maximum)
      const ensured = ensureMinimumExperts(limited, minimum)
      if (ensured.length >= minimum) {
        return ensured
      }
    }
  }

  const { data: activeExperts } = await supabase
    .from('experts')
    .select('id,name,display_order,is_default')
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('display_order', { ascending: true, nullsFirst: true })
    .order('name', { ascending: true })

  if (!activeExperts?.length) {
    return []
  }

  const defaultExperts = activeExperts.filter((expert) => expert.is_default)
  const roster: ExpertProfile[] = []

  defaultExperts.forEach((expert) => {
    if (roster.length < maximum) {
      roster.push(expert)
    }
  })

  if (roster.length < maximum) {
    activeExperts.forEach((expert) => {
      if (roster.length >= maximum) return
      if (!roster.find((existing) => existing.id === expert.id)) {
        roster.push(expert)
      }
    })
  }

  return roster.slice(0, Math.max(roster.length, minimum))
}
