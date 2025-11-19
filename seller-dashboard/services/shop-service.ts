// services/shop-service.ts
import { apiClient } from "@/lib/api/axios-instance"
import type { Shop, CreateShopWithTaxRequest, ShopData, TaxInfo, ShopFormData, UpdateShopRequest } from "@/types/shop"
import { isFile } from "@/lib/utils/file-utils"
import { cookies } from "@/lib/utils/cookies"

const SHOP_API_BASE = "http://localhost:8000/api/Shops"
const MEDIA_API_BASE = "http://localhost:9001/v1/media"

export const shopService = {
  // Upload media file
 uploadMedia: async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("media", file);

  const token = cookies.get("token"); // lấy token

  const response = await fetch(MEDIA_API_BASE, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload media");
  }

  const data = await response.json();

  if (data.result && Array.isArray(data.result) && data.result.length > 0) {
    return data.result[0];
  }

  throw new Error("Invalid media upload response");
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
    let logoPath: string = ""
    let bannerPath: string = ""

    try {
      // Upload logo if provided
      if (data.shopLogo && isFile(data.shopLogo)) {
        console.log("Uploading logo...", (data.shopLogo as File).name)
        logoPath = await shopService.uploadMedia(data.shopLogo as File)
        console.log("Logo uploaded:", logoPath)
      } else if (typeof data.shopLogo === 'string') {
        logoPath = data.shopLogo
      }

      // Upload banner if provided
      if (data.shopBanner && isFile(data.shopBanner)) {
        console.log("Uploading banner...", (data.shopBanner as File).name)
        bannerPath = await shopService.uploadMedia(data.shopBanner as File)
        console.log("Banner uploaded:", bannerPath)
      } else if (typeof data.shopBanner === 'string') {
        bannerPath = data.shopBanner
      }

      const payload = {
        ShopName: data.shopName,
        ShopDescription: data.shopDescription || "",
        ShopLogo: logoPath,
        ShopEmail: data.shopEmail,
        ShopPersonalIdentifyId: data.shopPersonalIdentifyId || "",
        ShopPhone: data.shopPhone,
        ShopAddress: data.shopAddress,
        // ShopAddressId: data.shopAddressId || "",
        TaxCode: data.shopTaxId,
        TaxNationalName: "National Name",
        TaxShortName: "Short Name",
        TaxPresentName: "Present Name",
        TaxActiveDate: "2023-01-01T00:00:00",
        TaxBusinessType: "Business Type",
        TaxActiveStatus: true,
        ShopBanner: bannerPath,
          BannerType: bannerPath ? (data.bannerType || "HOME") : null, 
      }

      console.log("Creating shop with payload:", payload)
      const response = await apiClient.post(`${SHOP_API_BASE}/with-tax`, payload)
      return response.data.result || response.data
    } catch (error: any) {
      console.error("Create shop error:", error)
      throw new Error(error.message || "Failed to create shop")
    }
  },

  // Update shop (partial, including optional tax; handles File uploads similarly)
updateShop: async (shopId: string, data: Partial<UpdateShopRequest>): Promise<Shop> => {
    let logoPath: string = "";
    let bannerPath: string = "";

    try {
      // 1. Xử lý Logo: Nếu là File thì upload, nếu là string (URL cũ) thì giữ nguyên
      if (data.shopLogo && isFile(data.shopLogo)) {
        logoPath = await shopService.uploadMedia(data.shopLogo as File);
      } else if (typeof data.shopLogo === 'string') {
        logoPath = data.shopLogo;
      }

      // 2. Xử lý Banner: Tương tự
      if (data.shopBanner && isFile(data.shopBanner)) {
        bannerPath = await shopService.uploadMedia(data.shopBanner as File);
      } else if (typeof data.shopBanner === 'string') {
        bannerPath = data.shopBanner;
      }

      // 3. Tạo Payload mapping với DTO C# (UpdateShopRequest)
      const payload = {
        ShopName: data.shopName,
        ShopDescription: data.shopDescription,
        ShopLogo: logoPath,
        ShopBanner: bannerPath,
        BannerType: data.bannerType, // --- QUAN TRỌNG: Gửi loại banner
        ShopEmail: data.shopEmail,
        ShopPhone: data.shopPhone,
        ShopAddress: data.shopAddress,
        ShopPersonalIdentifyId: data.shopPersonalIdentifyId,
        ShopStatus: data.shopStatus,
      };

      const response = await apiClient.put(`${SHOP_API_BASE}/${shopId}`, payload);
      return response.data.result || response.data;
    } catch (error: any) {
      console.error("Update shop error:", error);
      throw error; // Ném lỗi để Component bắt validation
    }
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