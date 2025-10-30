"use client"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { policyService } from "@/services/policy-service"
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
import { Plus, MoreHorizontal, Edit, Trash2, Eye, FileText } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PoliciesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: policies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["policies"],
    queryFn: policyService.getPolicies,
  })

  const deletePolicyMutation = useMutation({
    mutationFn: policyService.deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] })
      toast.success("Đã xóa chính sách")
    },
    onError: () => {
      toast.error("Không thể xóa chính sách")
    },
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Chính sách</h2>
          <p className="text-muted-foreground">Tạo và quản lý các chính sách của cửa hàng</p>
        </div>
        <Button onClick={() => router.push("/dashboard/policies/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo chính sách mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Chính sách</CardTitle>
          <CardDescription>Quản lý các chính sách của cửa hàng</CardDescription>
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
              <AlertDescription>Không thể tải danh sách chính sách</AlertDescription>
            </Alert>
          ) : policies && policies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{policy.version}</Badge>
                    </TableCell>
                    <TableCell>
                      {policy.status === "active" ? (
                        <Badge className="bg-success text-white">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Không hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(policy.createdAt)}</TableCell>
                    <TableCell>{formatDate(policy.updatedAt)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/policies/${policy.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/policies/${policy.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deletePolicyMutation.mutate(policy.id)}
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
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chưa có chính sách nào</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => router.push("/dashboard/policies/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo chính sách mới
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
