import { apiClient } from "@/lib/api/axios-instance"



import type { FollowerFilters, FollowerPaginatedResponse } from "@/types/follow";

const FOLLOWER_API = "http://localhost:8000/api/Followers"
export const followerService = {
  getMyShopFollowers: async (filters: FollowerFilters = {}): Promise<FollowerPaginatedResponse> => {
    const params = new URLSearchParams();

    if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString());
    if (filters.pageSize) params.append("PageSize", filters.pageSize.toString());
    if (filters.searchTerm) params.append("SearchTerm", filters.searchTerm);
    if (filters.sortBy) params.append("SortBy", filters.sortBy);

    const response = await apiClient.get(`${FOLLOWER_API}/my-shop?${params.toString()}`);
    return response.data;
  },

  getShopFollowers: async (
    shopId: string,
    filters: FollowerFilters = {}
  ): Promise<FollowerPaginatedResponse> => {
    const params = new URLSearchParams();

    if (filters.pageNumber) params.append("PageNumber", filters.pageNumber.toString());
    if (filters.pageSize) params.append("PageSize", filters.pageSize.toString());
    if (filters.searchTerm) params.append("SearchTerm", filters.searchTerm);
    if (filters.sortBy) params.append("SortBy", filters.sortBy);

    const response = await apiClient.get(`${FOLLOWER_API}/shop/${shopId}?${params.toString()}`);
    return response.data;
  },
};