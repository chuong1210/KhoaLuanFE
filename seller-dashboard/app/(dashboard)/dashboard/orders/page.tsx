"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService } from "@/services/order-service"
import type { OrderStatus } from "@/types/order"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all")

  // Fetch all orders
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopOrders"],
    queryFn: orderService.getShopOrders,
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] })
      toast.success("Đã cập nhật trạng thái đơn hàng")
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái")
    },
  })

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      AWAITING_PAYMENT: { label: "Chờ thanh toán", icon: Clock, className: "bg-warning text-white" },
      PROCESSING: { label: "Đang xử lý", icon: Package, className: "bg-secondary text-white" },
      SHIPPED: { label: "Đang giao", icon: Truck, className: "bg-accent text-white" },
      DELIVERED: { label: "Đã giao", icon: CheckCircle, className: "bg-success text-white" },
      COMPLETED: { label: "Hoàn thành", icon: CheckCircle, className: "bg-success text-white" },
      CANCELLED: { label: "Đã hủy", icon: XCircle, className: "bg-muted text-muted-foreground" },
      REFUNDED: { label: "Đã hoàn tiền", icon: DollarSign, className: "bg-destructive text-white" },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN")
  }

  const filteredOrders = activeTab === "all" ? orders : orders?.filter((order) => order.status === activeTab)

  const getOrderCount = (status: OrderStatus | "all") => {
    if (status === "all") return orders?.length || 0
    return orders?.filter((order) => order.status === status).length || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Đơn hàng</h2>
          <p className="text-muted-foreground">Xem và xử lý các đơn hàng của cửa hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderCount("AWAITING_PAYMENT")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Package className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderCount("PROCESSING")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
            <Truck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderCount("SHIPPED")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderCount("COMPLETED")}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus | "all")}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-8">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="AWAITING_PAYMENT">Chờ thanh toán</TabsTrigger>
          <TabsTrigger value="PROCESSING">Đang xử lý</TabsTrigger>
          <TabsTrigger value="SHIPPED">Đang giao</TabsTrigger>
          <TabsTrigger value="DELIVERED">Đã giao</TabsTrigger>
          <TabsTrigger value="COMPLETED">Hoàn thành</TabsTrigger>
          <TabsTrigger value="CANCELLED">Đã hủy</TabsTrigger>
          <TabsTrigger value="REFUNDED">Hoàn tiền</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? "Tất cả đơn hàng của cửa hàng"
                  : `Đơn hàng ${getStatusBadge(activeTab as OrderStatus).props.children[1]}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>Không thể tải danh sách đơn hàng</AlertDescription>
                </Alert>
              ) : filteredOrders && filteredOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Địa chỉ giao hàng</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{order.shippingAddress}</TableCell>
                        <TableCell className="font-medium">{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Cập nhật trạng thái</DropdownMenuLabel>
                              {order.status === "AWAITING_PAYMENT" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({ orderId: order.id, status: "PROCESSING" })
                                  }
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Xử lý đơn hàng
                                </DropdownMenuItem>
                              )}
                              {order.status === "PROCESSING" && (
                                <DropdownMenuItem
                                  onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "SHIPPED" })}
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Đã giao cho vận chuyển
                                </DropdownMenuItem>
                              )}
                              {order.status === "SHIPPED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({ orderId: order.id, status: "DELIVERED" })
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Đã giao hàng
                                </DropdownMenuItem>
                              )}
                              {order.status === "DELIVERED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({ orderId: order.id, status: "COMPLETED" })
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Hoàn thành
                                </DropdownMenuItem>
                              )}
                              {(order.status === "AWAITING_PAYMENT" || order.status === "PROCESSING") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({ orderId: order.id, status: "CANCELLED" })
                                    }
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Hủy đơn hàng
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">Không có đơn hàng nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
