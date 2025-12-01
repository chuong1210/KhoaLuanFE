// ============================================================================
// EXISTING PLATFORM ANALYTICS TYPES
// ============================================================================

export interface PlatformOverview {
  total_gmv: number
  total_platform_revenue: number
  total_platform_cost: number
  platform_profit: number
  total_orders: number
  total_shops: number
}

export interface RevenueTimeseries {
  date: string
  total_gmv: number
  platform_revenue: number
  platform_cost: number
  platform_profit: number
}

export interface Transaction {
  id: string
  transaction_code: string
  order_id: {
    String: string
    Valid: boolean
  }
  payment_method_id: string
  amount: string
  currency: string
  type: 'PAYMENT' | 'REFUND' | 'SETTLEMENT'
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  gateway_transaction_id: {
    String: string
    Valid: boolean
  }
  notes: {
    String: string
    Valid: boolean
  }
  created_at: string
  processed_at: {
    Time: string
    Valid: boolean
  }
}

export interface Settlement {
  id: string
  shop_order_id: string
  order_transaction_id: string
  status: 'PENDING_SETTLEMENT' | 'SETTLED' | 'FAILED'
  order_subtotal: string
  shop_funded_product_discount: string
  site_funded_product_discount: string
  shop_voucher_discount: string
  shop_shipping_discount: string
  shipping_fee: string
  commission_fee: string
  net_settled_amount: string
  order_completed_at: {
    Time: string
    Valid: boolean
  }
  settled_at: {
    Time: string
    Valid: boolean
  }
}

export interface Ledger {
  id: string
  owner_id: string
  owner_type: 'PLATFORM' | 'SHOP'
  balance: string
  pending_balance: string
  created_at: string
  updated_at: string
}

export interface ShopAnalytics {
  shop_id: string
  total_gmv: number
  total_orders: number
}

export interface ShopDetailAnalytics {
  overview: {
    total_gmv: number
    total_net_revenue: number
    total_orders: number
    processing_orders: number
    wallet_balance: number
    pending_balance: number
  }
  wallet: {
    balance: number
    pending_balance: number
    total_settled_revenue: number
    total_funds_held: number
    total_withdrawn: number
  }
}

export interface VoucherPerformance {
  usage_history_stats: {
    total_usage_count: number
    total_discount_value: number
  }
  platform_cost_stats: {
    total_order_voucher_cost: number
    total_promotion_cost: number
    total_shipping_discount_cost: number
    total_product_subsidy_cost: number
  }
  total_voucher_cost: number
}

export interface AnalyticsSearchParams {
  start_date?: string
  end_date?: string
  shop_id?: string
  user_id?: string
  status?: string
  type?: string
  limit?: number
  offset?: number
}

// ============================================================================
// AI RECOMMENDATION ANALYTICS TYPES
// ============================================================================

/**
 * Tổng quan metrics của hệ thống gợi ý AI
 * Dùng cho API: GET /api/analytics/dashboard
 */
export interface AIAnalyticsSummary {
  /** Tổng số lần sản phẩm được hiển thị từ hệ thống gợi ý */
  total_impressions: number
  
  /** Tổng số lần người dùng click vào sản phẩm được gợi ý */
  total_clicks: number
  
  /** Tổng số đơn hàng được tạo từ các sản phẩm gợi ý */
  total_orders: number
  
  /** Tổng doanh thu từ các đơn hàng qua hệ thống gợi ý (VND) */
  total_revenue: number
  
  /** Click-Through Rate: (total_clicks / total_impressions) * 100 */
  ctr: number
  
  /** Conversion Rate: (total_orders / total_clicks) * 100 */
  conversion_rate: number
}

/**
 * Dữ liệu biểu đồ xu hướng theo ngày
 * Dùng để vẽ line chart hoặc bar chart
 */
export interface AITrendData {
  /** Ngày theo định dạng YYYY-MM-DD */
  date: string
  
  /** Số lượt hiển thị trong ngày */
  impressions: number
  
  /** Số lượt click trong ngày */
  clicks: number
  
  /** Số đơn hàng trong ngày */
  orders: number
  
  /** Doanh thu trong ngày (VND) */
  revenue: number
}

/**
 * Hiệu quả của từng thuật toán gợi ý
 * Dùng để so sánh A/B Testing
 */
