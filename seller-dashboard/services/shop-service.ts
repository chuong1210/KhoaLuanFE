// services/shop-service.ts
// Added uploadMedia function to handle file uploads to http://localhost:9001/v1/media.
// Assumes API is POST multipart/form-data with key "media" for file, returns { result: { name: "filename.ext" } } or similar.
// In createShopWithTax, if shopLogo or shopBanner is File, upload first and use returned name as string.

import { apiClient } from "@/lib/api/axios-instance"
import type { Shop, CreateShopWithTaxRequest, ShopData, TaxInfo, ShopFormData } from "@/types/shop"

const SHOP_API_BASE = "http://localhost:8000/api/Shops"
const MEDIA_API_BASE = "http://localhost:9001/v1/media"

export const shopService = {
  // Upload media file
  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("media", file)
    const response = await apiClient.post(MEDIA_API_BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    // Assume response structure: { result: { name: "filename.ext" } }; adjust if different
    const fileName = response.data.result?.name || response.data.name
    if (!fileName) {
      throw new Error("Failed to upload media")
    }
    return fileName // Use as path in ShopLogo/ShopBanner, e.g., "uploads/filename.ext"
  },

  // Get current user's shop (preferred for management page)
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

  // Get all shops (with optional paging)
  getShops: async (pageNumber = 1, pageSize = 30): Promise<{ shops: Shop[]; pagination: any }> => {
    const response = await apiClient.get(`${SHOP_API_BASE}?PageNumber=${pageNumber}&PageSize=${pageSize}`)
    return {
      shops: response.data.result || response.data,
      pagination: response.data.extra || {}
    }
  },

  // Get shop by ID
  getShopById: async (shopId: string): Promise<Shop> => {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopId}`)
    return response.data.result || response.data
  },

  // Create shop with tax (handles File uploads for logo/banner)
  createShopWithTax: async (data: ShopFormData): Promise<Shop> => {
  
    let logoPath: string | File | undefined = data.shopLogo
    let bannerPath: string | File | undefined = data.shopBanner
    // Upload files if provided
    if (logoPath instanceof File) {
      logoPath = await shopService.uploadMedia(logoPath)
    }
    if (bannerPath instanceof File) {
      bannerPath = await shopService.uploadMedia(bannerPath)
    }

    const payload = {
      ShopName: data.shopName,
      ShopDescription: data.shopDescription || "",
      ShopLogo: logoPath || "",
      ShopEmail: data.shopEmail,
      ShopPersonalIdentifyId: data.shopPersonalIdentifyId || "",
      ShopPhone: data.shopPhone,
      ShopAddress: data.shopAddress, // Full address string
      ShopAddressId: data.shopAddressId || "", // Optional ID
      TaxCode: data.shopTaxId, // From form
      TaxNationalName: "National Name", // Default or prompt user
      TaxShortName: "Short Name",
      TaxPresentName: "Present Name",
      TaxActiveDate: "2023-01-01T00:00:00",
      TaxBusinessType: "Business Type",
      TaxActiveStatus: true,
      ShopBanner: bannerPath || "", // Optional
    }
    const response = await apiClient.post(`${SHOP_API_BASE}/with-tax`, payload)
    return response.data.result || response.data
  },

  // Update shop (partial, including optional tax; handles File uploads similarly)
  updateShop: async (shopId: string, data: Partial<ShopFormData>): Promise<Shop> => {
    let logoPath: string | File | undefined = data.shopLogo
    let bannerPath: string | File | undefined = data.shopBanner

    // Upload files if provided
    if (logoPath && typeof logoPath !== 'string' && logoPath instanceof File) {
      logoPath = await shopService.uploadMedia(logoPath)
    }
    if (bannerPath && typeof bannerPath !== 'string' && bannerPath instanceof File) {
      bannerPath = await shopService.uploadMedia(bannerPath)
    }

    const payload: any = {}
    if (data.shopName) payload.ShopName = data.shopName
    if (data.shopDescription) payload.ShopDescription = data.shopDescription
    if (logoPath) payload.ShopLogo = logoPath
    if (data.shopEmail) payload.ShopEmail = data.shopEmail
    if (data.shopPhone) payload.ShopPhone = data.shopPhone
    if (data.shopAddress) payload.ShopAddress = data.shopAddress
    if (data.shopPersonalIdentifyId) payload.ShopPersonalIdentifyId = data.shopPersonalIdentifyId
    if (data.shopAddressId) payload.ShopAddressId = data.shopAddressId
    if (bannerPath) payload.ShopBanner = bannerPath

    // Optional tax updates
    if ('shopTaxId' in data && data.shopTaxId !== undefined) payload.TaxCode = data.shopTaxId
    if ('taxNationalName' in data && data.taxNationalName !== undefined) payload.TaxNationalName = data.taxNationalName
    if ('taxShortName' in data && data.taxShortName !== undefined) payload.TaxShortName = data.taxShortName
    if ('taxPresentName' in data && data.taxPresentName !== undefined) payload.TaxPresentName = data.taxPresentName
    if ('taxActiveDate' in data && data.taxActiveDate !== undefined) payload.TaxActiveDate = data.taxActiveDate
    if ('taxBusinessType' in data && data.taxBusinessType !== undefined) payload.TaxBusinessType = data.taxBusinessType
    if ('taxActiveStatus' in data && data.taxActiveStatus !== undefined) payload.TaxActiveStatus = data.taxActiveStatus

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