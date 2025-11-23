import { shopApi, ShopApiResponse } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { Shop, ShopSearchParams, PendingShop, ShopApprovalRequest, ShopsResponse } from '../types'

export const shopsService = {
  // Get all shops with filters
  getShops: async (params: ShopSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await shopApi.get<ShopsResponse>(
      `/Shops?${queryString}`
    )
    return response.data
  },

  // Get shop by ID
  getShop: async (shopId: string) => {
    const response = await shopApi.get<ShopApiResponse<Shop>>(
      `/Shops/${shopId}`
    )
    return response.data.result
  },

  // Delete shop
  deleteShop: async (shopId: string) => {
    const response = await shopApi.delete<ShopApiResponse<boolean>>(
      `/Shops/${shopId}`
    )
    return response.data.result
  },

  // Get pending shops for approval
  getPendingShops: async (params: { pageNumber: number; pageSize: number }) => {
    const queryString = parseQueryParams(params)
    const response = await shopApi.get<ShopApiResponse<PendingShop[]>>(
      `/v1/shop-approvals/pending?${queryString}`
    )
    return response.data
  },

  // Get shop details for approval
  getShopForApproval: async (shopId: string) => {
    const response = await shopApi.get<ShopApiResponse<PendingShop>>(
      `/v1/shop-approvals/${shopId}`
    )
    return response.data.result
  },

  // Approve or reject shop
  approveShop: async (shopId: string, data: ShopApprovalRequest) => {
    const response = await shopApi.post<ShopApiResponse<boolean>>(
      `/v1/shop-approvals/${shopId}/approve`,
      data
    )
    return response.data.result
  },
}