export interface AIAlgoPerformance {
  /** 
   * Loại thuật toán:
   * - "personalized": Gợi ý cá nhân hóa (Collaborative Filtering)
   * - "similar": Sản phẩm tương tự (Content-based)
   * - "trending": Xu hướng hot (Trending)
   * - "collaborative": Lọc cộng tác
   * - "content_based": Dựa trên nội dung
   */
  rec_type: 'personalized' | 'similar' | 'trending' | 'collaborative' | 'content_based'
  
  /** Số lượt click của thuật toán này */
  clicks: number
  
  /** Doanh thu tạo ra từ thuật toán này (VND) */
  revenue: number
}

/**
 * Response chính từ API Dashboard
 * GET /api/analytics/dashboard?days=30
 */
export interface AIDashboardResponse {
  /** Trạng thái thành công của request */
  success: boolean
  
  /** Mô tả khoảng thời gian (VD: "Last 30 days") */
  period: string
  
  /** Metrics tổng quan */
  summary: AIAnalyticsSummary
  
  /** Dữ liệu biểu đồ theo ngày */
  trend_chart: AITrendData[]
  
  /** Hiệu quả từng thuật toán */
  algorithm_performance: AIAlgoPerformance[]
}

/**
 * Chi tiết hiệu quả của một thuật toán cụ thể
 * Dùng cho API: GET /api/analytics/performance
 */
export interface AIAlgorithmStats {
  /** Tên thuật toán */
  algorithm: string
  
  /** Tổng số impressions */
  impressions: number
  
  /** Tổng số clicks */
  clicks: number
  
  /** Tổng số orders */
  orders: number
  
  /** Tổng doanh thu (VND) */
  revenue: number
  
  /** Click-Through Rate (%) */
  ctr: number
  
  /** Conversion Rate (%) */
  conversion_rate: number
}

/**
 * Dữ liệu biểu đồ so sánh thuật toán theo thời gian
 */
export interface AIAlgorithmTrendData {
  /** Ngày theo định dạng YYYY-MM-DD */
  date: string
  
  /** Doanh thu từ thuật toán "personalized" trong ngày */
  personalized: number
  
  /** Doanh thu từ thuật toán "similar" trong ngày */
  similar: number
  
  /** Doanh thu từ thuật toán "trending" trong ngày */
  trending: number
  
  /** Có thể có thêm các thuật toán khác */
  [key: string]: number | string
}

/**
 * Response từ API Performance
 * GET /api/analytics/performance?start_date=...&end_date=...
 */
export interface AIPerformanceResponse {
  /** Trạng thái thành công */
  success: boolean
  
  /** Tổng quan tất cả thuật toán cộng lại */
  summary: AIAnalyticsSummary
  
  /** Chi tiết từng thuật toán */
  by_algorithm: AIAlgorithmStats[]
  
  /** Dữ liệu biểu đồ so sánh theo thời gian */
  trend_chart: AIAlgorithmTrendData[]
}

/**
 * Trạng thái của một component trong hệ thống
 */
export type ComponentHealth = 'healthy' | 'degraded' | 'unhealthy'

/**
 * Response từ Health Check API
 * GET /health
 */
export interface AIHealthResponse {
  /** 
   * Trạng thái tổng thể:
   * - "healthy": Tất cả component hoạt động tốt
   * - "degraded": Một số component có vấn đề nhưng hệ thống vẫn chạy
   */
  status: 'healthy' | 'degraded'
  
  /** Trạng thái chi tiết của từng component */
  components: {
    /** Trạng thái kết nối Database (PostgreSQL) */
    database: ComponentHealth
    
    /** Trạng thái kết nối Redis Cache */
    redis: ComponentHealth
  }
  
  /** Thời gian kiểm tra (ISO string) - optional */
  timestamp?: string
  
  /** Thông tin phiên bản - optional */
  version?: string
}

/**
 * Query parameters cho API Performance
 */
export interface AIPerformanceParams {
  /** Số ngày gần nhất (VD: 7, 30, 90) */
  days?: number
  
  /** Ngày bắt đầu (YYYY-MM-DD) */
  start_date?: string
  
  /** Ngày kết thúc (YYYY-MM-DD) */
  end_date?: string
  
  /** Tháng (1-12) */
  month?: number
  
