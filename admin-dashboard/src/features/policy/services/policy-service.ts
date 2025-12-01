// services/policy-service.ts
import { apiClient } from "@/lib/axios-instance";
import type { 
  Policy, 
  GetPoliciesQuery, 
  CreatePolicyRequest, 
  UpdatePolicyRequest, 
  PublishPolicyRequest 
} from "../types/policy";

const POLICY_API_BASE = "http://localhost:8000/api/Policies";

export const policyService = {
  // Lấy danh sách (Admin dùng)
  getPolicies: async (params: GetPoliciesQuery) => {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params.policyType && params.policyType !== "ALL") queryParams.append("policyType", params.policyType);
    if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
    // Admin có thể muốn xem policy của Shop cụ thể hoặc của Hệ thống (null)
    if (params.shopId) queryParams.append("shopId", params.shopId);

    const response = await apiClient.get(`${POLICY_API_BASE}?${queryParams.toString()}`);
    return response.data; // Trả về PaginatedResult
  },

  getPolicyById: async (id: string): Promise<Policy> => {
    const response = await apiClient.get(`${POLICY_API_BASE}/${id}`);
    return response.data.result || response.data;
  },

  createPolicy: async (data: CreatePolicyRequest): Promise<Policy> => {
    const response = await apiClient.post(POLICY_API_BASE, data);
    return response.data.result || response.data;
  },

  updatePolicy: async (id: string, data: UpdatePolicyRequest): Promise<Policy> => {
    const response = await apiClient.put(`${POLICY_API_BASE}/${id}`, data);
    return response.data.result || response.data;
  },

  deletePolicy: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`${POLICY_API_BASE}/${id}`);
    return response.data.result || response.data;
  },

  publishPolicy: async (id: string, data: PublishPolicyRequest): Promise<Policy> => {
    const response = await apiClient.post(`${POLICY_API_BASE}/${id}/publish`, data);
    return response.data.result || response.data;
  }
};