// types/banner.ts
export interface Banner {
  id: string
  shopId: string
  bannerName: string
  bannerImage: string
  bannerUrl: string
  bannerOrder: number
  isActive: boolean
  startDate: string
  endDate: string
  bannerType: "HOME" | "CATEGORY" | "PRODUCT" | "PROMOTION"
  targetId?: string
  createdDate: string
}

export interface BannerFormData {
  bannerName: string
  bannerImage: File | string
  bannerUrl: string
  bannerOrder: number
  isActive?: boolean
  startDate: string
  endDate: string
  bannerType?: "HOME" | "CATEGORY" | "PRODUCT" | "PROMOTION"
  targetId?: string
}