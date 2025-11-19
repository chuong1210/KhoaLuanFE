"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/services/policy-service";
import { Policy, POLICY_TYPES, PolicyType } from "@/types/policy";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// UI Components
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  Plus, MoreHorizontal, Edit, Trash2, Eye,
  FileText, Rocket, CheckCircle2, History, Filter
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function PoliciesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const shopId = useAppSelector((state) => state.shop.data?.id);

  // State filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // State Dialogs
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // --- QUERIES ---
  const { data: policiesData, isLoading } = useQuery({
    queryKey: ["policies", page, selectedType],
    queryFn: () => policyService.getPolicies({
      pageNumber: page,
      pageSize: 10,
      shopId: shopId,
      policyType: selectedType === "ALL" ? undefined : selectedType,
    }),
  });

  const policies: Policy[] = policiesData?.result || [];
  const pagination = policiesData?.extra;

  // --- MUTATIONS ---
  const deleteMutation = useMutation({
    mutationFn: policyService.deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Đã xóa chính sách thành công");
      setDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi xóa"),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      policyService.publishPolicy(id, { effectiveDate: new Date(date).toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Đã xuất bản chính sách", {
        description: "Chính sách mới đã được áp dụng."
      });
      setPublishId(null);
    },
    onError: (err: any) => toast.error(err.message || "Lỗi khi xuất bản"),
  });

  // --- HELPERS ---
  const getTypeLabel = (type: PolicyType) =>
    POLICY_TYPES.find(t => t.value === type)?.label || type;

  const getTypeColor = (type: PolicyType) =>
    POLICY_TYPES.find(t => t.value === type)?.color || "bg-gray-500";

  return (
    <div className="min-h-screen space-y-8 p-6" style={{ backgroundColor: "#FFF0E0" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FFB000]">
            Quản lý Chính sách
          </h2>
          <p className="text-[#D35400] mt-2 font-medium">
            Thiết lập các quy định, điều khoản và chính sách vận hành cho cửa hàng.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/policies/create")}
          className="h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
            color: "white"
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Soạn chính sách mới
        </Button>
      </div>

      {/* Filter & Stats Section */}
      <div className="grid gap-6">
        <Tabs
          defaultValue="ALL"
          value={selectedType}
          onValueChange={(v) => { setSelectedType(v); setPage(1); }}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white border border-[#FFB38A] p-1 h-auto flex-wrap justify-start gap-1">
              <TabsTrigger
                value="ALL"
                className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white"
              >
                Tất cả
              </TabsTrigger>
              {POLICY_TYPES.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Helper info */}
            <div className="hidden md:flex items-center gap-2 text-sm text-[#E65100]">
              <Filter className="h-4 w-4" />
              <span>Hiển thị: <b>{pagination?.totalElements || 0}</b> kết quả</span>
            </div>
          </div>
        </Tabs>

        {/* Main Content Card */}
        <Card className="border-2 shadow-md overflow-hidden" style={{ borderColor: "#FFB38A" }}>
          <CardHeader className="pb-4" style={{
            background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #FFB38A"
          }}>
            <CardTitle className="text-[#E65100] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Danh sách phiên bản
            </CardTitle>
            <CardDescription className="text-[#D35400]">
              Quản lý các bản nháp và các phiên bản đang hoạt động.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-orange-100/50" />
                ))}
              </div>
            ) : policies.length > 0 ? (
              <Table>
                <TableHeader className="bg-[#FFF0E0]">
                  <TableRow className="hover:bg-[#FFF0E0]">
                    <TableHead className="text-[#E65100] font-bold">Tên chính sách</TableHead>
                    <TableHead className="text-[#E65100] font-bold">Loại</TableHead>
                    <TableHead className="text-[#E65100] font-bold">Phiên bản</TableHead>
                    <TableHead className="text-[#E65100] font-bold">Trạng thái</TableHead>
                    <TableHead className="text-[#E65100] font-bold">Ngày hiệu lực</TableHead>
                    <TableHead className="text-right text-[#E65100] font-bold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id} className="hover:bg-orange-50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex flex-col">
                          <span className="text-base font-semibold">{policy.policyName}</span>
                          <span className="text-xs text-muted-foreground">
                            Tạo: {format(new Date(policy.createdDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${getTypeColor(policy.policyType)} text-white hover:opacity-90 border-0`}
                        >
                          {getTypeLabel(policy.policyType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#FFB38A] text-[#E65100] bg-[#FFF0E0]">
                          v{policy.version}.0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.isActive ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium px-2 py-1 rounded-full bg-green-50 w-fit">
                            <CheckCircle2 className="h-4 w-4" />
                            Hoạt động
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-500 font-medium px-2 py-1 rounded-full bg-gray-100 w-fit border border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Bản nháp
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {policy.effectiveDate
                          ? format(new Date(policy.effectiveDate), "dd/MM/yyyy", { locale: vi })
                          : <span className="italic text-gray-400">Chưa thiết lập</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[#E65100] hover:text-[#FF6A00] hover:bg-[#FFF0E0]">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 border-[#FFB38A]">
                            <DropdownMenuLabel className="text-[#E65100]">Tùy chọn</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => router.push(`/dashboard/policies/${policy.id}/view`)}>
                              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>

                            {/* Logic: Chỉ sửa/xóa/publish được bản Draft */}
                            {!policy.isActive && (
                              <>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/policies/${policy.id}/edit`)}>
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
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa bản nháp
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Nếu Active, cho phép xem lịch sử hoặc tạo bản mới */}
                            {policy.isActive && (
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/policies/create?type=${policy.policyType}`)}>
                                <History className="mr-2 h-4 w-4" /> Tạo phiên bản mới
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
                <div className="bg-[#FFF0E0] p-4 rounded-full mb-4">
                  <FileText className="h-12 w-12 text-[#FF8A33]" />
                </div>
                <h3 className="text-xl font-bold text-[#E65100] mb-2">Chưa có dữ liệu</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  {selectedType !== 'ALL'
                    ? `Chưa có chính sách nào thuộc loại "${getTypeLabel(selectedType as PolicyType)}".`
                    : "Bạn chưa tạo bất kỳ chính sách nào cho cửa hàng."}
                </p>
                <Button
                  variant="outline"
                  className="border-[#FF8A33] text-[#E65100] hover:bg-[#FFF0E0]"
                  onClick={() => router.push("/dashboard/policies/create")}
                >
                  Tạo ngay bây giờ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls would go here */}
      </div>

      {/* --- DIALOGS --- */}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Xóa bản nháp chính sách?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bản nháp này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Dialog */}
      <Dialog open={!!publishId} onOpenChange={(open) => !open && setPublishId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E65100] flex items-center gap-2">
              <Rocket className="h-5 w-5" /> Xuất bản Chính sách
            </DialogTitle>
            <DialogDescription>
              Chính sách này sẽ được kích hoạt và thay thế phiên bản cũ (nếu có).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-[#D35400] font-semibold">Ngày hiệu lực</Label>
              <Input
                id="date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="border-[#FFB38A] focus-visible:ring-[#FF6A00]"
              />
              <p className="text-xs text-muted-foreground">Mặc định là hôm nay.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishId(null)}>Đóng</Button>
            <Button
              onClick={() => publishId && publishMutation.mutate({ id: publishId, date: publishDate })}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}
            >
              {publishMutation.isPending ? "Đang xử lý..." : "Xác nhận xuất bản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}