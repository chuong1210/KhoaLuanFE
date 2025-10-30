import axios from "@/lib/axios"

export const bannersAPI = {
  // Get active banners by type
  getActiveBanners: async (bannerType: string) => {
    const response = await axios.get(`/Banners/active?bannerType=${bannerType}`)
    return response.data
  },

  // Get all banners with pagination
  getAllBanners: async (pageNumber: number, pageSize: number, bannerType?: string, isActive?: boolean) => {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    })
    if (bannerType) params.append("BannerType", bannerType)
    if (isActive !== undefined) params.append("IsActive", isActive.toString())

    const response = await axios.get(`/Banners?${params.toString()}`)
    return response.data
  },

  // Get banner by ID
  getBannerById: async (id: string) => {
    const response = await axios.get(`/Banners/${id}`)
    return response.data
  },

  // Create banner
  createBanner: async (data: any) => {
    const response = await axios.post("/Banners", data)
    return response.data
  },

  // Update banner
  updateBanner: async (id: string, data: any) => {
    const response = await axios.put(`/Banners/${id}`, data)
    return response.data
  },

  // Delete banner
  deleteBanner: async (id: string) => {
    const response = await axios.delete(`/Banners/${id}`)
    return response.data
  },

  // Reorder banners
  reorderBanners: async (data: any) => {
    const response = await axios.post("/Banners/order", data)
    return response.data
  },
}
