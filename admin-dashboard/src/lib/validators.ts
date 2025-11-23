import { z } from 'zod'

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự'),
  password: z.string().min(4, 'Mật khẩu phải có ít nhất 4 ký tự'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Product Schema
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.string().min(1, 'Danh mục là bắt buộc'),
  brand_id: z.string().optional(),
  shop_id: z.string().min(1, 'Shop là bắt buộc'),
  min_price: z.number().min(0, 'Giá phải lớn hơn 0'),
  max_price: z.number().min(0, 'Giá phải lớn hơn 0'),
  image: z.string().optional(),
  media: z.array(z.string()).optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// Voucher Schema
export const voucherSchema = z.object({
  name: z.string().min(1, 'Tên voucher là bắt buộc'),
  voucher_code: z
    .string()
    .min(4, 'Mã voucher phải có ít nhất 4 ký tự')
    .regex(/^[A-Z0-9]+$/, 'Mã voucher chỉ chứa chữ in hoa và số'),
  discount_type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discount_value: z.number().min(0, 'Giá trị giảm phải lớn hơn 0'),
  max_discount_amount: z.number().optional(),
  applies_to_type: z.enum(['ORDER_TOTAL', 'SHIPPING_FEE']),
  min_purchase_amount: z.number().min(0).default(0),
  audience_type: z.enum(['PUBLIC', 'ASSIGNED']),
  start_date: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  end_date: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  total_quantity: z.number().min(1, 'Số lượng phải ít nhất là 1'),
  max_usage_per_user: z.number().min(1).default(1),
  user_use: z.array(z.string()).optional(),
})

export type VoucherFormData = z.infer<typeof voucherSchema>

// Shop Approval Schema
export const shopApprovalSchema = z.object({
  isApproved: z.boolean(),
  feedback: z.string().max(1000, 'Feedback tối đa 1000 ký tự').optional(),
})

export type ShopApprovalFormData = z.infer<typeof shopApprovalSchema>

// Order Search Schema
export const orderSearchSchema = z.object({
  status: z.string().optional(),
  shop_id: z.string().optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort_by: z.string().optional(),
})

export type OrderSearchParams = z.infer<typeof orderSearchSchema>

// Product Search Schema
export const productSearchSchema = z.object({
  keywords: z.string().optional(),
  brand: z.string().optional(),
  shop_id: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  cate_path: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
})

export type ProductSearchParams = z.infer<typeof productSearchSchema>
