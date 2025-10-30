export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"

export interface ShopOrder {
  id: string
  orderId: string
  shopId: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  updatedAt: string
  customerName: string
  customerEmail: string
  shippingAddress: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  totalPrice: number
}

export interface OrderDetail extends ShopOrder {
  items: OrderItem[]
}
