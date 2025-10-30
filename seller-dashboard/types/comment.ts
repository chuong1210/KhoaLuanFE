export interface Comment {
  id: string
  userId: string
  shopId?: string
  productId?: string
  content: string
  rating?: number
  userName: string
  userAvatar: string
  createdAt: string
  updatedAt: string
}
