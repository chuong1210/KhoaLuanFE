import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Product } from "@/types"

export const productService = {
  getProducts: async (page = 1, limit = 10, filters?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params: { page, limit, ...filters },
    })
    return response.data.result
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.result
  },

  createProduct: async (data: Partial<Product>) => {
    const response = await apiClient.post<ApiResponse<Product>>("/products", data)
    return response.data.result
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data.result
  },

  deleteProduct: async (id: string) => {
    await apiClient.delete(`/products/${id}`)
  },
}
