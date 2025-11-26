// features/vouchers/types/index.ts

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'
export type AppliesToType = 'ORDER_TOTAL' | 'SHIPPING_FEE'
export type AudienceType = 'PUBLIC' | 'ASSIGNED'
export type VoucherStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED'
export type OwnerType = 'PLATFORM' | 'SHOP'

export interface Voucher {
  id: string
  name: string
  voucher_code: string
  owner_type: OwnerType
  owner_id: string
  discount_type: DiscountType
  discount_value: string
  max_discount_amount: {
    String: string
    Valid: boolean
  }
  applies_to_type: AppliesToType
  min_purchase_amount: string
  audience_type: AudienceType
  start_date: string
  end_date: string
  total_quantity: number
  used_quantity: number
  remaining_quantity: number
  max_usage_per_user: number
  is_active: boolean
  status: VoucherStatus
  created_at: string
  updated_at: string
}

export interface VoucherSearchParams {
  page?: number
  page_size?: number
  voucher_code?: string
  name?: string
  discount_type?: DiscountType
  applies_to_type?: AppliesToType
  audience_type?: AudienceType
  is_active?: boolean
  sort_by?: 'end_date_asc' | 'end_date_desc' | 'created_at_asc' | 'created_at_desc' | 'start_date_asc' | 'start_date_desc'
  shop_id?: string
  owner_type?: OwnerType
  status?: VoucherStatus
  min_discount_value?: number
  max_discount_value?: number
  start_date_from?: string
  start_date_to?: string
  end_date_from?: string
  end_date_to?: string
}

export interface VouchersResponse {
  data: Voucher[]
  pagination: {
    current_page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

export interface CreateVoucherRequest {
  name: string
  voucher_code: string
  discount_type: DiscountType
  discount_value: number
  max_discount_amount?: number
  applies_to_type: AppliesToType
  min_purchase_amount: number
  audience_type: AudienceType
  start_date: string
  end_date: string
  total_quantity: number
  max_usage_per_user: number
  user_use?: string[]
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {
  is_active?: boolean
}