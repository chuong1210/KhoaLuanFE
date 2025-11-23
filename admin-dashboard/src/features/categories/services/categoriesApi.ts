import { productApi, ApiResponse } from '@/lib/api'
import type { Category, CreateCategoryData, UpdateCategoryData } from '../types'

export const categoriesService = {
  // Get all categories
  getCategories: async () => {
    const response = await productApi.get<ApiResponse<{ data: Category[] }>>(
      '/categories/get'
    )
    return response.data.result.data
  },

  // Create category with form data (parent + media file)
  createCategory: async (data: CreateCategoryData) => {
    const formData = new FormData()
    if (data.parent) {
      formData.append('parent', data.parent)
    }
    formData.append('media', data.media)

    const response = await productApi.post<ApiResponse<Category>>(
      '/categories/create',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.result
  },

  // Update category with form data (cate_id + media file)
  updateCategory: async (data: UpdateCategoryData) => {
    const formData = new FormData()
    formData.append('cate_id', data.cate_id)
    formData.append('media', data.media)

    const response = await productApi.put<ApiResponse<Category>>(
      '/categories/update',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.result
  },

  // Delete category by ID
  deleteCategory: async (categoryId: string) => {
    const response = await productApi.delete<ApiResponse<boolean>>(
      `/categories/delete/${categoryId}`
    )
    return response.data.result
  },
}
