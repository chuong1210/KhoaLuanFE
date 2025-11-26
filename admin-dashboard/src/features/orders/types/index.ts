// features/orders/types/index.ts

export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface Order {
  order_id: string
  order_code: string
  user_id: string
  status: string
  grand_total: number
  subtotal: number
  total_shipping_fee: number
  total_discount: number
  site_order_voucher_code: string | null
  site_order_voucher_discount: number
  site_shipping_voucher_code: string | null
  site_shipping_voucher_discount: number
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  note: string | null
  created_at: string
  updated_at: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  district: string
  city: string
  postalCode: string | null
}

export interface PaymentMethod {
  id: string
  name: string
  code: string
  type: 'ONLINE' | 'OFFLINE'
  is_active: boolean
}

export interface OrderItem {
  item_id: string
  product_id: string
  sku_id: string
  quantity: number
  original_unit_price: number
  final_unit_price: number
  total_price: number
  reviewed: boolean
  product_name: string
  product_image: string
  sku_attributes: string
  promotions_snapshot: Record<string, unknown> | null
}

export interface ShopOrder {
  shop_order_id: string
  shop_order_code: string
  shop_id: string
  status: OrderStatus
  subtotal: number
  shipping_fee: number
  total_discount: number
  total_amount: number
  shop_voucher_code: string
  shop_voucher_discount: number
  shipping_method: string
  tracking_code: string
  site_order_discount: number
  site_shipping_discount: number
  items: OrderItem[]
  created_at: string
  updated_at: string
  paid_at: string | null
  processing_at: string | null
  shipped_at: string | null
  completed_at: string | null
  cancelled_at: string | null
}

export interface OrderWithShop {
  order: Order
  order_shop: ShopOrder
}

export interface OrderSearchParams {
  // Status filter
  status?: OrderStatus
  
  // Shop filter
  shop_id?: string
  
  // Amount filters
  min_amount?: number
  max_amount?: number
  
  // Date range filters
  created_from?: string
  created_to?: string
  paid_from?: string
  paid_to?: string
  processing_from?: string
  processing_to?: string
  shipped_from?: string
  shipped_to?: string
  completed_from?: string
  completed_to?: string
  cancelled_from?: string
  cancelled_to?: string
  
  // Search
  order_code?: string
  user_id?: string
  tracking_code?: string
  
  // Voucher filters
  has_site_voucher?: boolean
  has_shop_voucher?: boolean
  site_voucher_code?: string
  shop_voucher_code?: string
  
  // Pagination & sorting
  page?: number
  page_size?: number
  sort_by?: 'created_at' | 'grand_total' | 'updated_at' | 'paid_at'
  sort_order?: 'asc' | 'desc'
}

export interface OrdersResponse {
  currentPage: number
  data: OrderWithShop[]
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  note?: string
}

export interface CancelOrderRequest {
  reason: string
  refund_amount?: number
}