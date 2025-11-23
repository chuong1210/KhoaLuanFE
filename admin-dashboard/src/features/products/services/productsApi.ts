import { productApi, ApiResponse, PaginatedResult } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { Product, ProductDetail, ProductSearchParams, ProductSku } from '../types'

export const productsService = {
  // Get all products with filters
  getProducts: async (params: ProductSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await productApi.get<ApiResponse<PaginatedResult<Product>>>(
      `/product/getall?${queryString}`
    )
    return response.data.result
  },

  // Get product detail by ID
  getProductDetail: async (productId: string) => {
    const response = await productApi.get<ApiResponse<{ data: ProductDetail }>>(
      `/product/getdetail_with_id/${productId}`
    )
    return response.data.result.data
  },

  // Get SKU by ID
  getSku: async (skuId: string) => {
    const response = await productApi.get<ApiResponse<{ data: ProductSku }>>(
      `/product/getsku/${skuId}`
    )
    return response.data.result.data
  },

  // Create product (placeholder - implement based on actual API)
  createProduct: async (data: Partial<Product>) => {
    const response = await productApi.post<ApiResponse<Product>>(
      '/product/create',
      data
    )
    return response.data.result
  },

  // Update product (placeholder - implement based on actual API)
  updateProduct: async (productId: string, data: Partial<Product>) => {
    const response = await productApi.put<ApiResponse<Product>>(
      `/product/update/${productId}`,
      data
    )
    return response.data.result
  },

  // Delete product (placeholder - implement based on actual API)
  deleteProduct: async (productId: string) => {
    const response = await productApi.delete<ApiResponse<boolean>>(
      `/product/delete/${productId}`
    )
    return response.data.result
  },
}
