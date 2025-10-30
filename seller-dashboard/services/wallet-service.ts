import { apiClient } from "@/lib/api/axios-instance"
import type { WalletShop, ShopTransaction, PayoutRequest } from "@/types/wallet"

const WALLET_API = "http://localhost:8000/api/WalletShop"
const TRANSACTION_API = "http://localhost:8000/api/ShopTransaction"

export const walletService = {
  getWallet: async (): Promise<WalletShop> => {
    const response = await apiClient.get(WALLET_API)
    return response.data.result || response.data
  },

  getTransactions: async (): Promise<ShopTransaction[]> => {
    const response = await apiClient.get(TRANSACTION_API)
    return response.data.result || response.data
  },

  requestPayout: async (data: PayoutRequest): Promise<void> => {
    const response = await apiClient.post(`${WALLET_API}/payout`, data)
    return response.data
  },
}
