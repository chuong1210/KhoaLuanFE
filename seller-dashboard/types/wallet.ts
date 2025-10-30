export interface WalletShop {
  id: string
  shopId: string
  balance: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface ShopTransaction {
  id: string
  walletId: string
  type: "credit" | "debit"
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  createdAt: string
}

export interface PayoutRequest {
  amount: number
  bankAccount: string
  bankName: string
  accountHolder: string
}
