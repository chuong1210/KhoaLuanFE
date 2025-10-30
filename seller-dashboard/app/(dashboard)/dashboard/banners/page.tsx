"use client"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bannerService } from "@/services/banner-service"
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
import { Plus, MoreHorizontal, Edit, Trash2, Eye, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function BannersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: banners,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerService.getBanners,
  })

  const deleteBannerMutation = useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
      toast.success("Đã xóa banner")
    },
    onError: () => {
      toast.error("Không thể xóa banner")
    },
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Banner</h2>
          <p className="text-muted-foreground">Tạo và quản lý các banner quảng cáo</p>
        </div>
        <Button onClick={() => router.push("/dashboard/banners/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo banner mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Banner</CardTitle>
          <CardDescription>Quản lý các banner quảng cáo của cửa hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể tải danh sách banner</AlertDescription>
            </Alert>
          ) : banners && banners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Thời gian hiển thị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="h-16 w-32 overflow-hidden rounded border">
                        <img
                          src={banner.image || "/placeholder.svg?height=64&width=128"}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">#{banner.order}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(banner.startDate)}</p>
                        <p className="text-muted-foreground">{formatDate(banner.endDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {banner.status === "active" ? (
                        <Badge className="bg-success text-white">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Không hoạt động</Badge>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/banners/${banner.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/banners/${banner.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteBannerMutation.mutate(banner.id)}
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
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chưa có banner nào</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => router.push("/dashboard/banners/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo banner mới
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
