import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analyticsApi'
import type { 
  AnalyticsSearchParams,
  AIPerformanceParams 
} from '../types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  
  // Platform Analytics Keys
  overview: (params: { start_date: string; end_date: string }) =>
    [...analyticsKeys.all, 'overview', params] as const,
  revenue: (params: { start_date: string; end_date: string }) =>
    [...analyticsKeys.all, 'revenue', params] as const,
  transactions: (params: AnalyticsSearchParams) =>
    [...analyticsKeys.all, 'transactions', params] as const,
  settlements: (params: AnalyticsSearchParams) =>
    [...analyticsKeys.all, 'settlements', params] as const,
  ledgers: (params: { owner_type?: string; limit?: number; offset?: number }) =>
    [...analyticsKeys.all, 'ledgers', params] as const,
  shops: (params: { limit?: number; offset?: number }) =>
    [...analyticsKeys.all, 'shops', params] as const,
  shopDetail: (shopId: string, params: { start_date: string; end_date: string }) =>
    [...analyticsKeys.all, 'shopDetail', shopId, params] as const,
  voucherPerformance: (params: { start_date: string; end_date: string }) =>
    [...analyticsKeys.all, 'voucherPerformance', params] as const,
    
  // AI Analytics Keys
  aiDashboard: (days: string) => 
    [...analyticsKeys.all, 'ai', 'dashboard', days] as const,
  aiPerformance: (params: AIPerformanceParams) =>
    [...analyticsKeys.all, 'ai', 'performance', params] as const,
  aiHealth: () => 
    [...analyticsKeys.all, 'ai', 'health'] as const,

   // Agent Keys
  agentOverview: (params: any) => [...analyticsKeys.all, 'agent', 'overview', params] as const,
  agentVolume: (params: any) => [...analyticsKeys.all, 'agent', 'volume', params] as const,
  agentTopUsers: (limit: number) => [...analyticsKeys.all, 'agent', 'topUsers', limit] as const,
  agentTopics: (params: any) => [...analyticsKeys.all, 'agent', 'topics', params] as const,
  agentIntent: (params: any) => [...analyticsKeys.all, 'agent', 'intent', params] as const,
  agentCategories: (params: any) => [...analyticsKeys.all, 'agent', 'categories', params] as const,

  // Chatbox Keys
  chatboxStats: (params: any) => [...analyticsKeys.all, 'chatbox', 'stats', params] as const,
  chatboxReviews: (params: any) => [...analyticsKeys.all, 'chatbox', 'reviews', params] as const,

  // Support Keys
  supportStats: (params: any) => [...analyticsKeys.all, 'support', 'stats', params] as const,
  supportFeedbacks: (params: any) => [...analyticsKeys.all, 'support', 'feedbacks', params] as const,
}

// ============================================================================
// PLATFORM ANALYTICS HOOKS
// ============================================================================

/**
 * Hook để lấy tổng quan platform (GMV, Orders, Revenue, Profit)
 * @param params - start_date và end_date
 * @returns Platform overview data
 */
