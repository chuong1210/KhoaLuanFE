// types/voucher.ts
export interface Voucher {
  id: string;
  name: string;
  voucher_code: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: string | number; // String in response, number in request
  max_discount_amount: string | number;
  applies_to_type: "ORDER_TOTAL" | "SHIPPING_FEE";
  min_purchase_amount: string | number;
  audience_type: "PUBLIC" | "ASSIGNED";
  start_date: string; // ISO string or Date
  end_date: string; // ISO string or Date
  total_quantity: number;
  max_usage_per_user: number;
  used_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_type: "SHOP";
  user_use?: string[]; // For ASSIGNED audience
}

export interface VoucherShop extends Voucher {} // Alias for shop-owned vouchers

export interface VoucherFormData {
  name: string;
  voucher_code: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  max_discount_amount?: number;
  applies_to_type: "ORDER_TOTAL" | "SHIPPING_FEE";
  min_purchase_amount: number;
  audience_type: "PUBLIC" | "ASSIGNED";
  start_date: string; // ISO string
  end_date: string; // ISO string
  total_quantity: number;
  max_usage_per_user: number;
  user_use?: string[]; // Array of user IDs for ASSIGNED
  is_active?: boolean; // For update
}