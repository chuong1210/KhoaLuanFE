// features/vouchers/hooks/useVouchers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vouchersService } from '../services/vouchersApi'
import type { 
  VoucherSearchParams, 
  CreateVoucherRequest,
  UpdateVoucherRequest 
} from '../types'

export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (params: VoucherSearchParams) => [...voucherKeys.lists(), params] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
  shopVouchers: (shopId: string) => [...voucherKeys.all, 'shop', shopId] as const,
}

/**
 * Get vouchers with filters
 */
export function useVouchers(params: VoucherSearchParams = { page: 1, page_size: 10 }) {
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => vouchersService.getVouchers(params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get single voucher detail
 */
export function useVoucherDetail(voucherId: string) {
  return useQuery({
    queryKey: voucherKeys.detail(voucherId),
    queryFn: () => vouchersService.getVoucher(voucherId),
    enabled: !!voucherId,
  })
}

/**
 * Get shop vouchers
 */
export function useShopVouchers(
  shopId: string, 
  params?: Omit<VoucherSearchParams, 'shop_id'>
) {
  return useQuery({
    queryKey: voucherKeys.shopVouchers(shopId),
    queryFn: () => vouchersService.getShopVouchers(shopId, params),
    enabled: !!shopId,
  })
}

/**
 * Create voucher
 */
export function useCreateVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => vouchersService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Tạo voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo voucher: ${error.message}`)
    },
  })
}

/**
 * Update voucher
 */
export function useUpdateVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      vouchersService.updateVoucher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Cập nhật voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật voucher: ${error.message}`)
    },
  })
}

/**
 * Delete voucher
 */
export function useDeleteVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (voucherId: string) => vouchersService.deleteVoucher(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Xóa voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa voucher: ${error.message}`)
    },
  })
}

/**
 * Toggle voucher status
 */
export function useToggleVoucherStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      vouchersService.toggleVoucherStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Cập nhật trạng thái thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật trạng thái: ${error.message}`)
    },
  })
}

/**
 * Bulk delete vouchers
 */
export function useBulkDeleteVouchers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (voucherIds: string[]) => vouchersService.bulkDeleteVouchers(voucherIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Xóa vouchers thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa vouchers: ${error.message}`)
    },
  })
}