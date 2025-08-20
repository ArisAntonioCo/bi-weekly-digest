export interface Expert {
  id: string
  name: string
  title?: string
  focus_areas?: string
  investing_law: string
  framework_description?: string
  is_default: boolean
  is_active: boolean
  display_order?: number
  category?: 'value' | 'growth' | 'tech' | 'macro' | 'custom'
  created_at: string
  updated_at: string
}

export interface UserExpertPreference {
  id: string
  user_id: string
  expert_ids: string[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ExpertSelectionConfig {
  minExperts: number  // Minimum experts to select (default: 1)
  maxExperts: number  // Maximum experts to select (default: 5)
  defaultExperts: string[]  // IDs of experts selected by default
  categories: string[]  // Available categories for filtering
}

export interface CreateExpertInput {
  name: string
  title?: string
  focus_areas?: string
  investing_law: string
  framework_description?: string
  category?: 'value' | 'growth' | 'tech' | 'macro' | 'custom'
  display_order?: number
  is_active?: boolean
}

export interface UpdateExpertInput extends Partial<CreateExpertInput> {
  is_active?: boolean
  is_default?: boolean
}