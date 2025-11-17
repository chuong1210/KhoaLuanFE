// types/product.ts - Updated product types matching real API

export interface ProductSku {
  id: string
  sku_code: string
  sku_name: string
  price: number
  quantity: number
  quantity_reserver: number
  weight: number
  option_value_ids: string[]
  product_id: string
  create_date: Record<string, any>
  update_date: Record<string, any>
}

export interface OptionValue {
  option_value_id: string
  value: string
  image: string | null
}

export interface ProductOption {
  option_name: string
  values: OptionValue[]
}

export interface Brand {
  brand_id: string
  name: string
  code: string
  image: string | null
  create_date: string
  update_date: string
}

export interface Category {
  category_id: string
  name: string
  key: string
  path: string
  image: string | null
  parent: string | null
}

export interface ProductRating {
  product_id: string
  total_reviews: number
  average_rating: number
}

export interface Product {
  id: string
  name: string
  key: string
  description: string
  short_description: string
  image: string
  media: string // JSON string array
  min_price: number
  max_price: number
  min_price_sku_id: string
  max_price_sku_id: string
  brand_id: string
  category_id: string
  shop_id: string
  product_is_permission_check: boolean
  product_is_permission_return: boolean
  rating?: ProductRating
  delete_status: string
  create_by: string
  create_date: string
  update_by: string
  update_date: string
}

export interface ProductDetail {
  product: Product
  brand: Brand
  category: Category
  sku: ProductSku[]
  option: ProductOption[]
}

export interface ProductListResponse {
  currentPage: number
  data: Product[]
  limit: number
  totalElements: number
  totalPages: number
}

export interface CreateProductSkuPayload {
  sku_code: string
  price: number
  quantity: number
  weight: number
  option_value: Array<{
    option_name: string
    value: string
  }>
}

export interface CreateProductPayload {
  name: string
  key: string
  description: string
  short_description: string
  brand_id: string
  category_id: string
  shop_id: string
  product_is_permission_return: boolean
  product_is_permission_check: boolean
  product_sku: CreateProductSkuPayload[]
  option_value: Array<{
    option_name: string
    value: string
  }>
}

export interface UpdateProductPayload {
  name: string
  key: string
  product_sku: Array<{
    id: string
    quantity: number
    price: number
    weight: number
  }>
}

export interface ProductFilters {
  page?: number
  limit?: number
  brand?: string
  shop_id?: string
  price_min?: number
  price_max?: number
  keywords?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  cate_path?: string
}