  /** Năm (YYYY) */
  year?: number
}

/**
 * Format của file export
 */
export type ExportFormat = 'csv' | 'pdf'

/**
 * Query parameters cho API Export
 */
export interface AIExportParams {
  /** Số ngày gần nhất */
  days: number
  
  /** Định dạng file xuất */
  format: ExportFormat
}

// ============================================================================
// UI SPECIFIC TYPES
// ============================================================================

/**
 * Props cho MetricCard component
 */
export interface MetricCardProps {
  title: string
  value: string | number
  subValue?: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'indigo'
  isLoading?: boolean
}

/**
 * Props cho AIHealthStatus component
 */
export interface AIHealthStatusProps {
  /** Tự động refresh interval (ms) */
  refreshInterval?: number
  
  /** Callback khi status thay đổi */
  onStatusChange?: (status: 'healthy' | 'degraded') => void
}

/**
 * Props cho AIAlgorithmComparison component
 */
export interface AIAlgorithmComparisonProps {
  /** Default date range */
  defaultDateRange?: '7days' | '30days' | '90days'
  
  /** Hiển thị export button */
  showExport?: boolean
}

/**
 * Sort configuration cho bảng so sánh thuật toán
 */
export interface AlgorithmSortConfig {
  /** Column để sort */
  column: keyof AIAlgorithmStats
  
  /** Thứ tự sort */
  order: 'asc' | 'desc'
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Màu sắc cho từng thuật toán (dùng trong charts)
 */
export const ALGORITHM_COLORS: Record<string, string> = {
  personalized: '#FF6A00',
  similar: '#3B82F6',
  trending: '#22C55E',
  collaborative: '#A855F7',
  content_based: '#F59E0B',
}

/**
 * Tên hiển thị của thuật toán (tiếng Việt)
 */
export const ALGORITHM_NAMES: Record<string, string> = {
  personalized: 'Gợi ý Cá nhân hóa',
  similar: 'Sản phẩm Tương tự',
  trending: 'Xu hướng Hot',
  collaborative: 'Lọc Cộng tác',
  content_based: 'Dựa trên Nội dung',
}

/**
 * Status badge variants
 */
export const HEALTH_STATUS_VARIANTS: Record<ComponentHealth, string> = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'destructive',
}


// --- Agent Analytics Types ---
export interface AgentOverview {
  total_sessions: number;
  total_user_messages: number;
  total_agent_messages: number;
}

export interface MessageVolume {
  hour_of_day: number;
  message_count: number;
}

export interface TopUser {
  user_id: string;
  message_count: number;
}

export interface TopicStat {
  topic: string;
  count: number;
  percentage: number;
}

export interface PurchaseIntentStat {
  purchase_intent: string; // NONE, HIGH, MEDIUM, LOW
  count: number;
}

export interface TopCategory {
  category: string; // Sửa lại key dựa trên ngữ cảnh, dù response mẫu ghi purchase_intent
  count: number;
}

// --- Chatbox Types ---
export interface ChatboxOverview {
  total_ratings: number;
  like_count: number;
  dislike_count: number;

  satisfaction_rate: number;
}

export interface ChatboxTimeSeries {
  report_date: string;
  total_rates: number;
  like_count: number;
  satisfaction_rate: number;
}

export interface ChatboxStatsResponse {
  overview: ChatboxOverview;
  time_series: ChatboxTimeSeries[];
}

export interface ChatboxReview {
  id: number;
  event_id: string;
  session_id: string;
  rating: number; // 1 or -1
  user_prompt: string;
  agent_response: string;
  created_at: string;
  user_id?: string;
}

// --- Customer Support Types ---
export interface SupportCategoryBreakdown {
  category: string; // BUG, COMPLAINT, SUGGESTION, etc.
  feedback_count: number;
}

export interface SupportOverview {
  total_feedbacks: number;
  bug_count: number;
  complaint_count: number;
  suggestion_count: number;
  unique_users: number;
}

export interface SupportStatsResponse {
  category_breakdown: SupportCategoryBreakdown[];
  overview: SupportOverview;
}

export interface SupportFeedback {
  id: string;
  user_id?: string;
  email: string;
  phone: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Common Params
export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface DateRangeParams {
  start_date: string;
  end_date: string;
}