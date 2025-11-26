// features/shops/hooks/useShops.ts - UPDATED VERSION

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { shopsService } from '../services/shopsApi'
import type { ShopSearchParams, ShopApprovalRequest, ShopsResponse } from '../types/index'

export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (params: ShopSearchParams) => [...shopKeys.lists(), params] as const,
  details: () => [...shopKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopKeys.details(), id] as const,
  pending: () => [...shopKeys.all, 'pending'] as const,
  pendingList: (params: { pageNumber: number; pageSize: number }) =>
    [...shopKeys.pending(), params] as const,
}

/**
 * Get shops with optional query options
 */
export function useShops(
  params: ShopSearchParams = { pagenumber: 1, pagesize: 10 },
  options?: Omit<UseQueryOptions<ShopsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopsService.getShops(params),
    ...options,
  })
}

export function useShopDetail(shopId: string) {
  return useQuery({
    queryKey: shopKeys.detail(shopId),
    queryFn: () => shopsService.getShop(shopId),
    enabled: !!shopId,
  })
}

// Alias for useShopDetail
export const useShop = useShopDetail

export function usePendingShops(
  params: { pageNumber: number; pageSize: number } = { pageNumber: 1, pageSize: 20 }
) {
  return useQuery({
    queryKey: shopKeys.pendingList(params),
    queryFn: () => shopsService.getPendingShops(params),
  })
}

export function useDeleteShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shopId: string) => shopsService.deleteShop(shopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
      toast.success('Xóa shop thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useApproveShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shopId, data }: { shopId: string; data: ShopApprovalRequest }) =>
      shopsService.approveShop(shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.pending() })
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
      const message = variables.data.IsApproved
        ? 'Duyệt shop thành công!'
        : 'Từ chối shop thành công!'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}