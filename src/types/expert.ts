export interface Expert {
  id: string
  name: string
  title?: string
  investing_law: string
  framework_description?: string
  avatar_seed?: string
  created_at: string
  updated_at: string
}

export interface UserExpertPreference {
  id: string
  user_id: string
  expert_ids: string[]
  created_at: string
  updated_at: string
}

export interface ExpertSelectionConfig {
  minExperts: number  // Minimum experts to select (default: 1)
  maxExperts: number  // Maximum experts to select (default: 5)
  defaultExperts: string[]  // IDs of experts selected by default
}

export interface CreateExpertInput {
  name: string
  title?: string
  investing_law: string
  framework_description?: string
  avatar_seed?: string
}

export type UpdateExpertInput = Partial<CreateExpertInput>