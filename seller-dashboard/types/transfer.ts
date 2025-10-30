export interface ProgressTransfer {
  id: string
  orderId: string
  status: "pending" | "in_transit" | "delivered" | "failed"
  estimateTime: string
  currentLocation: string
  createdAt: string
  updatedAt: string
}

export interface OfflineTransaction {
  id: string
  orderId: string
  amount: number
  paymentMethod: string
  status: "pending" | "completed" | "failed"
  createdAt: string
}
