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
