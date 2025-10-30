"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bannersAPI } from "@/lib/api/banners"

export const useBanners = (pageNumber = 1, pageSize = 10, bannerType?: string, isActive?: boolean) => {
  return useQuery({
    queryKey: ["banners", pageNumber, pageSize, bannerType, isActive],
    queryFn: () => bannersAPI.getAllBanners(pageNumber, pageSize, bannerType, isActive),
  })
}

export const useActiveBanners = (bannerType: string) => {
  return useQuery({
    queryKey: ["activeBanners", bannerType],
    queryFn: () => bannersAPI.getActiveBanners(bannerType),
  })
}

export const useBannerById = (id: string) => {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: () => bannersAPI.getBannerById(id),
    enabled: !!id,
  })
}

export const useCreateBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => bannersAPI.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
    },
  })
}

export const useUpdateBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bannersAPI.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
    },
  })
}

export const useDeleteBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bannersAPI.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
    },
  })
}

export const useReorderBanners = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => bannersAPI.reorderBanners(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
    },
  })
}
