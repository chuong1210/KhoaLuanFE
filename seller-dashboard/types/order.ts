// types/order.ts
export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: string;
  is_active: boolean;
}

export interface Order {
  order_id: string;
  order_code: string;
  user_id: string;
  status: string;
  grand_total: number;
  subtotal: number;
  total_shipping_fee: number;
  total_discount: number;
  site_order_voucher_code: string | null;
  site_order_voucher_discount: number;
  site_shipping_voucher_code: string | null;
  site_shipping_voucher_discount: number;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  sku_id: string;
  quantity: number;
  original_unit_price: number;
  final_unit_price: number;
  total_price: number;
  product_name: string;
  product_image: string;
  sku_attributes: string;
  promotions_snapshot: any;
}

export interface ShopOrder {
  shop_order_id: string;
  shop_order_code: string;
  shop_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total_discount: number;
  total_amount: number;
  shop_voucher_code: string;
  shop_voucher_discount: number;
  shipping_method: string;
  tracking_code: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  processing_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface OrderDetail {
  order: Order;
  order_shop: ShopOrder;
}

export interface OrderSearchParams {
  status?: OrderStatus;
  shop_id?: string;
  min_amount?: number;
  max_amount?: number;
  created_from?: string;
  created_to?: string;
  paid_from?: string;
  paid_to?: string;
  processing_from?: string;
  processing_to?: string;
  shipped_from?: string;
  shipped_to?: string;
  completed_from?: string;
  completed_to?: string;
  cancelled_from?: string;
  cancelled_to?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
}

export interface OrderSearchResponse {
  code: number;
  message: string;
  status: string;
  result: {
    currentPage: number;
    data: OrderDetail[];
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}
