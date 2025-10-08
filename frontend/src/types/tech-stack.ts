export interface TechStackChild {
  id: string
  label: string
  icon?: string | null
  description?: string | null
  projectIds: string[]
}

export interface TechStackCategory {
  id: string
  label: string
  icon?: string | null
  children: TechStackChild[]
}

export interface TechStackConfig {
  categories: TechStackCategory[]
  updatedAt?: string | null
}

export interface TechStackResponseData extends TechStackConfig {
  projectAssignments: Record<string, string[]>
}
