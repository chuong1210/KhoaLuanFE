import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as shopApi from "@/lib/api/shops"
import type { Shop } from "@/types"
import { toast } from "sonner"

export function useShops(page = 1, limit = 10, filters?: any) {
  return useQuery({
    queryKey: ["shops", page, limit, filters],
    queryFn: () => shopApi.getShops(page, limit, filters),
  })
}

export function useShop(id: string) {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: () => shopApi.getShopById(id),
    enabled: !!id,
  })
}

export function useCreateShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Shop>) => shopApi.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Cửa hàng đã được tạo thành công")
    },
    onError: () => {
      toast.error("Lỗi khi tạo cửa hàng")
    },
  })
}

export function useUpdateShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shop> }) => shopApi.updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Cửa hàng đã được cập nhật thành công")
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật cửa hàng")
    },
  })
}

export function useDeleteShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => shopApi.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Cửa hàng đã được xóa thành công")
    },
    onError: () => {
      toast.error("Lỗi khi xóa cửa hàng")
    },
  })
}

export function useApproveShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => shopApi.approveShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Cửa hàng đã được phê duyệt")
    },
    onError: () => {
      toast.error("Lỗi khi phê duyệt cửa hàng")
    },
  })
}

export function useRejectShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) => shopApi.rejectShop(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Cửa hàng đã bị từ chối")
    },
    onError: () => {
      toast.error("Lỗi khi từ chối cửa hàng")
    },
  })
}
