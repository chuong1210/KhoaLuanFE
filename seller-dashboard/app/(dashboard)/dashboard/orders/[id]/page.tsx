"use client"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService } from "@/services/order-service"
import type { OrderStatus } from "@/types/order"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Printer } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => orderService.getOrderById(params.id),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateOrderStatus(params.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", params.id] })
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] })
      toast.success("Đã cập nhật trạng thái đơn hàng")
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái")
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>Không thể tải thông tin đơn hàng</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng #{order.orderId}</h2>
            <p className="text-muted-foreground">Ngày tạo: {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          In hóa đơn
        </Button>
      </div>

      {/* Order Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật trạng thái</CardTitle>
          <CardDescription>Thay đổi trạng thái đơn hàng theo quy trình xử lý</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {order.status === "AWAITING_PAYMENT" && (
            <Button onClick={() => updateStatusMutation.mutate("PROCESSING")}>
              <Package className="mr-2 h-4 w-4" />
              Xử lý đơn hàng
            </Button>
          )}
          {order.status === "PROCESSING" && (
            <Button onClick={() => updateStatusMutation.mutate("SHIPPED")}>
              <Truck className="mr-2 h-4 w-4" />
              Đã giao cho vận chuyển
            </Button>
          )}
          {order.status === "SHIPPED" && (
            <Button onClick={() => updateStatusMutation.mutate("DELIVERED")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Đã giao hàng
            </Button>
          )}
          {order.status === "DELIVERED" && (
            <Button onClick={() => updateStatusMutation.mutate("COMPLETED")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Hoàn thành
            </Button>
          )}
          {(order.status === "AWAITING_PAYMENT" || order.status === "PROCESSING") && (
            <Button variant="destructive" onClick={() => updateStatusMutation.mutate("CANCELLED")}>
              <XCircle className="mr-2 h-4 w-4" />
              Hủy đơn hàng
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tên khách hàng</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</p>
              <p className="font-medium">{order.shippingAddress}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mã đơn hàng</p>
              <p className="font-medium">#{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <Badge className="mt-1">{order.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>
              <p className="text-2xl font-bold">{formatPrice(order.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
          <CardDescription>Danh sách các sản phẩm khách hàng đã đặt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded border">
                    <img
                      src={item.productImage || "/placeholder.svg?height=64&width=64"}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <p className="text-lg font-semibold">Tổng cộng</p>
              <p className="text-2xl font-bold">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
