import { apiClient } from "@/lib/api/axios-instance"
import type { Comment } from "@/types/comment"

const COMMENT_API = "http://localhost:7000/api/Comment"

export const commentService = {
  getComments: async (): Promise<Comment[]> => {
    const response = await apiClient.get(COMMENT_API)
    return response.data.result || response.data
  },

  replyComment: async (commentId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post(`${COMMENT_API}/${commentId}/reply`, { content })
    return response.data.result || response.data
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`${COMMENT_API}/${commentId}`)
  },
}
