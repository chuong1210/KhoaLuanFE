export interface Follower {
  id: string;
  userProfileId: string;
  shopId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  createdAt: string;
}

export interface FollowerFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: "created_desc" | "created_asc" | "name_asc" | "name_desc";
}

export interface FollowerPaginatedResponse {
  result: Follower[];
  succeeded: boolean;
  messages: string[] | null;
  code: number;
  extra: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}