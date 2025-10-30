import { apiClient } from "@/lib/api/axios-instance"
import type { Policy, PolicyFormData } from "@/types/policy"

const POLICY_API = "http://localhost:8000/api/Policy"

export const policyService = {
  getPolicies: async (): Promise<Policy[]> => {
    const response = await apiClient.get(POLICY_API)
    return response.data.result || response.data
  },

  getPolicyById: async (id: string): Promise<Policy> => {
    const response = await apiClient.get(`${POLICY_API}/${id}`)
    return response.data.result || response.data
  },

  createPolicy: async (data: PolicyFormData): Promise<Policy> => {
    const response = await apiClient.post(POLICY_API, data)
    return response.data.result || response.data
  },

  updatePolicy: async (id: string, data: Partial<PolicyFormData>): Promise<Policy> => {
    const response = await apiClient.put(`${POLICY_API}/${id}`, data)
    return response.data.result || response.data
  },

  deletePolicy: async (id: string): Promise<void> => {
    await apiClient.delete(`${POLICY_API}/${id}`)
  },
}