export function usePlatformOverview(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsService.getPlatformOverview(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy dữ liệu timeseries doanh thu
 * @param params - start_date và end_date
 * @returns Revenue data theo ngày
 */
export function useRevenueTimeseries(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenueTimeseries(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook để lấy danh sách transactions
 * @param params - Search/filter parameters
 * @returns Transaction list
 */
export function useTransactions(params: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.transactions(params),
    queryFn: () => analyticsService.getTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để lấy danh sách settlements
 * @param params - Search/filter parameters
 * @returns Settlement list
 */
export function useSettlements(params: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.settlements(params),
    queryFn: () => analyticsService.getSettlements(params),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook để lấy danh sách ledgers
 * @param params - owner_type, limit, offset
 * @returns Ledger list
 */
export function useLedgers(params: { owner_type?: string; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: analyticsKeys.ledgers(params),
    queryFn: () => analyticsService.getLedgers(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook để lấy danh sách shops với analytics
 * @param params - limit và offset
 * @returns Shop analytics list
 */
export function usePlatformShops(params: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: analyticsKeys.shops(params),
    queryFn: () => analyticsService.getPlatformShops(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook để lấy chi tiết analytics của một shop
 * @param shopId - Shop ID
 * @param params - start_date và end_date
 * @returns Shop detail analytics
 */
export function useShopDetailAnalytics(
  shopId: string,
  params: { start_date: string; end_date: string }
) {
  return useQuery({
    queryKey: analyticsKeys.shopDetail(shopId, params),
    queryFn: () => analyticsService.getShopDetailAnalytics(shopId, params),
    enabled: !!shopId && !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook để lấy hiệu quả voucher
 * @param params - start_date và end_date
 * @returns Voucher performance data
 */
export function useVoucherPerformance(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.voucherPerformance(params),
    queryFn: () => analyticsService.getVoucherPerformance(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// AI ANALYTICS HOOKS
// ============================================================================

/**
 * Hook để lấy AI Dashboard statistics
 * @param dateRange - "7days" | "30days" | "90days"
 * @returns AI dashboard data (impressions, clicks, orders, revenue, CTR, CVR)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useAIDashboard("30days")
 * console.log(data?.summary.total_revenue)
 * ```
 */
export function useAIDashboard(dateRange: string) {
  // Convert "30days" -> 30
  const daysNum = parseInt(dateRange.replace('days', '')) || 30
  
  return useQuery({
    queryKey: analyticsKeys.aiDashboard(dateRange),
    queryFn: () => analyticsService.getAIDashboardStats(daysNum),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
  })
}

/**
 * Hook để lấy AI Performance (A/B Testing)
 * So sánh hiệu quả các thuật toán gợi ý
 * 
 * @param params - Có thể truyền days, start_date/end_date, month/year
 * @returns Performance data by algorithm
 * 
 * @example
 * ```tsx
 * // Option 1: Dùng days
 * const { data } = useAIPerformance({ days: 30 })
 * 
 * // Option 2: Dùng date range
 * const { data } = useAIPerformance({ 
 *   start_date: "2024-01-01",
 *   end_date: "2024-01-31"
 * })
 * ```
 */
export function useAIPerformance(params: AIPerformanceParams) {
  return useQuery({
    queryKey: analyticsKeys.aiPerformance(params),
    queryFn: () => analyticsService.getAIPerformance(params),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook để kiểm tra health status của hệ thống AI
 * Auto-refresh mỗi 30 giây
 * 
 * @param options - Cấu hình refetch interval
 * @returns Health status (healthy/degraded) và components status
 * 
 * @example
 * ```tsx
 * const { data, isError } = useAIHealth()
 * 
 * if (data?.status === "healthy") {
 *   console.log("System is running well")
 * }
 * ```
 */
export function useAIHealth(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: analyticsKeys.aiHealth(),
    queryFn: () => analyticsService.getAIHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options?.refetchInterval || 30 * 1000, // Auto-refresh every 30s
    refetchIntervalInBackground: true, // Refresh even when tab is not active
    retry: 3, // Retry 3 times if failed
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook tổng hợp để lấy tất cả AI analytics data
 * Useful khi cần hiển thị toàn bộ metrics trong một page
 * 
 * @param dateRange - "7days" | "30days" | "90days"
 * @returns Object chứa tất cả AI data và loading states
 * 
 * @example
 * ```tsx
 * const { dashboard, performance, health, isLoading } = useAIAnalyticsFull("30days")
 * ```
 */
export function useAIAnalyticsFull(dateRange: string) {
  const daysNum = parseInt(dateRange.replace('days', '')) || 30
  
  const dashboard = useAIDashboard(dateRange)
  const performance = useAIPerformance({ days: daysNum })
  const health = useAIHealth()
  
  return {
    dashboard: dashboard.data,
    performance: performance.data,
    health: health.data,
    isLoading: dashboard.isLoading || performance.isLoading || health.isLoading,
    isError: dashboard.isError || performance.isError || health.isError,
    refetch: () => {
      dashboard.refetch()
      performance.refetch()
      health.refetch()
    }
  }
}

/**
 * Hook để prefetch AI data (optimistic loading)
 * Gọi trước khi user navigate đến AI analytics page
 * 
 * @example
 * ```tsx
 * const prefetch = usePrefetchAIAnalytics()
 * 
 * <Link 
 *   href="/analytics/ai"
 *   onMouseEnter={() => prefetch("30days")}
 * >
 *   AI Analytics
 * </Link>
 * ```
 */
export function usePrefetchAIAnalytics() {
  const queryClient = useQueryClient()
  
  return (dateRange: string = "30days") => {
    const daysNum = parseInt(dateRange.replace('days', '')) || 30
    
    // Prefetch dashboard
    queryClient.prefetchQuery({
      queryKey: analyticsKeys.aiDashboard(dateRange),
      queryFn: () => analyticsService.getAIDashboardStats(daysNum),
    })
    
    // Prefetch performance
    queryClient.prefetchQuery({
      queryKey: analyticsKeys.aiPerformance({ days: daysNum }),
      queryFn: () => analyticsService.getAIPerformance({ days: daysNum }),
    })
    
    // Prefetch health
    queryClient.prefetchQuery({
      queryKey: analyticsKeys.aiHealth(),
      queryFn: () => analyticsService.getAIHealth(),
    })
  }
}

// ============================================================================
// MUTATION HOOKS (for future use)
// ============================================================================

/**
 * Hook để export AI report (CSV/PDF)
 * 
 * @example
 * ```tsx
 * const exportMutation = useExportAIReport()
 * 
 * <Button 
 *   onClick={() => exportMutation.mutate({ days: 30, format: "csv" })}
 *   disabled={exportMutation.isPending}
 * >
 *   Export CSV
 * </Button>
 * ```
 */
export function useExportAIReport() {
  return useMutation({
    mutationFn: ({ days, format }: { days: number; format: 'csv' | 'pdf' }) =>
      analyticsService.exportAIReport(days, format),
    onSuccess: () => {
      // Toast notification handled in service
    },
    onError: (error) => {
      console.error('Export failed:', error)
    }
  })
}

// --- Agent Hooks ---
export function useAgentAnalytics(params: { start_date: string; end_date: string }) {
  const overview = useQuery({
    queryKey: analyticsKeys.agentOverview(params),
    queryFn: () => analyticsService.getAgentDashboard(params),
  });
  
  const volume = useQuery({
    queryKey: analyticsKeys.agentVolume(params),
    queryFn: () => analyticsService.getMessageVolume(params),
  });

  const topics = useQuery({
    queryKey: analyticsKeys.agentTopics(params),
    queryFn: () => analyticsService.getTopicStats(params),
  });

  const intent = useQuery({
    queryKey: analyticsKeys.agentIntent(params),
    queryFn: () => analyticsService.getPurchaseIntentStats(params),
  });

  return { overview, volume, topics, intent };
}

export function useAgentTopUsers(limit: number = 10) {
  return useQuery({
    queryKey: analyticsKeys.agentTopUsers(limit),
    queryFn: () => analyticsService.getTopActiveUsers(limit),
  });
}

// --- Chatbox Hooks ---
export function useChatboxAnalytics(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.chatboxStats(params),
    queryFn: () => analyticsService.getChatboxStatistics(params),
  });
}

export function useChatboxReviews(params: { page: number; page_size: number; rating?: number }) {
  return useQuery({
    queryKey: analyticsKeys.chatboxReviews(params),
    queryFn: () => analyticsService.getChatboxReviews(params),
    placeholderData: (previousData) => previousData,
  });
}

// --- Support Hooks ---
export function useSupportAnalytics(params: { start_date: string; end_date: string; category?: string }) {
  return useQuery({
    queryKey: analyticsKeys.supportStats(params),
    queryFn: () => analyticsService.getSupportStatistics(params),
  });
}

export function useSupportFeedbacks(params: { page: number; page_size: number; category?: string }) {
  return useQuery({
    queryKey: analyticsKeys.supportFeedbacks(params),
    queryFn: () => analyticsService.getSupportFeedbacks(params),
    placeholderData: (previousData) => previousData,
  });
}
// Import missing dependencies
import { useQueryClient, useMutation } from '@tanstack/react-query'