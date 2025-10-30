"use client"
import { useQuery } from "@tanstack/react-query"
import { transferService } from "@/services/transfer-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, MapPin, Clock, DollarSign } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function TransfersPage() {
  const {
    data: progressTransfers,
    isLoading: isLoadingProgress,
    error: errorProgress,
  } = useQuery({
    queryKey: ["progressTransfers"],
    queryFn: transferService.getProgressTransfers,
  })

  const {
    data: offlineTransactions,
    isLoading: isLoadingOffline,
    error: errorOffline,
  } = useQuery({
    queryKey: ["offlineTransactions"],
    queryFn: transferService.getOfflineTransactions,
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

  const getTransferStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", className: "bg-warning text-white" },
      in_transit: { label: "Đang vận chuyển", className: "bg-secondary text-white" },
      delivered: { label: "Đã giao", className: "bg-success text-white" },
      failed: { label: "Thất bại", className: "bg-destructive text-white" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Vận chuyển</h2>
        <p className="text-muted-foreground">Theo dõi tiến trình vận chuyển và giao dịch offline</p>
      </div>

      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Tiến trình vận chuyển</TabsTrigger>
          <TabsTrigger value="offline">Giao dịch Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tiến trình vận chuyển
              </CardTitle>
              <CardDescription>Theo dõi trạng thái vận chuyển của các đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProgress ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : errorProgress ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>Không thể tải tiến trình vận chuyển</AlertDescription>
                </Alert>
              ) : progressTransfers && progressTransfers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Vị trí hiện tại</TableHead>
                      <TableHead>Thời gian dự kiến</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Cập nhật lần cuối</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">#{transfer.orderId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.currentLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(transfer.estimateTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTransferStatusBadge(transfer.status)}</TableCell>
                        <TableCell>{formatDate(transfer.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Truck className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có đơn hàng nào đang vận chuyển</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giao dịch Offline
              </CardTitle>
              <CardDescription>Danh sách các giao dịch thanh toán offline</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOffline ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : errorOffline ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>Không thể tải giao dịch offline</AlertDescription>
                </Alert>
              ) : offlineTransactions && offlineTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Phương thức thanh toán</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offlineTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">#{transaction.orderId}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell className="font-medium">{formatPrice(transaction.amount)}</TableCell>
                        <TableCell>
                          {transaction.status === "completed" ? (
                            <Badge className="bg-success text-white">Hoàn thành</Badge>
                          ) : transaction.status === "pending" ? (
                            <Badge variant="secondary">Đang xử lý</Badge>
                          ) : (
                            <Badge variant="destructive">Thất bại</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có giao dịch offline nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
