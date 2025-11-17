// services/product-service.ts - Product API service
import { apiClient } from "@/lib/api/axios-instance"
import type { 
  Product, 
  ProductDetail,
  ProductListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilters,
  Brand,
  Category
} from "@/types/product"

const PRODUCT_API_BASE = "http://localhost:9001/v1/product"
const MEDIA_API_BASE = "http://localhost:9001/v1/media"

export const productService = {
  // Upload media file
  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("media", file)
    const response = await apiClient.post(MEDIA_API_BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    const fileName = response.data.result?.name || response.data.name
    if (!fileName) {
      throw new Error("Failed to upload media")
    }
    return fileName
  },

  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.brand) params.append('brand', filters.brand)
    if (filters.shop_id) params.append('shop_id', filters.shop_id)
    if (filters.price_min) params.append('price_min', filters.price_min.toString())
    if (filters.price_max) params.append('price_max', filters.price_max.toString())
    if (filters.keywords) params.append('keywords', filters.keywords)
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.cate_path) params.append('cate_path', filters.cate_path)

    const response = await apiClient.get(
      `${PRODUCT_API_BASE}/getall${params.toString() ? '?' + params.toString() : ''}`
    )
    return response.data.result
  },

  // Get product detail by ID
  getProductDetail: async (productId: string): Promise<ProductDetail> => {
    const response = await apiClient.get(
      `${PRODUCT_API_BASE}/getdetail_with_id/${productId}`
    )
    return response.data.result.data
  },

  // Create product
  createProduct: async (data: CreateProductPayload, files: {
    image?: File
    media?: File[]
    option_value_images?: File[]
  }): Promise<Product> => {
    const formData = new FormData()
    
    // Add product data as JSON string
    formData.append('Product', JSON.stringify(data))
    
    // Add image file
    if (files.image) {
      formData.append('Image', files.image)
    }
    
    // Add media files
    if (files.media && files.media.length > 0) {
      files.media.forEach(file => {
        formData.append('Media', file)
      })
    }
    
    // Add option value images
    if (files.option_value_images && files.option_value_images.length > 0) {
      files.option_value_images.forEach((file, index) => {
        formData.append(`option_value_images[${index}]`, file)
      })
    }
    
    const response = await apiClient.post(
      `${PRODUCT_API_BASE}/create`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return response.data.result
  },

  // Update product
  updateProduct: async (
    productId: string, 
    data: UpdateProductPayload,
    files?: {
      image?: File
      media?: File[]
      option_value_images?: File[]
    }
  ): Promise<Product> => {
    const formData = new FormData()
    
    // Add product data as JSON string
    formData.append('Product', JSON.stringify(data))
    
    // Add files if provided
    if (files?.image) {
      formData.append('Image', files.image)
    }
    
    if (files?.media && files.media.length > 0) {
      files.media.forEach(file => {
        formData.append('Media', file)
      })
    }
    
    if (files?.option_value_images && files.option_value_images.length > 0) {
      files.option_value_images.forEach((file, index) => {
        formData.append(`option_value_images[${index}]`, file)
      })
    }
    
    const response = await apiClient.put(
      `${PRODUCT_API_BASE}/update/${productId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return response.data.result
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`${PRODUCT_API_BASE}/${productId}`)
  },

  // Get brands (mock - adjust endpoint if needed)
  getBrands: async (): Promise<Brand[]> => {
    // Replace with actual endpoint when available
    const response = await apiClient.get('/brands')
    return response.data.result || response.data
  },

  // Get categories (mock - adjust endpoint if needed)
  getCategories: async (): Promise<Category[]> => {
    // Replace with actual endpoint when available
    const response = await apiClient.get('/categories')
    return response.data.result || response.data
  }
}