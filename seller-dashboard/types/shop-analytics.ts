// Shop Analytics Types
export interface ShopAnalyticsPeriod {
  start: string;
  end: string;
}

export interface ShopAnalyticsSummary {
  views: number;
  total_clicks: number;
  add_to_carts: number;
  orders: number;
  search_clicks: number;
  revenue: number;
  conversion_rate: number;
}

export interface ShopAnalyticsTrendPoint {
  date: string;
  views: number;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  product_id: string;
  views: number;
  orders: number;
  revenue: number;
}

export interface ShopAnalyticsResponse {
  success: boolean;
  shop_id: string;
  period: ShopAnalyticsPeriod;
  summary: ShopAnalyticsSummary;
  trend_chart: ShopAnalyticsTrendPoint[];
  top_products: TopProduct[];
}

// Product Analytics Types
export interface ProductInfo {
  category_id: string;
  current_price: number;
  rating: number;
  total_views_30d: number;
}

export interface ProductAnalyticsSummary {
  views: number;
  total_clicks: number;
  add_to_carts: number;
  orders: number;
  search_clicks: number;
  revenue: number;
  ctr: number;
  cart_rate: number;
  conversion_rate: number;
}

export interface ProductAnalyticsTrendPoint {
  date: string;
  views: number;
  carts: number;
  orders: number;
  revenue: number;
}

export interface ProductAnalyticsResponse {
  success: boolean;
  product_id: string;
  info: ProductInfo;
  period: ShopAnalyticsPeriod;
  summary: ProductAnalyticsSummary;
  trend_chart: ProductAnalyticsTrendPoint[];
}

// Filter Types
export interface AnalyticsFilters {
  days?: number;
  month?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
}