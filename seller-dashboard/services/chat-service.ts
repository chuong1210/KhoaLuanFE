import { apiClient } from "@/lib/api/axios-instance"
import type { Conversation, ChatMessage } from "@/types/chat"

const CONVERSATION_API = "http://localhost:7000/api/Conversation"
const CHAT_MESSAGE_API = "http://localhost:7000/api/ChatMessage"

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get(CONVERSATION_API)
    return response.data.result || response.data
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`${CHAT_MESSAGE_API}?conversationId=${conversationId}`)
    return response.data.result || response.data
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const response = await apiClient.post(CHAT_MESSAGE_API, {
      conversationId,
      content,
      senderType: "shop",
    })
    return response.data.result || response.data
  },
}
