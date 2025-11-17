
// services/analytics-service.ts
import axiosInstance from "@/lib/api/axios-instance";
import type {
  ShopOverview,
  WalletSummary,
  RevenueDataPoint,
  ShopOrderListItem,
  VoucherUsageDetail,
} from "@/types/analytics";

const ANALYTICS_API = "http://localhost:9004/v1/shop";

export const analyticsService = {
  // Get shop overview
  getShopOverview: async (startDate?: string, endDate?: string): Promise<ShopOverview> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await axiosInstance.get<{ result: ShopOverview }>(
      `${ANALYTICS_API}/overview?${params.toString()}`
    );
    return response.data.result;
  },

  // Get wallet summary
  getWalletSummary: async (): Promise<WalletSummary> => {
    const response = await axiosInstance.get<{ result: WalletSummary }>(
      `${ANALYTICS_API}/wallet/summary`
    );
    return response.data.result;
  },

  // Get shop orders list
  getShopOrders: async (
    status?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ShopOrderListItem[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const response = await axiosInstance.get<{ result: { orders: ShopOrderListItem[] } }>(
      `${ANALYTICS_API}/orders?${params.toString()}`
    );
    return response.data.result.orders;
  },

  // Get revenue timeseries
  getRevenueTimeseries: async (startDate?: string, endDate?: string): Promise<RevenueDataPoint[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await axiosInstance.get<{ result: RevenueDataPoint[] }>(
      `${ANALYTICS_API}/revenue/timeseries?${params.toString()}`
    );
    return response.data.result;
  },

  // Get voucher usage details
  getVoucherUsageDetails: async (
    voucherId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<VoucherUsageDetail[]> => {
    const params = new URLSearchParams();
    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const response = await axiosInstance.get<{ result: VoucherUsageDetail[] }>(
      `${ANALYTICS_API}/vouchers/${voucherId}/details?${params.toString()}`
    );
    return response.data.result;
  },
};