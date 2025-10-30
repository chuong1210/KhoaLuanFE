import { apiClient } from "@/lib/api/axios-instance"
import type { Follow } from "@/types/follow"

const FOLLOW_API = "http://localhost:8000/api/Follow"

export const followService = {
  getFollows: async (): Promise<Follow[]> => {
    const response = await apiClient.get(FOLLOW_API)
    return response.data.result || response.data
  },
}
