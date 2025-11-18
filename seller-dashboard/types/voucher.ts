
// types/voucher.ts
export interface Voucher {
  id: string;
  name: string;
  voucher_code: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: string | number;
  max_discount_amount: string | number;
  applies_to_type: "ORDER_TOTAL" | "SHIPPING_FEE";
  min_purchase_amount: string | number;
  audience_type: "PUBLIC" | "ASSIGNED";
  start_date: string;
  end_date: string;
  total_quantity: number;
  max_usage_per_user: number;
  used_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_type: "SHOP" | "PLATFORM";
  user_use?: string[];
}

export interface VoucherFormData {
  name: string;
  voucher_code: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  max_discount_amount?: number;
  applies_to_type: "ORDER_TOTAL" | "SHIPPING_FEE";
  min_purchase_amount: number;
  audience_type: "PUBLIC" | "ASSIGNED";
  start_date: string;
  end_date: string;
  total_quantity: number;
  max_usage_per_user: number;
  user_use?: string[];
  is_active?: boolean;
}

export interface VoucherUsageDetail {
  id: number;
  voucher_id: string;
  user_id: string;
  discount_amount: string;
  used_at: string;
}