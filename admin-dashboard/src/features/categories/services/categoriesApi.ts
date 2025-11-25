import { productApi, ApiResponse } from '@/lib/api'
import type { Category, CategoryResponse, CreateCategoryData, UpdateCategoryData } from '../types'

export const categoriesService = {
  // Get all categories
  getCategories: async () => {
    const response = await productApi.get<ApiResponse<CategoryResponse>>(
      '/categories/get'
    )
    return response.data.result.categories
  },

  // Create category with form data (name + parent + media files)
  createCategory: async (data: CreateCategoryData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.parent) {
      formData.append('parent', data.parent)
    }
    // Append all media files
    data.media.forEach((file) => {
      formData.append('media', file)
    })

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

  // Update category with form data (cate_id + name + parent + media files)
  updateCategory: async (data: UpdateCategoryData) => {
    const formData = new FormData()
    formData.append('cate_id', data.cate_id)
    formData.append('name', data.name)
    if (data.parent) {
      formData.append('parent', data.parent)
    }
    // Append all media files if provided
    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => {
        formData.append('media', file)
      })
    }

    const response = await productApi.post<ApiResponse<Category>>(
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
