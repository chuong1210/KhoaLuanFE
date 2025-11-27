// services/banner-service.ts
import { cookies } from "@/lib/cookies";
import { getImageUrl } from "@/lib/file-utils";
import type { Banner, BannerFormData } from "../types/banner";
import { apiClient } from "@/lib/axios-instance";

const BANNER_API_BASE = "http://localhost:8000/api/Banners";
const MEDIA_API_BASE = "http://localhost:9001/v1/media";

export const bannerService = {
  // Hàm lấy URL ảnh từ tên file (sử dụng mediaUtils)

  // Upload media file
  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData();
    const token = cookies.get("token"); // lấy token

    formData.append("media", file);

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
    // API returns array in result: { result: ["filename.png"] }
    if (data.result && Array.isArray(data.result) && data.result.length > 0) {
      return data.result[0];
    }
    throw new Error("Invalid media upload response");
  },

  // Get banners with filters
  getBanners: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    bannerType?: string;
    isActive?: boolean;
  }): Promise<{ banners: Banner[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber)
      queryParams.append("PageNumber", params.pageNumber.toString());
    if (params?.pageSize)
      queryParams.append("PageSize", params.pageSize.toString());
    if (params?.bannerType) queryParams.append("BannerType", params.bannerType);
    if (params?.isActive !== undefined)
      queryParams.append("IsActive", params.isActive.toString());

    const response = await apiClient.get(
      `${BANNER_API_BASE}?${queryParams.toString()}`
    );
    return {
      banners: response.data.result || [],
      pagination: response.data.extra || {},
    };
  },

  // Get banner by ID
  getBannerById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get(`${BANNER_API_BASE}/${id}`);
    return response.data.result || response.data;
  },

  // Create banner
  createBanner: async (data: BannerFormData): Promise<Banner> => {
    let bannerImage = data.bannerImage;

    // Upload image if it's a File
    if (bannerImage instanceof File) {
      bannerImage = await bannerService.uploadMedia(bannerImage);
    }

    const payload = {
      BannerName: data.bannerName,
      BannerImage: bannerImage,
      BannerUrl: data.bannerUrl,
      BannerOrder: data.bannerOrder,
      IsActive: data.isActive !== undefined ? data.isActive : true,
      StartDate: data.startDate,
      EndDate: data.endDate,
      BannerType: data.bannerType || "HOME",
      TargetId: data.targetId || "",
    };

    const response = await apiClient.post(BANNER_API_BASE, payload);
    return response.data.result || response.data;
  },

  // Update banner
  updateBanner: async (
    id: string,
    data: Partial<BannerFormData>
  ): Promise<Banner> => {
    let bannerImage = data.bannerImage;

    // Upload image if it's a File
    if (bannerImage && bannerImage instanceof File) {
      bannerImage = await bannerService.uploadMedia(bannerImage);
    }

    const payload: any = {};
    if (data.bannerName) payload.BannerName = data.bannerName;
    if (bannerImage) payload.BannerImage = bannerImage;
    if (data.bannerUrl) payload.BannerUrl = data.bannerUrl;
    if (data.bannerOrder !== undefined) payload.BannerOrder = data.bannerOrder;
    if (data.isActive !== undefined) payload.IsActive = data.isActive;
    if (data.startDate) payload.StartDate = data.startDate;
    if (data.endDate) payload.EndDate = data.endDate;
    if (data.bannerType) payload.BannerType = data.bannerType;
    if (data.targetId !== undefined) payload.TargetId = data.targetId;

    const response = await apiClient.put(`${BANNER_API_BASE}/${id}`, payload);
    return response.data.result || response.data;
  },

  // Delete banner
  deleteBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`${BANNER_API_BASE}/${id}`);
  },

  // Hàm lấy file Blob từ URL (để chuyển đổi ảnh từ server thành File object)

};