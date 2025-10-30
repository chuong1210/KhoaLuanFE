import { apiClient } from "@/lib/api/axios-instance"
import type { Shop, CreateShopWithTaxRequest, ShopData } from "@/types/shop"

const SHOP_API_BASE = "http://localhost:8000/api/Shops"

export const shopService = {
  getCurrentShop: async (): Promise<ShopData> => {
    try {
      const response = await apiClient.get(`${SHOP_API_BASE}/my-shop`)
      return response.data.result || response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Shop not found")
      }
      throw error
    }
  },

  // Get all shops for current user
  getShops: async (): Promise<Shop[]> => {
    const response = await apiClient.get(SHOP_API_BASE)
    return response.data.result || response.data
  },

  // Get shop by ID
  getShopById: async (shopId: string): Promise<Shop> => {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopId}`)
    return response.data.result || response.data
  },

  createShop: async (data: CreateShopWithTaxRequest): Promise<Shop> => {
    const payload = {
      ShopName: data.shopName,
      ShopDescription: data.shopDescription,
      ShopLogo: data.shopLogo,
      ShopEmail: data.shopEmail,
      ShopPhone: data.shopPhone,
      ShopAddressId: data.shopAddressId,
    }
    const response = await apiClient.post(SHOP_API_BASE, payload)
    return response.data.result || response.data
  },

  createShopWithTax: async (
    data: CreateShopWithTaxRequest & {
      taxCode: string
      taxNationalName: string
      taxShortName: string
      taxPresentName: string
      taxActiveDate: string
      taxBusinessType: string
      taxActiveStatus: boolean
    },
  ): Promise<Shop> => {
    const payload = {
      ShopName: data.shopName,
      ShopDescription: data.shopDescription,
      ShopLogo: data.shopLogo,
      ShopEmail: data.shopEmail,
      ShopPhone: data.shopPhone,
      ShopAddressId: data.shopAddressId,
      TaxCode: data.taxCode,
      TaxNationalName: data.taxNationalName,
      TaxShortName: data.taxShortName,
      TaxPresentName: data.taxPresentName,
      TaxActiveDate: data.taxActiveDate,
      TaxBusinessType: data.taxBusinessType,
      TaxActiveStatus: data.taxActiveStatus,
    }
    const response = await apiClient.post(`${SHOP_API_BASE}/with-tax`, payload)
    return response.data.result || response.data
  },

  // Update shop
  updateShop: async (shopId: string, data: Partial<CreateShopWithTaxRequest>): Promise<Shop> => {
    const payload: any = {}
    if (data.shopName) payload.ShopName = data.shopName
    if (data.shopDescription) payload.ShopDescription = data.shopDescription
    if (data.shopLogo) payload.ShopLogo = data.shopLogo
    if (data.shopEmail) payload.ShopEmail = data.shopEmail
    if (data.shopPhone) payload.ShopPhone = data.shopPhone
    if (data.shopAddressId) payload.ShopAddressId = data.shopAddressId

    const response = await apiClient.put(`${SHOP_API_BASE}/${shopId}`, payload)
    return response.data.result || response.data
  },

  // Delete shop
  deleteShop: async (shopId: string): Promise<void> => {
    await apiClient.delete(`${SHOP_API_BASE}/${shopId}`)
  },

  // Follow a shop
  followShop: async (shopId: string): Promise<void> => {
    await apiClient.post(`${SHOP_API_BASE}/${shopId}/follow`)
  },

  // Unfollow a shop
  unfollowShop: async (shopId: string): Promise<void> => {
    await apiClient.delete(`${SHOP_API_BASE}/${shopId}/follow`)
  },
}
