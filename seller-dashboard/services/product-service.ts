import { apiClient } from "@/lib/api/axios-instance"
import type { ProductTemp, Product, ProductFormData, Category, Brand } from "@/types/product"

const PRODUCT_TEMP_API = "http://localhost:8000/api/product-temps"
const PRODUCT_API = "http://localhost:9000/api/Products"
const CATEGORY_API = "http://localhost:9000/api/Categories"
const BRAND_API = "http://localhost:9000/api/Brands"

export const productService = {
  // ============================
  // 📦 Product Temp (Draft) APIs
  // ============================

  getProductTemps: async (shopId?: string, status?: string): Promise<ProductTemp[]> => {
    const params = new URLSearchParams()
    if (shopId) params.append("ShopId", shopId)
    if (status) params.append("Status", status)

    const url = params.toString() ? `${PRODUCT_TEMP_API}?${params}` : PRODUCT_TEMP_API
    const response = await apiClient.get<{ result?: ProductTemp[]; data?: ProductTemp[] }>(url)
    return response.data.result || response.data as ProductTemp[]
  },

  getProductTempById: async (id: string): Promise<ProductTemp> => {
    const response = await apiClient.get<{ result?: ProductTemp; data?: ProductTemp }>(`${PRODUCT_TEMP_API}/${id}`)
    return response.data.result || response.data as ProductTemp
  },

  createProductTemp: async (data: ProductFormData): Promise<ProductTemp> => {
    const payload = {
      ProductTempName: data.productTempName,
      ProductTempDescription: data.productTempDescription,
      ProductTempDetails: data.productTempDetails,
      ProductTempImage: data.productTempImage || [],
      ProductTempMedia: data.productTempMedia || [],
      ProductTempBrandId: data.productTempBrandId,
      ProductTempCategoryId: data.productTempCategoryId,
      ProductTempSkuId: data.productTempSkuId,
      ProductTempIsPermissionReturn: data.productTempIsPermissionReturn || false,
    }
    const response = await apiClient.post<{ result?: ProductTemp; data?: ProductTemp }>(PRODUCT_TEMP_API, payload)
    return response.data.result || response.data as ProductTemp
  },

  updateProductTemp: async (id: string, data: Partial<ProductFormData>): Promise<ProductTemp> => {
    const payload: Record<string, any> = {}
    if (data.productTempName) payload.ProductTempName = data.productTempName
    if (data.productTempDescription) payload.ProductTempDescription = data.productTempDescription
    if (data.productTempDetails) payload.ProductTempDetails = data.productTempDetails
    if (data.productTempImage) payload.ProductTempImage = data.productTempImage
    if (data.productTempMedia) payload.ProductTempMedia = data.productTempMedia
    if (data.productTempBrandId) payload.ProductTempBrandId = data.productTempBrandId
    if (data.productTempCategoryId) payload.ProductTempCategoryId = data.productTempCategoryId
    if (data.productTempSkuId) payload.ProductTempSkuId = data.productTempSkuId
    if (data.productTempIsPermissionReturn !== undefined)
      payload.ProductTempIsPermissionReturn = data.productTempIsPermissionReturn

    const response = await apiClient.put<{ result?: ProductTemp; data?: ProductTemp }>(`${PRODUCT_TEMP_API}/${id}`, payload)
    return response.data.result || response.data as ProductTemp
  },

  deleteProductTemp: async (id: string): Promise<void> => {
    await apiClient.delete(`${PRODUCT_TEMP_API}/${id}`)
  },

  approveProductTemp: async (id: string, isApproved: boolean, feedback?: string): Promise<ProductTemp> => {
    const payload = {
      IsApproved: isApproved,
      Feedback: feedback || "",
    }
    const response = await apiClient.post<{ result?: ProductTemp; data?: ProductTemp }>(`${PRODUCT_TEMP_API}/${id}/approve`, payload)
    return response.data.result || response.data as ProductTemp
  },

  // ============================
  // ✅ Product APIs (Approved)
  // ============================

  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<{ result?: Product[]; data?: Product[] }>(PRODUCT_API)
    return response.data.result || response.data as Product[]
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ result?: Product; data?: Product }>(`${PRODUCT_API}/${id}`)
    return response.data.result || response.data as Product
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<{ result?: Product; data?: Product }>(`${PRODUCT_API}/${id}`, data)
    return response.data.result || response.data as Product
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`${PRODUCT_API}/${id}`)
  },

  // ============================
  // 🏷️ Category & Brand APIs
  // ============================

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ result?: Category[]; data?: Category[] }>(CATEGORY_API)
    return response.data.result || response.data as Category[]
  },

  getBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get<{ result?: Brand[]; data?: Brand[] }>(BRAND_API)
    return response.data.result || response.data as Brand[]
  },
}