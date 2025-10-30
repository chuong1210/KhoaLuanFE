export interface Banner {
  id: string
  shopId?: string
  title: string
  image: string
  link: string
  order: number
  startDate: string
  endDate: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface BannerFormData {
  title: string
  image: string
  link: string
  order: number
  startDate: string
  endDate: string
}
