import { analyticsApi, ApiResponse, aiApi } from '@/lib/api'
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
  AIDashboardResponse,
  AIPerformanceResponse,
  AIHealthResponse,
  AIPerformanceParams,
  DateRangeParams,
  TopicStat,
  MessageVolume,
  AgentOverview,
  PurchaseIntentStat,
  TopCategory,
  ChatboxStatsResponse,
  PaginationParams,
  ChatboxReview,
  TopUser,
  SupportFeedback,
  SupportStatsResponse,
} from '../types'

export const analyticsService = {
  // ============================================================================
  // PLATFORM ANALYTICS SERVICES
  // ============================================================================

  getAgentDashboard: async (params: DateRangeParams) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<AgentOverview>>(`/platform/agent-analytics/dashboard?${queryString}`);
    return response.data.result;
  },

  getMessageVolume: async (params: DateRangeParams) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<MessageVolume[]>>(`/platform/agent-analytics/message-volume?${queryString}`);
    return response.data.result;
  },

  getTopActiveUsers: async (limit: number = 10) => {
    const response = await analyticsApi.get<ApiResponse<{ data: TopUser[], limit: number }>>(`/platform/agent-analytics/top-users?limit=${limit}`);
    return response.data.result.data;
  },

  getTopicStats: async (params: DateRangeParams) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<TopicStat[]>>(`/platform/agent-analytics/topics?${queryString}`);
    return response.data.result;
  },

  getPurchaseIntentStats: async (params: DateRangeParams) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<PurchaseIntentStat[]>>(`/platform/agent-analytics/purchase-intent?${queryString}`);
    return response.data.result;
  },

  getTopCategories: async (params: DateRangeParams & { limit?: number }) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<TopCategory[]>>(`/platform/agent-analytics/top-categories?${queryString}`);
    return response.data.result;
  },

  // ============================================================================
  // CHATBOX STATISTICS (Group 2)
  // ============================================================================

  getChatboxStatistics: async (params: DateRangeParams) => {
    const queryString = parseQueryParams(params);
    // API document placeholders {{startDate}} handled by standard params
    const response = await analyticsApi.get<ApiResponse<ChatboxStatsResponse>>(`/platform/chatbox/statistics?${queryString}`);
    return response.data.result; // Note: Doc says structure is directly inside response, check if it's inside 'result' key or root. Assuming 'result' based on other APIs.
    // Nếu API trả về trực tiếp overview/time_series ở root data, hãy sửa lại thành return response.data;
  },

  getChatboxReviews: async (params: PaginationParams & { rating?: number }) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<{ data: ChatboxReview[], page: number, page_size: number }>>(`/platform/chatbox/reviews?${queryString}`);
    return response.data.result;
  },

  // ============================================================================
  // CUSTOMER SUPPORT (Group 3)
  // ============================================================================

  getSupportStatistics: async (params: DateRangeParams & { category?: string }) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<SupportStatsResponse>>(`/platform/customer-support/statistics?${queryString}`);
    return response.data.result;
  },

  getSupportFeedbacks: async (params: PaginationParams & { category?: string }) => {
    const queryString = parseQueryParams(params);
    const response = await analyticsApi.get<ApiResponse<{ data: SupportFeedback[], page: number, page_size: number }>>(`/platform/customer-support/feedbacks?${queryString}`);
    return response.data.result;
  },

  /**
   * Lấy tổng quan platform
   * @param params - start_date và end_date
   * @returns Platform overview metrics
   */
  getPlatformOverview: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<PlatformOverview>>(
      `/platform/overview?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy revenue timeseries data
   * @param params - start_date và end_date
   * @returns Revenue data theo ngày
   */
  getRevenueTimeseries: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<{ data: RevenueTimeseries[] }>>(
      `/platform/finance/revenue-timeseries?${queryString}`
    )
    return response.data.result.data
  },

  /**
   * Lấy danh sách platform orders
   * @param params - Search/filter parameters
   * @returns Order list
   */
  getPlatformOrders: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<{ orders: { ShopOrder: unknown }[] }>>(
      `/platform/orders?${queryString}`
    )
    return response.data.result.orders
  },

  /**
   * Lấy chi tiết một order
   * @param orderId - Order ID
   * @returns Enriched order data
   */
  getPlatformOrder: async (orderId: string) => {
    const response = await analyticsApi.get<ApiResponse<unknown>>(
      `/platform/orders/${orderId}`
    )
    return response.data.result
  },

  /**
   * Lấy danh sách transactions
   * @param params - Search/filter parameters
   * @returns Transaction list
   */
  getTransactions: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Transaction[]>>(
      `/platform/finance/transactions?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy danh sách settlements
   * @param params - Search/filter parameters
   * @returns Settlement list
   */
  getSettlements: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Settlement[]>>(
      `/platform/finance/settlements?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy danh sách ledgers
   * @param params - owner_type, limit, offset
   * @returns Ledger list
   */
  getLedgers: async (params: { owner_type?: string; limit?: number; offset?: number }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<Ledger[]>>(
      `/platform/finance/ledgers?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy danh sách platform vouchers
   * @param params - Search/filter parameters
   * @returns Voucher list
   */
  getPlatformVouchers: async (params: AnalyticsSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<unknown[]>>(
      `/platform/vouchers?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy voucher performance metrics
   * @param params - start_date và end_date
   * @returns Voucher performance data
   */
  getVoucherPerformance: async (params: { start_date: string; end_date: string }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<VoucherPerformance>>(
      `/platform/vouchers/performance?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy danh sách shops với analytics
   * @param params - limit và offset
   * @returns Shop analytics list
   */
  getPlatformShops: async (params: { limit?: number; offset?: number }) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<ShopAnalytics[]>>(
      `/platform/shops?${queryString}`
    )
    return response.data.result
  },

  /**
   * Lấy chi tiết analytics của một shop
   * @param shopId - Shop ID
   * @param params - start_date và end_date
   * @returns Shop detail analytics
   */
  getShopDetailAnalytics: async (
    shopId: string, 
    params: { start_date: string; end_date: string }
  ) => {
    const queryString = parseQueryParams(params)
    const response = await analyticsApi.get<ApiResponse<ShopDetailAnalytics>>(
      `/platform/shops/${shopId}/detail?${queryString}`
    )
    return response.data.result
  },

  // ============================================================================
  // AI RECOMMENDATION ANALYTICS SERVICES
  // ============================================================================

  /**
   * Lấy AI Dashboard Statistics
   * Endpoint: GET /api/analytics/dashboard
   * 
   * @param days - Số ngày gần nhất (mặc định 30)
   * @returns Dashboard metrics (impressions, clicks, orders, revenue, CTR, CVR)
   * 
   * @example
   * ```ts
   * const data = await analyticsService.getAIDashboardStats(30)
   * console.log(data.summary.total_revenue)
   * ```
   */
  getAIDashboardStats: async (days: number = 30): Promise<AIDashboardResponse> => {
    const response = await aiApi.get<AIDashboardResponse>(
      `/api/analytics/dashboard?days=${days}`
    )
    return response.data
  },

  /**
   * Lấy AI Performance (A/B Testing)
   * Endpoint: GET /api/analytics/performance
   * 
   * @param params - Có thể truyền days hoặc start_date/end_date hoặc month/year
   * @returns Performance data by algorithm
   * 
   * @example
   * ```ts
   * // Cách 1: Dùng days
   * const data = await analyticsService.getAIPerformance({ days: 30 })
   * 
   * // Cách 2: Dùng date range
   * const data = await analyticsService.getAIPerformance({
   *   start_date: "2024-01-01",
   *   end_date: "2024-01-31"
   * })
   * 
   * // Cách 3: Dùng month/year
   * const data = await analyticsService.getAIPerformance({
   *   month: 1,
   *   year: 2024
   * })
   * ```
   */
  getAIPerformance: async (params: AIPerformanceParams): Promise<AIPerformanceResponse> => {
    const queryString = parseQueryParams(params)
    const response = await aiApi.get<AIPerformanceResponse>(
      `/api/analytics/performance?${queryString}`
    )
    return response.data
  },

  /**
   * Kiểm tra Health Status của hệ thống AI
   * Endpoint: GET /health
   * 
   * @returns Health status và component statuses
   * 
   * @example
   * ```ts
   * const health = await analyticsService.getAIHealth()
   * 
   * if (health.status === "healthy") {
   *   console.log("All systems operational")
   * } else if (health.status === "degraded") {
   *   console.log("Some issues detected:", health.components)
   * }
   * ```
   */
  getAIHealth: async (): Promise<AIHealthResponse> => {
    const response = await aiApi.get<AIHealthResponse>('/health')
    return response.data
  },

  /**
   * Xuất báo cáo AI (CSV hoặc PDF)
   * Endpoint: GET /api/analytics/export
   * 
   * @param days - Số ngày gần nhất
   * @param format - Định dạng file ('csv' hoặc 'pdf')
   * @returns Tự động download file về máy
   * 
   * @example
   * ```ts
   * // Export CSV
   * await analyticsService.exportAIReport(30, 'csv')
   * 
   * // Export PDF
   * await analyticsService.exportAIReport(30, 'pdf')
   * ```
   */
  exportAIReport: async (days: number = 30, format: 'csv' | 'pdf' = 'csv'): Promise<void> => {
    try {
      const response = await aiApi.get(
        `/api/analytics/export?days=${days}&format=${format}`,
        {
          responseType: 'blob', // CRITICAL: Để nhận binary data
        }
      )
      
      // Tạo URL từ blob
      const blob = new Blob([response.data], {
        type: format === 'csv' 
          ? 'text/csv' 
          : 'application/pdf'
      })
      const url = window.URL.createObjectURL(blob)
      
      // Tạo link download ảo
      const link = document.createElement('a')
      link.href = url
      
      // Đặt tên file với timestamp
      const dateStr = new Date().toISOString().split('T')[0]
      const fileName = `ai_recommendation_report_${days}days_${dateStr}.${format}`
      link.setAttribute('download', fileName)
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
      
      console.log(`✅ Downloaded: ${fileName}`)
    } catch (error) {
      console.error('❌ Export failed:', error)
      throw error
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Lấy tất cả AI analytics data trong một request (batch)
   * Hữu ích khi cần load toàn bộ data cho dashboard
   * 
   * @param days - Số ngày gần nhất
   * @returns Object chứa dashboard, performance, và health data
   * 
   * @example
   * ```ts
   * const { dashboard, performance, health } = await analyticsService.getAIAnalyticsFull(30)
   * ```
   */
  getAIAnalyticsFull: async (days: number = 30) => {
    try {
      const [dashboard, performance, health] = await Promise.all([
        analyticsService.getAIDashboardStats(days),
        analyticsService.getAIPerformance({ days }),
        analyticsService.getAIHealth(),
      ])
      
      return {
        dashboard,
        performance,
        health,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Failed to fetch AI analytics:', error)
      throw error
    }
  },

  /**
   * Kiểm tra xem AI service có đang hoạt động không
   * Đơn giản hơn getAIHealth(), chỉ trả về boolean
   * 
   * @returns true nếu service healthy, false nếu có vấn đề
   */
  isAIServiceHealthy: async (): Promise<boolean> => {
    try {
      const health = await analyticsService.getAIHealth()
      return health.status === 'healthy'
    } catch (error) {
      return false
    }
  },

  /**
   * Lấy algorithm performance summary (chỉ top metrics)
   * Lightweight version của getAIPerformance
   * 
   * @param days - Số ngày gần nhất
   * @returns Chỉ trả về summary, không có trend chart
   */
  getAIPerformanceSummary: async (days: number = 30) => {
    const performance = await analyticsService.getAIPerformance({ days })
    return {
      summary: performance.summary,
      topAlgorithm: performance.by_algorithm[0], // Algorithm có doanh thu cao nhất
      totalAlgorithms: performance.by_algorithm.length,
    }
  },

  /**
   * Export với custom filename
   * 
   * @param days - Số ngày gần nhất
   * @param format - Định dạng file
   * @param customName - Tên file tùy chỉnh (không bao gồm extension)
   */
  exportAIReportCustom: async (
    days: number, 
    format: 'csv' | 'pdf',
    customName?: string
  ): Promise<void> => {
    try {
      const response = await aiApi.get(
        `/api/analytics/export?days=${days}&format=${format}`,
        { responseType: 'blob' }
      )
      
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const dateStr = new Date().toISOString().split('T')[0]
      const fileName = customName 
        ? `${customName}_${dateStr}.${format}`
        : `ai_report_${days}days_${dateStr}.${format}`
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format error message từ API response
 */
export function formatAIError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Validate date range parameters
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }
  
  return start <= end
}

/**
 * Calculate days between two dates
 */
export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Export type guard để check xem response có valid không
 */
export function isValidAIDashboardResponse(data: unknown): data is AIDashboardResponse {
  if (typeof data !== 'object' || data === null) return false
  
  const response = data as AIDashboardResponse
  return (
    response.success === true &&
    typeof response.summary === 'object' &&
    Array.isArray(response.trend_chart) &&
    Array.isArray(response.algorithm_performance)
  )
}

export function isValidAIHealthResponse(data: unknown): data is AIHealthResponse {
  if (typeof data !== 'object' || data === null) return false
  
  const response = data as AIHealthResponse
  return (
    (response.status === 'healthy' || response.status === 'degraded') &&
    typeof response.components === 'object' &&
    response.components !== null
  )
}

