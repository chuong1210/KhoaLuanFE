"use client"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { voucherService } from "@/services/voucher-service"
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
import { Plus, MoreHorizontal, Edit, Trash2, Eye, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function VouchersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: vouchers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherService.getVouchers,
  })

  const deleteVoucherMutation = useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] })
      toast.success("Đã xóa voucher")
    },
    onError: () => {
      toast.error("Không thể xóa voucher")
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const getStatusBadge = (voucher: any) => {
    const now = new Date()
    const endDate = new Date(voucher.endDate)

    if (voucher.status === "inactive") {
      return <Badge variant="secondary">Không hoạt động</Badge>
    }
    if (endDate < now || voucher.used >= voucher.quantity) {
      return <Badge variant="destructive">Hết hạn</Badge>
    }
    return <Badge className="bg-success text-white">Đang hoạt động</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Voucher</h2>
          <p className="text-muted-foreground">Tạo và quản lý các voucher giảm giá cho cửa hàng</p>
        </div>
        <Button onClick={() => router.push("/dashboard/vouchers/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo voucher mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng voucher</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Ticket className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers?.filter((v) => v.status === "active" && new Date(v.endDate) > new Date()).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã sử dụng</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers?.reduce((sum, v) => sum + v.used, 0) || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Voucher</CardTitle>
          <CardDescription>Quản lý các voucher giảm giá của cửa hàng</CardDescription>
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
              <AlertDescription>Không thể tải danh sách voucher</AlertDescription>
            </Alert>
          ) : vouchers && vouchers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tên voucher</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Đã dùng/Tổng</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded border">
                        <img
                          src={voucher.image || "/placeholder.svg?height=48&width=48"}
                          alt={voucher.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{voucher.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{voucher.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {voucher.discountType === "percentage" ? `${voucher.discount}%` : formatPrice(voucher.discount)}
                    </TableCell>
                    <TableCell>
                      {voucher.used}/{voucher.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(voucher.startDate)}</p>
                        <p className="text-muted-foreground">{formatDate(voucher.endDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/vouchers/${voucher.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/vouchers/${voucher.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteVoucherMutation.mutate(voucher.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Chưa có voucher nào</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => router.push("/dashboard/vouchers/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo voucher mới
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
