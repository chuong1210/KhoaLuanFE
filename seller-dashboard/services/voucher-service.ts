import { apiClient } from "@/lib/api/axios-instance"
import type { VoucherShop, VoucherFormData } from "@/types/voucher"

const VOUCHER_API = "http://localhost:8000/api/VoucherShop"

export const voucherService = {
  getVouchers: async (): Promise<VoucherShop[]> => {
    const response = await apiClient.get(VOUCHER_API)
    return response.data.result || response.data
  },

  getVoucherById: async (id: string): Promise<VoucherShop> => {
    const response = await apiClient.get(`${VOUCHER_API}/${id}`)
    return response.data.result || response.data
  },

  createVoucher: async (data: VoucherFormData): Promise<VoucherShop> => {
    const response = await apiClient.post(VOUCHER_API, data)
    return response.data.result || response.data
  },

  updateVoucher: async (id: string, data: Partial<VoucherFormData>): Promise<VoucherShop> => {
    const response = await apiClient.put(`${VOUCHER_API}/${id}`, data)
    return response.data.result || response.data
  },

  deleteVoucher: async (id: string): Promise<void> => {
    await apiClient.delete(`${VOUCHER_API}/${id}`)
  },
}
