import axiosInstance from "@/lib/api/axios-instance";
import type {
  ShopAnalyticsResponse,
  ProductAnalyticsResponse,
  AnalyticsFilters,
} from "@/types/shop-analytics";

const ANALYTICS_BASE_URL = "http://localhost:5000/api/analytics";

export const shopAnalyticsService = {
  /**
   * Get shop performance analytics
   */
  getShopAnalytics: async (
    shopId: string,
    filters?: AnalyticsFilters
  ): Promise<ShopAnalyticsResponse> => {
    const params = new URLSearchParams();

    if (filters?.days) params.append("days", String(filters.days));
    if (filters?.month) params.append("month", filters.month);
    if (filters?.year) params.append("year", String(filters.year));
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = `${ANALYTICS_BASE_URL}/shop/${shopId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axiosInstance.get<ShopAnalyticsResponse>(url);
    return response.data;
  },

  /**
   * Get product performance analytics
   */
  getProductAnalytics: async (
    productId: string,
    filters?: AnalyticsFilters
  ): Promise<ProductAnalyticsResponse> => {
    const params = new URLSearchParams();

    if (filters?.days) params.append("days", String(filters.days));
    if (filters?.month) params.append("month", filters.month);
    if (filters?.year) params.append("year", String(filters.year));
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = `${ANALYTICS_BASE_URL}/product/${productId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axiosInstance.get<ProductAnalyticsResponse>(url);
    return response.data;
  },
};