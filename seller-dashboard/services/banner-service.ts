import { apiClient } from "@/lib/api/axios-instance"
import type { Banner, BannerFormData } from "@/types/banner"

const BANNER_API = "http://localhost:8000/api/Banner"

export const bannerService = {
  getBanners: async (): Promise<Banner[]> => {
    const response = await apiClient.get(BANNER_API)
    return response.data.result || response.data
  },

  getBannerById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get(`${BANNER_API}/${id}`)
    return response.data.result || response.data
  },

  createBanner: async (data: BannerFormData): Promise<Banner> => {
    const response = await apiClient.post(BANNER_API, data)
    return response.data.result || response.data
  },

  updateBanner: async (id: string, data: Partial<BannerFormData>): Promise<Banner> => {
    const response = await apiClient.put(`${BANNER_API}/${id}`, data)
    return response.data.result || response.data
  },

  deleteBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`${BANNER_API}/${id}`)
  },
}
