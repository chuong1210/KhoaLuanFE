import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as orderApi from "@/lib/api/orders"
import { toast } from "sonner"

export function useOrders(page = 1, limit = 10, filters?: any) {
  return useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: () => orderApi.getOrders(page, limit, filters),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Trạng thái đơn hàng đã được cập nhật")
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật trạng thái đơn hàng")
    },
  })
}
