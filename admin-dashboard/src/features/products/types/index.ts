export interface Product {
  id: string
  key: string
  name: string
  description: string
  short_description: string
  image: string
  media: string // JSON string array
  category_id: string
  brand_id: string
  shop_id: string
  min_price: number
  max_price: number
  min_price_sku_id: string
  max_price_sku_id: string
  delete_status: 'Active' | 'Deleted'
  product_is_permission_check: boolean
  product_is_permission_return: boolean
  create_by: string
  create_date: string
  update_by: string | null
  update_date: string
}

export interface ProductDetail {
  product: Product
  brand: {
    brand_id: string
    code: string
    name: string
    image: string | null
    create_date: string
    update_date: string
  }
  category: {
    category_id: string
    key: string
    name: string
    path: string
    parent: string | null
    image: string | null
  }
  option: ProductOption[]
  sku: ProductSku[]
}

export interface ProductOption {
  option_name: string
  values: {
    option_value_id: string
    value: string
    image: string | null
  }[]
}

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
  create_date: Record<string, unknown>
  update_date: Record<string, unknown>
}

export interface ProductSearchParams {
  page?: number
  limit?: number
  brand?: string
  shop_id?: string
  price_min?: number
  price_max?: number
  keywords?: string
  sort?: string
  cate_path?: string
}

export interface ProductsResponse {
  currentPage: number
  data: Product[]
  limit: number
  totalElements: number
  totalPages: number
}
