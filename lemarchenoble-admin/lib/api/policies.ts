import axios from "@/lib/axios"

export const policiesAPI = {
  // Get active policies
  getActivePolicies: async (shopId?: string) => {
    const params = new URLSearchParams()
    if (shopId) params.append("shopId", shopId)

    const response = await axios.get(`/api/v1/policies/active?${params.toString()}`)
    return response.data
  },

  // Get all policies with pagination
  getAllPolicies: async (
    pageNumber: number,
    pageSize: number,
    policyType?: string,
    isActive?: boolean,
    shopId?: string,
  ) => {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    })
    if (policyType) params.append("PolicyType", policyType)
    if (isActive !== undefined) params.append("IsActive", isActive.toString())
    if (shopId) params.append("ShopId", shopId)

    const response = await axios.get(`/api/v1/policies?${params.toString()}`)
    return response.data
  },

  // Get policy by ID
  getPolicyById: async (id: string) => {
    const response = await axios.get(`/api/v1/policies/${id}`)
    return response.data
  },

  // Create policy
  createPolicy: async (data: any) => {
    const response = await axios.post("/api/v1/policies", data)
    return response.data
  },

  // Update policy
  updatePolicy: async (id: string, data: any) => {
    const response = await axios.put(`/api/v1/policies/${id}`, data)
    return response.data
  },

  // Delete policy
  deletePolicy: async (id: string) => {
    const response = await axios.delete(`/api/v1/policies/${id}`)
    return response.data
  },

  // Publish policy
  publishPolicy: async (id: string, data: any) => {
    const response = await axios.post(`/api/v1/policies/${id}/publish`, data)
    return response.data
  },
}
