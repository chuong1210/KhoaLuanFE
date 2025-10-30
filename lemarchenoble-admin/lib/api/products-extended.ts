import axios from "@/lib/axios"

export const productsExtendedAPI = {
  // Get all products with pagination
  getAllProducts: async (page: number, limit: number, catePath?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (catePath) params.append("cate_path", catePath)

    const response = await axios.get(`/product/getall?${params.toString()}`)
    return response.data
  },

  // Get product by key (slug)
  getProductByKey: async (key: string) => {
    const response = await axios.get(`/product/getdetail/${key}`)
    return response.data
  },

  // Get product by ID
  getProductById: async (id: string) => {
    const response = await axios.get(`/product/getdetail_with_id/${id}`)
    return response.data
  },

  // Create product
  createProduct: async (data: any) => {
    const response = await axios.post("/product/create", data)
    return response.data
  },

  // Update product
  updateProduct: async (id: string, data: any) => {
    const response = await axios.put(`/product/update/${id}`, data)
    return response.data
  },

  // Update SKU
  updateSKU: async (data: any) => {
    const response = await axios.post("/product/update_sku_reserver", data)
    return response.data
  },

  // Get SKU by ID
  getSKUById: async (skuId: string) => {
    const response = await axios.get(`/product/getsku/${skuId}`)
    return response.data
  },
}
