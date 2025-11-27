import { analyticsApi, ApiResponse } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type {
  PlatformOverview,
  RevenueTimeseries,
  Transaction,
  Settlement,
  Ledger,
  ShopAnalytics,
  ShopDetailAnalytics,
  VoucherPerformance,
  AnalyticsSearchParams,
} from '../types'
import { aiApi } from '@/lib/api'
import type { AIDashboardResponse } from '../types'
export const analyticsService = {
  // Platform Overview
  getPlatformOverview: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<PlatformOverview>>(
      `/platform/overview?${queryString}`
    )
    return response.data.result
  },

  // Revenue Timeseries
  getRevenueTimeseries: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<{ data: RevenueTimeseries[] }>>(
      `/platform/finance/revenue-timeseries?${queryString}`
    )
    return response.data.result.data
  },

  // List Platform Orders
  getPlatformOrders: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<{ orders: { ShopOrder: unknown }[] }>>(
      `/platform/orders?${queryString}`
    )
    return response.data.result.orders
  },

  // Get Enriched Platform Order
  getPlatformOrder: async (orderId: string) => {
    const response = await analyticsApi.get<ApiResponse<unknown>>(
      `/platform/orders/${orderId}`
    )
    return response.data.result
  },

  // List Platform Transactions
  getTransactions: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Transaction[]>>(
      `/platform/finance/transactions?${queryString}`
    )
    return response.data.result
  },

  // List Platform Settlements
  getSettlements: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Settlement[]>>(
      `/platform/finance/settlements?${queryString}`
    )
    return response.data.result
  },

  // List Platform Ledgers
  getLedgers: async (params: { owner_type?: string; limit?: number; offset?: number }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Ledger[]>>(
      `/platform/finance/ledgers?${queryString}`
    )
    return response.data.result
  },

  // List Platform Vouchers
  getPlatformVouchers: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<unknown[]>>(
      `/platform/vouchers?${queryString}`
    )
    return response.data.result
  },

  // Get Voucher Performance
  getVoucherPerformance: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<VoucherPerformance>>(
      `/platform/vouchers/performance?${queryString}`
    )
    return response.data.result
  },

  // List Platform Shops
  getPlatformShops: async (params: { limit?: number; offset?: number }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<ShopAnalytics[]>>(
      `/platform/shops?${queryString}`
    )
    return response.data.result
  },

  // Get Shop Detail Analytics
  getShopDetailAnalytics: async (shopId: string, params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<ShopDetailAnalytics>>(
      `/platform/shops/${shopId}/detail?${queryString}`
    )
    return response.data.result
  },


  // 1. Lấy dữ liệu Dashboard từ AI Service
  getAIDashboardStats: async (days: number = 30) => {
    const response = await aiApi.get<AIDashboardResponse>(`/api/analytics/dashboard?days=${days}`)
    return response.data
  },

  // 2. Xuất báo cáo (Download file)
  exportAIReport: async (days: number = 30, format: 'csv' | 'pdf' = 'csv') => {
    const response = await aiApi.get(`/api/analytics/export?days=${days}&format=${format}`, {
      responseType: 'blob', // Quan trọng: Để nhận file binary
    })
    
    // Tạo link download ảo
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Đặt tên file
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `recommendation_report_${days}days_${dateStr}.${format}`)
    
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

}
