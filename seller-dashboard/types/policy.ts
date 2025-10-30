export interface Policy {
  id: string
  shopId: string | null
  title: string
  content: string
  version: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface PolicyFormData {
  title: string
  content: string
  version: string
}
