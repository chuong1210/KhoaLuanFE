import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsService } from '../services/productsApi'
import type { Product, ProductSearchParams } from '../types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductSearchParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  skus: () => [...productKeys.all, 'sku'] as const,
  sku: (id: string) => [...productKeys.skus(), id] as const,
}

export function useProducts(params: ProductSearchParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getProducts(params),
  })
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productsService.getProductDetail(productId),
    enabled: !!productId,
  })
}

export function useProductSku(skuId: string) {
  return useQuery({
    queryKey: productKeys.sku(skuId),
    queryFn: () => productsService.getSku(skuId),
    enabled: !!skuId,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Product>) => productsService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Tạo sản phẩm thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Cập nhật sản phẩm thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productsService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Xóa sản phẩm thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`)
    },
  })
}
