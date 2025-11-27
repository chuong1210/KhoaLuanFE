// hooks/useActiveBanners.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios-instance";
import type { Banner } from "../types/banner";

interface ActiveBannersResponse {
  result: Banner[];
  messages: string[];
  succeeded: boolean;
  code: number;
}

export const useActiveBanners = (bannerType: string = "HOME") => {
  return useQuery({
    queryKey: ["activeBanners", bannerType],
    queryFn: async () => {
      const response = await apiClient.get<ActiveBannersResponse>(
        `http://localhost:8000/api/Banners/active?bannerType=${bannerType}`
      );
      return response.data.result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};