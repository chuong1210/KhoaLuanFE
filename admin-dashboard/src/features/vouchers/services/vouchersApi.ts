// features/vouchers/services/vouchersApi.ts

import { orderApi, ApiResponse } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { 
  Voucher, 
  VoucherSearchParams, 
  VouchersResponse, 
  CreateVoucherRequest,
  UpdateVoucherRequest 
} from '../types'

export const vouchersService = {
  /**
   * Get all vouchers with comprehensive filters
   */
  getVouchers: async (params: VoucherSearchParams): Promise<VouchersResponse> => {
    const queryString = parseQueryParams(params)
    const response = await orderApi.get<ApiResponse<VouchersResponse>>(
      `/vouchers/management?${queryString}`
    )
    return response.data.result
  },

  /**
   * Get voucher by ID
   */
  getVoucher: async (voucherId: string): Promise<Voucher> => {
    const response = await orderApi.get<ApiResponse<Voucher>>(
      `/vouchers/${voucherId}`
    )
    return response.data.result
  },

  /**
   * Create new voucher
   */
  createVoucher: async (data: CreateVoucherRequest): Promise<any> => {
    const response = await orderApi.post<ApiResponse<null>>(
      '/vouchers',
      data
    )
    return response.data.result
  },

  /**
   * Update existing voucher
   */
  updateVoucher: async (voucherId: string, data: UpdateVoucherRequest): Promise<Voucher> => {
    const response = await orderApi.put<ApiResponse<Voucher>>(
      `/vouchers/${voucherId}`,
      data
    )
    return response.data.result
  },

  /**
   * Delete voucher
   */
  deleteVoucher: async (voucherId: string): Promise<boolean> => {
    const response = await orderApi.delete<ApiResponse<boolean>>(
      `/vouchers/${voucherId}`
    )
    return response.data.result
  },

  /**
   * Toggle voucher active status
   */
  toggleVoucherStatus: async (voucherId: string, isActive: boolean): Promise<boolean> => {
    const response = await orderApi.patch<ApiResponse<boolean>>(
      `/vouchers/${voucherId}/status`,
      { is_active: isActive }
    )
    return response.data.result
  },

  /**
   * Get vouchers by shop
   */
  getShopVouchers: async (shopId: string, params?: Omit<VoucherSearchParams, 'shop_id'>): Promise<VouchersResponse> => {
    const queryString = parseQueryParams({ ...params, shop_id: shopId })
    const response = await orderApi.get<ApiResponse<VouchersResponse>>(
      `/vouchers/management?${queryString}`
    )
    return response.data.result
  },

  /**
   * Bulk delete vouchers
   */
  bulkDeleteVouchers: async (voucherIds: string[]): Promise<boolean> => {
    const response = await orderApi.post<ApiResponse<boolean>>(
      '/vouchers/bulk-delete',
      { voucher_ids: voucherIds }
    )
    return response.data.result
  },
}