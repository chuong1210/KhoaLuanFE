

import { apiClient } from "@/lib/api/axios-instance"
import type { VoucherShop, VoucherFormData } from "@/types/voucher"

const VOUCHER_API = "http://localhost:9002/v1/vouchers"

export const voucherService = {
  getVouchers: async (): Promise<VoucherShop[]> => {
    const response = await apiClient.get(`${VOUCHER_API}?sort_by=created_at`)
    return response.data.result?.data || response.data
  },

  getVoucherById: async (id: string): Promise<VoucherShop> => {
    const response = await apiClient.get(`${VOUCHER_API}/${id}`)
    return response.data.result || response.data
  },

  createVoucher: async (data: VoucherFormData): Promise<void> => {
    const payload: any = {
      name: data.name,
      voucher_code: data.voucher_code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount_amount: data.max_discount_amount || 0,
      applies_to_type: data.applies_to_type,
      min_purchase_amount: data.min_purchase_amount,
      audience_type: data.audience_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_quantity: data.total_quantity,
      max_usage_per_user: data.max_usage_per_user,
    }
    if (data.audience_type === "ASSIGNED" && data.user_use && data.user_use.length > 0) {
      payload.user_use = data.user_use
    }
    const response = await apiClient.post(VOUCHER_API, payload)
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to create voucher")
    }
  },

  updateVoucher: async (id: string, data: Partial<VoucherFormData>): Promise<void> => {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.voucher_code !== undefined) payload.voucher_code = data.voucher_code
    if (data.discount_type !== undefined) payload.discount_type = data.discount_type
    if (data.discount_value !== undefined) payload.discount_value = data.discount_value
    if (data.max_discount_amount !== undefined) payload.max_discount_amount = data.max_discount_amount
    if (data.applies_to_type !== undefined) payload.applies_to_type = data.applies_to_type
    if (data.min_purchase_amount !== undefined) payload.min_purchase_amount = data.min_purchase_amount
    if (data.audience_type !== undefined) payload.audience_type = data.audience_type
    if (data.start_date !== undefined) payload.start_date = data.start_date
    if (data.end_date !== undefined) payload.end_date = data.end_date
    if (data.total_quantity !== undefined) payload.total_quantity = data.total_quantity
    if (data.max_usage_per_user !== undefined) payload.max_usage_per_user = data.max_usage_per_user
    if (data.is_active !== undefined) payload.is_active = data.is_active
    if (data.user_use !== undefined) payload.user_use = data.user_use

    const response = await apiClient.put(`${VOUCHER_API}/${id}`, payload)
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to update voucher")
    }
  },

  deleteVoucher: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`${VOUCHER_API}/${id}`)
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to delete voucher")
    }
  },
}