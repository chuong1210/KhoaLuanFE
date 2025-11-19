// types/order.ts
export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  item_id: string;
  product_id: string;
  sku_id: string;
  quantity: number;
  original_unit_price: number;
  final_unit_price: number;
  total_price: number;
  reviewed: boolean;
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
  site_order_discount: number;
  site_shipping_discount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  processing_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface ShopOrdersResponse {
  code: number;
  message: string;
  status: string;
  result: {
    currentPage: number;
    data: ShopOrder[];
    limit: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface OrderSearchParams {
  shop_id?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}


// types/order.ts

// ... Các type cũ giữ nguyên (OrderStatus, OrderItem, ShopOrder...)

// Thêm Interface cho cấu trúc Shipping Address (trong object "order")
export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
}

// Thêm Interface cho cấu trúc Payment Method (trong object "order")
export interface OrderPaymentMethod {
  id: string;
  name: string;
  code: string;
  type: string;
}

// Thêm Interface cho object "order" chung
export interface GeneralOrderInfo {
  order_id: string;
  order_code: string;
  user_id: string;
  grand_total: number;
  shipping_address: OrderShippingAddress;
  payment_method: OrderPaymentMethod;
  created_at: string;
}

// --- QUAN TRỌNG: Type cho response của API getDetail ---
export interface OrderDetailResponseResult {
  order: GeneralOrderInfo;
  order_shop: ShopOrder; // Đây là cái UI đang cần
}