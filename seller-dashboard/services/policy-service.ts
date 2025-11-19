import { apiClient } from "@/lib/api/axios-instance";
import type {
  Policy,
  GetPoliciesQuery,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PublishPolicyRequest
} from "@/types/policy";

const BASE_URL = "http://localhost:8000/api/policies"; // Giả sử axios instance đã có base URL

export const policyService = {
  // Lấy danh sách phân trang (cho Admin/Seller Dashboard)
  getPolicies: async (params: GetPoliciesQuery) => {
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", params.pageNumber.toString());
    queryParams.append("pageSize", params.pageSize.toString());
    if (params.policyType && params.policyType !== "ALL") queryParams.append("policyType", params.policyType);
    if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
    if (params.shopId) queryParams.append("shopId", params.shopId);

    const response = await apiClient.get(`${BASE_URL}?${queryParams.toString()}`);
    return response.data; // Trả về PaginatedResult
  },

  getPolicyById: async (id: string): Promise<Policy> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data.result;
  },

  createPolicy: async (data: CreatePolicyRequest): Promise<Policy> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data.result;
  },

  updatePolicy: async (id: string, data: UpdatePolicyRequest): Promise<Policy> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data.result;
  },

  deletePolicy: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data.result;
  },

  publishPolicy: async (id: string, data: PublishPolicyRequest): Promise<Policy> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/publish`, data);
    return response.data.result;
  }
};