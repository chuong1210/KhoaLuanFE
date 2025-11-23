import { orderApi, ApiResponse } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { Voucher, VoucherSearchParams, VouchersResponse, CreateVoucherRequest } from '../types'

export const vouchersService = {
  // Get all vouchers with filters
  getVouchers: async (params: VoucherSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await orderApi.get<ApiResponse<VouchersResponse>>(
      `/vouchers/management?${queryString}`
    )
    return response.data.result
  },

  // Get voucher by ID
  getVoucher: async (voucherId: string) => {
    const response = await orderApi.get<ApiResponse<Voucher>>(
      `/vouchers/${voucherId}`
    )
    return response.data.result
  },

  // Create voucher
  createVoucher: async (data: CreateVoucherRequest) => {
    const response = await orderApi.post<ApiResponse<null>>(
      '/vouchers',
      data
    )
    return response.data
  },

  // Update voucher
  updateVoucher: async (voucherId: string, data: Partial<CreateVoucherRequest>) => {
    const response = await orderApi.put<ApiResponse<Voucher>>(
      `/vouchers/${voucherId}`,
      data
    )
    return response.data.result
  },

  // Delete voucher
  deleteVoucher: async (voucherId: string) => {
    const response = await orderApi.delete<ApiResponse<boolean>>(
      `/vouchers/${voucherId}`
    )
    return response.data.result
  },

  // Toggle voucher active status
  toggleVoucherStatus: async (voucherId: string, isActive: boolean) => {
    const response = await orderApi.patch<ApiResponse<boolean>>(
      `/vouchers/${voucherId}/status`,
      { is_active: isActive }
    )
    return response.data.result
  },
}
