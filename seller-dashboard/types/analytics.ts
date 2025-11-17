// types/analytics.ts
export interface ShopOverview {
  total_gmv: number;
  total_net_revenue: number;
  total_orders: number;
  processing_orders: number;
  wallet_balance: number;
  pending_balance: number;
}

export interface WalletSummary {
  balance: number;
  pending_balance: number;
  total_settled_revenue: number;
  total_funds_held: number;
  total_withdrawn: number;
}

export interface RevenueDataPoint {
  date: string;
  gmv: number;
  net_revenue: number;
  orders: number;
}

export interface ShopOrderListItem {
  ShopOrder: {
    id: string;
    shop_order_code: string;
    order_id: string;
    shop_id: string;
    status: string;
    subtotal: string;
    total_discount: string;
    total_amount: string;
    shop_voucher_code: { String: string; Valid: boolean };
    shop_voucher_discount: { String: string; Valid: boolean };
    shipping_fee: string;
    shipping_method: { String: string; Valid: boolean };
    tracking_code: { String: string; Valid: boolean };
    cancellation_reason: { String: string; Valid: boolean };
    created_at: string;
    updated_at: string;
    paid_at: { Time: string; Valid: boolean };
    processing_at: { Time: string; Valid: boolean };
    shipped_at: { Time: string; Valid: boolean };
    completed_at: { Time: string; Valid: boolean };
    cancelled_at: { Time: string; Valid: boolean };
  };
}

export interface VoucherUsageDetail {
  id: number;
  voucher_id: string;
  user_id: string;
  discount_amount: string;
  used_at: string;
}
