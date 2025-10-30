export interface VoucherShop {
  id: string
  shopId: string
  name: string
  code: string
  discount: number
  discountType: "percentage" | "fixed"
  minSupport: number
  quantity: number
  used: number
  startDate: string
  endDate: string
  image: string
  status: "active" | "inactive" | "expired"
  createdAt: string
  updatedAt: string
}

export interface VoucherFormData {
  name: string
  code: string
  discount: number
  discountType: "percentage" | "fixed"
  minSupport: number
  quantity: number
  startDate: string
  endDate: string
  image: string
}
