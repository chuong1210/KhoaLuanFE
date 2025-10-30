import axios from "@/lib/axios"

export const categoriesAPI = {
  // Get all categories
  getAllCategories: async () => {
    const response = await axios.get("/categories/getEndFragment")
    return response.data
  },

  // Create category
  createCategory: async (formData: FormData) => {
    const response = await axios.post("/categories/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  // Update category
  updateCategory: async (formData: FormData) => {
    const response = await axios.put("/categories/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  // Delete category
  deleteCategory: async (id: string) => {
    const response = await axios.delete(`/categories/delete/${id}`)
    return response.data
  },
}
