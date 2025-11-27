import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analyticsApi'
import type { AnalyticsSearchParams } from '../types'

export const analyticsKeys = {
  all: ['analytics'] as const,
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
    aiDashboard: (days: string) => ['analytics', 'ai', days] as const,

}

export function useAIDashboard(days: string) {
  // Convert "30days" -> 30
  const daysNum = parseInt(days.replace('days', '')) || 30
  
  return useQuery({
    queryKey: analyticsKeys.aiDashboard(days),
    queryFn: () => analyticsService.getAIDashboardStats(daysNum),
  })
}
export function usePlatformOverview(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsService.getPlatformOverview(params),
    enabled: !!params.start_date && !!params.end_date,
  })
}

export function useRevenueTimeseries(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenueTimeseries(params),
    enabled: !!params.start_date && !!params.end_date,
  })
}

export function useTransactions(params: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.transactions(params),
    queryFn: () => analyticsService.getTransactions(params),
  })
}

export function useSettlements(params: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.settlements(params),
    queryFn: () => analyticsService.getSettlements(params),
  })
}

export function useLedgers(params: { owner_type?: string; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: analyticsKeys.ledgers(params),
    queryFn: () => analyticsService.getLedgers(params),
  })
}

export function usePlatformShops(params: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: analyticsKeys.shops(params),
    queryFn: () => analyticsService.getPlatformShops(params),
  })
}

export function useShopDetailAnalytics(
  shopId: string,
  params: { start_date: string; end_date: string }
) {
  return useQuery({
    queryKey: analyticsKeys.shopDetail(shopId, params),
    queryFn: () => analyticsService.getShopDetailAnalytics(shopId, params),
    enabled: !!shopId && !!params.start_date && !!params.end_date,
  })
}

export function useVoucherPerformance(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: analyticsKeys.voucherPerformance(params),
    queryFn: () => analyticsService.getVoucherPerformance(params),
    enabled: !!params.start_date && !!params.end_date,
  })
}
