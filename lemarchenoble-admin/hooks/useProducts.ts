import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as productApi from "@/lib/api/products"
import type { Product } from "@/types"
import { toast } from "sonner"

export function useProducts(page = 1, limit = 10, filters?: any) {
  return useQuery({
    queryKey: ["products", page, limit, filters],
    queryFn: () => productApi.getProducts(page, limit, filters),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Product>) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Sản phẩm đã được tạo thành công")
    },
    onError: () => {
      toast.error("Lỗi khi tạo sản phẩm")
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Sản phẩm đã được cập nhật thành công")
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật sản phẩm")
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Sản phẩm đã được xóa thành công")
    },
    onError: () => {
      toast.error("Lỗi khi xóa sản phẩm")
    },
  })
}
