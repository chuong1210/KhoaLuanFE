// services/product-service.ts - Product API service
import axiosInstance, { apiClient } from "@/lib/api/axios-instance"
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
const CATEGORY_API_BASE = "http://localhost:9001/v1/categories"

const MEDIA_API_BASE = "http://localhost:9001/v1/media"

export const productService = {
  // Upload single media file
  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("media", file)
    const response = await apiClient.post(MEDIA_API_BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    const result = response.data.result
    // API returns array, get first element
    if (Array.isArray(result) && result.length > 0) {
      return result[0]
    }
    const fileName = result?.name || response.data.name
    if (!fileName) {
      throw new Error("Failed to upload media")
    }
    return fileName
  },

  // Upload multiple media files at once
  uploadMediaBatch: async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    const formData = new FormData()
    files.forEach(file => {
      formData.append("media", file)
    })

    const response = await apiClient.post(MEDIA_API_BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })

    // API returns { result: ["filename1.jpg", "filename2.jpg", ...] }
    const result = response.data.result
    if (Array.isArray(result)) {
      return result
    }
    throw new Error("Failed to upload media batch")
  },

  // Helper lấy URL ảnh
  // Hàm lấy file Blob từ URL (để chuyển đổi ảnh từ server thành File object gửi lên API create)
  // Vì API create yêu cầu Multipart File, mà ta chỉ có URL ảnh từ server media
  urlToFile: async (url: string, filename: string, mimeType: string): Promise<File> => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return new File([buf], filename, { type: mimeType });
  },

  // Hàm lấy file Blob từ URL (để chuyển đổi ảnh từ server thành File object gửi lên API create)
  // Vì API create yêu cầu Multipart File, mà ta chỉ có URL ảnh từ server media

  getImageUrl: (fileName: string | null | undefined): string => {
    if (!fileName) return `${MEDIA_API_BASE}/placeholder-image.jpg`; // Ảnh mặc định nếu null
    if (fileName.startsWith("http") || fileName.startsWith("https") ) return fileName; // Nếu đã là link full thì giữ nguyên
    return `${MEDIA_API_BASE}/${fileName}`;
  },
// Get all products with filters (UPDATED WITH STATUS)
  getProducts: async (filters: ProductFilters & { status?: string } = {}): Promise<ProductListResponse> => {
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
    
    // NEW: Add status filter
    if (filters.status) params.append('status', filters.status)

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

  // Create product with multipart/form-data
  createProduct: async (
    data: CreateProductPayload,
    files: {
      image: File;
      media?: File[];
      option_value_images?: File[];
    }
  ): Promise<Product> => {
    const formData = new FormData();

    // 1. Append product data as JSON string (CRITICAL: Backend expects "product" key)
    formData.append("product", JSON.stringify(data));

    // 2. Append main image (key: "image")
    formData.append("image", files.image);

    // 3. Append media files as array (key: "media")
    if (files.media && files.media.length > 0) {
      files.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    // 4. Append option_value_images with indexed keys: option_value_images[0], option_value_images[1], ...
    if (files.option_value_images && files.option_value_images.length > 0) {
      files.option_value_images.forEach((file, index) => {
        formData.append(`option_value_images[${index}]`, file);
      });
    }

    const response = await axiosInstance.post<{ result: Product }>(
      `${PRODUCT_API_BASE}/create`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.result;
  },

  // Update product
  updateProduct: async (
    id: string,
    data: UpdateProductPayload,
    files?: {
      image?: File;
      media?: File[];
      option_value_images?: File[];
    }
  ): Promise<Product> => {
    const formData = new FormData();

    // Append product data as JSON string
    formData.append("product", JSON.stringify(data));

    // Append files if provided
    if (files?.image) {
      formData.append("image", files.image);
    }

    if (files?.media && files.media.length > 0) {
      files.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    if (files?.option_value_images && files.option_value_images.length > 0) {
      files.option_value_images.forEach((file, index) => {
        formData.append(`option_value_images[${index}]`, file);
      });
    }

    const response = await axiosInstance.put<{ result: Product }>(
      `${PRODUCT_API_BASE}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.result;
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
    const response = await apiClient.get(`${CATEGORY_API_BASE}/get`)
    return response.data.result.categories || response.data
  }
}