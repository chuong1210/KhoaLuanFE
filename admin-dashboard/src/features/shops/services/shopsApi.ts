import axios from 'axios'
import type {
  Shop,
  ShopSearchParams,
  PendingShop,
  ShopApprovalRequest,
  ShopsResponse,
  PendingShopsResponse,
  ShopDetailResponse,
  ShopApprovalResponse,
} from '../types'

import { shopApi, ApiResponse } from '@/lib/api'


const mediaApi = axios.create({
  baseURL: 'http://localhost:9001/v1/media',
})

// Helper function to parse query params
const parseQueryParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
}

// Helper function to transform image URL
export const transformImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a local path like "0.0.0.0:9001/v1/media/stream/..."
  if (imagePath.includes('/v1/media/stream/')) {
    const filename = imagePath.split('/v1/media/stream/')[1]
    return `http://localhost:9001/v1/media/${filename}`
  }
  
  // Default: assume it's just a filename
  return `http://localhost:9001/v1/media/${imagePath}`
}

export const shopsService = {
  // Get all shops with filters
  getShops: async (params: ShopSearchParams): Promise<ShopsResponse> => {
    const queryString = parseQueryParams(params)
    const response = await shopApi.get<ShopsResponse>(`/Shops?${queryString}`)
    return response.data
  },

  // Get shop by ID
  getShop: async (shopId: string): Promise<Shop> => {
    const response = await shopApi.get<ShopDetailResponse>(`/Shops/${shopId}`)
    return response.data.result
  },

  // Delete shop
  deleteShop: async (shopId: string): Promise<boolean> => {
    const response = await shopApi.delete<ShopDetailResponse>(`/Shops/${shopId}`)
    return response.data.result !== null
  },

  // Get pending shops for approval
  getPendingShops: async (params: {
    pageNumber: number
    pageSize: number
  }): Promise<PendingShopsResponse> => {
    const queryString = parseQueryParams(params)
    const response = await shopApi.get<PendingShopsResponse>(
      `shopapprovals/pending?${queryString}`
    )
    return response.data
  },

  // Approve or reject shop
  approveShop: async (shopId: string, data: ShopApprovalRequest): Promise<boolean> => {
    const response = await shopApi.post<ShopApprovalResponse>(
      `/shopapprovals/${shopId}/approve`,
      data
    )
    return response.data.result
  },
}