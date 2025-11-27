// features/products/services/productsApi.ts - UPDATED
import axios from 'axios'
import type {
  Product,
  ProductDetail,
  ProductSearchParams,
  ProductsResponse,
  ProductDetailResponse,
} from '../types'
import { productApi, ApiResponse } from '@/lib/api'

// Helper function to parse query params
const parseQueryParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
}

// Helper function to transform image URL
export const transformImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a local path like "0.0.0.0:9001/v1/media/stream/..."
  if (imagePath.includes('/v1/media/stream/')) {
    const filename = imagePath.split('/v1/media/stream/')[1]
    return `http://localhost:9001/v1/media/${filename}`
  }
  
  // Default: assume it's just a filename
  return `http://localhost:9001/v1/media/${imagePath}`
}

export const productsService = {
  // Get all products with filters
  getProducts: async (params: ProductSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await productApi.get<ProductsResponse>(`/product/getall?${queryString}`)
    return response.data.result
  },

  // Get product detail by ID
  getProductDetail: async (productId: string): Promise<ProductDetail> => {
    const response = await productApi.get<ProductDetailResponse>(
      `/product/getdetail_with_id/${productId}`
    )
    return response.data.result.data
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<boolean> => {
    const response = await productApi.delete(`/product/delete/${productId}`)
    return response.data.result
  },

  // Get pending products for approval
  getPendingProducts: async (params: ProductSearchParams) => {
    const queryString = parseQueryParams({ ...params, status: 'Pending' })
    const response = await productApi.get<ProductsResponse>(`/product/getall?${queryString}`)
    return response.data.result
  },

  // Approve or reject product
  approveProduct: async (productId: string, approve: boolean) => {
    const formData = new FormData()
    formData.append('product', JSON.stringify({ approval_product: approve }))
    
    const response = await productApi.put(
      `/product/update/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}