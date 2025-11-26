// features/orders/hooks/useOrders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ordersService } from '../services/ordersApi'
import type { 
  OrderSearchParams,
  UpdateOrderStatusRequest,
  CancelOrderRequest 
} from '../types'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderSearchParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  shopOrders: (shopId: string) => [...orderKeys.all, 'shop', shopId] as const,
  stats: (params?: any) => [...orderKeys.all, 'stats', params] as const,
}

/**
 * Get orders with comprehensive filters
 */
export function useOrders(params: OrderSearchParams = { page: 1, page_size: 10 }) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.searchOrders(params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get single order detail
 */
export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersService.getOrder(orderId),
    enabled: !!orderId,
  })
}

/**
 * Get shop orders
 */
export function useShopOrders(
  shopId: string, 
  params?: Omit<OrderSearchParams, 'shop_id'>
) {
  return useQuery({
    queryKey: orderKeys.shopOrders(shopId),
    queryFn: () => ordersService.getShopOrders(shopId, params),
    enabled: !!shopId,
  })
}

/**
 * Get order statistics
 */
export function useOrderStats(params?: {
  shop_id?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: orderKeys.stats(params),
    queryFn: () => ordersService.getOrderStats(params),
  })
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderStatusRequest }) =>
      ordersService.updateOrderStatus(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Cập nhật trạng thái đơn hàng thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật trạng thái: ${error.message}`)
    },
  })
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: CancelOrderRequest }) =>
      ordersService.cancelOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Hủy đơn hàng thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi hủy đơn hàng: ${error.message}`)
    },
  })
}

/**
 * Export orders
 */
export function useExportOrders() {
  return useMutation({
    mutationFn: (params: OrderSearchParams) => ordersService.exportOrders(params),
    onSuccess: (blob: Blob | MediaSource) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `orders_${new Date().toISOString()}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('Xuất file thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xuất file: ${error.message}`)
    },
  })
}