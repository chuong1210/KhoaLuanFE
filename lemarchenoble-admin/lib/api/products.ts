import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Product } from "@/types"

export async function getProducts(page = 1, limit = 10, filters?: any) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
    params: { page, limit, ...filters },
  })
  return response.data.result
}

export async function getProductById(id: string) {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  return response.data.result
}

export async function createProduct(data: Partial<Product>) {
  const response = await apiClient.post<ApiResponse<Product>>("/products", data)
  return response.data.result
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
  return response.data.result
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`)
}
