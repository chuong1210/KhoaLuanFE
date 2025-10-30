export interface ProductTemp {
  id: string
  productTempName: string
  productTempDescription: string
  productTempDetails?: string
  productTempImage: string[] // Array of image URLs
  productTempMedia?: string[] // Array of video URLs
  productTempBrandId: string
  productTempCategoryId: string
  productTempSkuId: string
  productTempIsPermissionReturn: boolean
  shopId: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  productName: string
  description: string
  image: string
  sku: string
  price: number
  stock: number
  categoryId: string
  brandId: string
  shopId: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  productTempName: string
  productTempDescription: string
  productTempDetails?: string
  productTempImage: string[] // Min 1 cover image
  productTempMedia?: string[] // Videos (optional)
  productTempBrandId: string
  productTempCategoryId: string
  productTempSkuId: string
  productTempIsPermissionReturn?: boolean
}

export interface GetProductTempQuery {
  pageNumber?: number
  pageSize?: number
  status?: boolean | null // null: all, true: approved, false: pending/rejected
  shopId?: string
}

export interface ApproveProductTempRequest {
  isApproved: boolean
  feedback?: string
}

export interface Category {
  id: string
  name: string
}

export interface Brand {
  id: string
  name: string
}
