import { apiClient } from "@/lib/api/axios-instance"
import type { ProgressTransfer, OfflineTransaction } from "@/types/transfer"

const PROGRESS_TRANSFER_API = "http://localhost:8000/api/ProgressTransfer"
const OFFLINE_TRANSACTION_API = "http://localhost:8000/api/OfflineTransaction"

export const transferService = {
  getProgressTransfers: async (): Promise<ProgressTransfer[]> => {
    const response = await apiClient.get(PROGRESS_TRANSFER_API)
    return response.data.result || response.data
  },

  getProgressTransferById: async (id: string): Promise<ProgressTransfer> => {
    const response = await apiClient.get(`${PROGRESS_TRANSFER_API}/${id}`)
    return response.data.result || response.data
  },

  getOfflineTransactions: async (): Promise<OfflineTransaction[]> => {
    const response = await apiClient.get(OFFLINE_TRANSACTION_API)
    return response.data.result || response.data
  },
}
