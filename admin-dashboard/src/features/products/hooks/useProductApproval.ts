// features/products/hooks/useProductApproval.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/productsApi'
import { shopsService } from '@/features/shops/services/shopsApi'
import type { ProductSearchParams, Product } from '../types'

export const approvalKeys = {
  all: ['product-approval'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
  pendingList: (params: ProductSearchParams) => [...approvalKeys.pending(), params] as const,
  byShop: (shopId: string) => [...approvalKeys.all, 'by-shop', shopId] as const,
  stats: () => [...approvalKeys.all, 'stats'] as const,
}

// Get pending products
export function usePendingProducts(params: ProductSearchParams = { page: 1, limit: 50 }) {
  return useQuery({
    queryKey: approvalKeys.pendingList(params),
    queryFn: () => productsService.getPendingProducts(params),
  })
}

// Get pending products grouped by shop
export function usePendingProductsByShop(params: ProductSearchParams = { page: 1, limit: 100 }) {
  return useQuery({
    queryKey: approvalKeys.stats(),
    queryFn: async () => {
      // Get all pending products
      const result = await productsService.getPendingProducts(params)
      
      // Group by shop_id
      const byShop = result.data.reduce((acc, product) => {
        const shopId = product.shop_id
        if (!acc[shopId]) {
          acc[shopId] = {
            shop_id: shopId,
            shop_name: shopId, // Will be enriched with actual shop name
            pending_count: 0,
            products: [],
          }
        }
        acc[shopId].pending_count++
        acc[shopId].products.push(product)
        return acc
      }, {} as Record<string, any>)
      
      return {
        total_pending: result.totalElements,
        shops_with_pending: Object.keys(byShop).length,
        by_shop: Object.values(byShop),
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
        }
      }
    },
  })
}

// Approve product
export function useApproveProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, approve }: { productId: string; approve: boolean }) =>
      productsService.approveProduct(productId, approve),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      const message = variables.approve
        ? 'Duyệt sản phẩm thành công!'
        : 'Từ chối sản phẩm thành công!'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

// Batch approve multiple products
export function useBatchApproveProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productIds, approve }: { productIds: string[]; approve: boolean }) => {
      const results = await Promise.allSettled(
        productIds.map(id => productsService.approveProduct(id, approve))
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      return { successful, failed, total: productIds.length }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      
      const action = variables.approve ? 'duyệt' : 'từ chối'
      if (result.failed === 0) {
        toast.success(`${action} thành công ${result.successful} sản phẩm!`)
      } else {
        toast.warning(`${action} ${result.successful} sản phẩm, ${result.failed} thất bại`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}