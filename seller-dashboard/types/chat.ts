export interface Conversation {
  id: string
  shopId: string
  userId: string
  userName: string
  userAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  createdAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: "shop" | "user"
  content: string
  createdAt: string
}
