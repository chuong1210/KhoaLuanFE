"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/features/policy/services/policy-service";
import {
  Policy,
  POLICY_TYPES,
  PolicyType,
} from "@/features/policy/types/policy";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Shadcn UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Rocket,
  CheckCircle2,
  History,
  Filter,
  AlertCircle,
} from "lucide-react";

export default function AdminPoliciesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Queries
  const {
    data: policiesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-policies", page, selectedType],
    queryFn: () =>
      policyService.getPolicies({
        pageNumber: page,
        pageSize: 10,
        policyType: selectedType === "ALL" ? undefined : selectedType,
        shopId: undefined, // undefined để lấy policy hệ thống (hoặc null tùy logic BE)
      }),
  });

  const policies: Policy[] = policiesData?.result || [];
  const pagination = policiesData?.extra;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: policyService.deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-policies"] });
      toast.success("Đã xóa chính sách thành công");
      setDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi xóa"),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      policyService.publishPolicy(id, {
        effectiveDate: new Date(date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-policies"] });
      toast.success("Đã xuất bản chính sách", {
        description: "Chính sách mới đã được áp dụng toàn hệ thống.",
      });
      setPublishId(null);
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi xuất bản"),
  });

  // Helpers
  const getTypeLabel = (type: string) =>
    POLICY_TYPES.find((t) => t.value === type)?.label || type;

  const getTypeColor = (type: string) =>
    POLICY_TYPES.find((t) => t.value === type)?.color || "bg-gray-500";

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý Chính sách Hệ thống
          </h1>
          <p className="text-slate-500 mt-2">
            Quản lý các điều khoản, chính sách bảo mật và quy định chung của sàn
            thương mại điện tử.
          </p>
        </div>
        <Button
          onClick={() => router.push("policies/create")}
          className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-md shadow-orange-300/40 transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo Chính sách Mới
        </Button>
      </div>

      {/* Tabs Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs
            value={selectedType}
            onValueChange={(v) => {
              setSelectedType(v);
              setPage(1);
            }}
            className="w-full max-w-4xl"
          >
            <TabsList className="bg-white border h-auto flex-wrap justify-start p-1 gap-1">
              <TabsTrigger
                value="ALL"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                Tất cả
              </TabsTrigger>
              {POLICY_TYPES.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table Content */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-slate-50/40 border-b py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-base font-medium">
                  Danh sách phiên bản
                </CardTitle>
              </div>
              <div className="text-xs text-slate-500">
                Hiển thị {policies.length} kết quả
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
              </div>
            ) : policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="h-12 w-12 mb-3 opacity-20" />
                <p>Chưa có chính sách nào.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Tên chính sách</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phiên bản</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày hiệu lực</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">
                            {policy.policyName}
                          </span>
                          <span className="text-xs text-slate-500">
                            Cập nhật:{" "}
                            {policy.modifiedDate
                              ? format(
                                  new Date(policy.modifiedDate),
                                  "dd/MM/yyyy"
                                )
                              : format(
                                  new Date(policy.createdDate),
                                  "dd/MM/yyyy"
                                )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="active"
                          className={`${getTypeColor(
                            policy.policyType
                          )} bg-opacity-10 text-opacity-100 border-0`}
                        >
                          {getTypeLabel(policy.policyType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="expired" className="font-mono">
                          v{policy.version}.0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.isActive ? (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Hoạt động
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-2" />{" "}
                            Bản nháp
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {policy.effectiveDate ? (
                          format(new Date(policy.effectiveDate), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/policies/${policy.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>

                            {!policy.isActive && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/policies/${policy.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setPublishId(policy.id)}
                                  className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                >
                                  <Rocket className="mr-2 h-4 w-4" /> Xuất bản
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(policy.id)}
                                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa bản
                                  nháp
                                </DropdownMenuItem>
                              </>
                            )}

                            {policy.isActive && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/policies/create?type=${policy.policyType}`
                                  )
                                }
                              >
                                <History className="mr-2 h-4 w-4" /> Tạo phiên
                                bản mới
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản nháp này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bản nháp sẽ bị xóa vĩnh viễn
              khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!publishId}
        onOpenChange={(open) => !open && setPublishId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuất bản Chính sách</DialogTitle>
            <DialogDescription>
              Chính sách này sẽ được kích hoạt ngay lập tức hoặc theo ngày hiệu
              lực bạn chọn. Các phiên bản cũ sẽ bị vô hiệu hóa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="date">Ngày hiệu lực</Label>
            <Input
              id="date"
              type="date"
              className="mt-2"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishId(null)}>
              Đóng
            </Button>
            <Button
              onClick={() =>
                publishId &&
                publishMutation.mutate({ id: publishId, date: publishDate })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xác nhận Xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
