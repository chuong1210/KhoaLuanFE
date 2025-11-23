import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vouchersService } from '../services/vouchersApi'
import type { VoucherSearchParams, CreateVoucherRequest } from '../types'

export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (params: VoucherSearchParams) => [...voucherKeys.lists(), params] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
}

export function useVouchers(params: VoucherSearchParams = { page: 1, page_size: 10 }) {
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => vouchersService.getVouchers(params),
  })
}

export function useVoucherDetail(voucherId: string) {
  return useQuery({
    queryKey: voucherKeys.detail(voucherId),
    queryFn: () => vouchersService.getVoucher(voucherId),
    enabled: !!voucherId,
  })
}

export function useCreateVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => vouchersService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Tạo voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVoucherRequest> }) =>
      vouchersService.updateVoucher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Cập nhật voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (voucherId: string) => vouchersService.deleteVoucher(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Xóa voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useToggleVoucherStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      vouchersService.toggleVoucherStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
      toast.success('Cập nhật trạng thái voucher thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}
