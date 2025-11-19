"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Components
import {
  Card,
  CardContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Ticket,
  RefreshCw,
  Search,
  Copy,
  CalendarRange,
  Percent,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import type { Voucher } from "@/types/voucher";

export default function VouchersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- States cho bộ lọc ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ACTIVE, EXPIRED, UPCOMING

  // --- Queries ---
  const {
    data: vouchers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherService.getVouchers,
  });

  // --- Mutations ---
  const deleteVoucherMutation = useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("Đã xóa voucher thành công");
    },
    onError: () => {
      toast.error("Không thể xóa voucher");
    },
  });

  // --- Helpers ---
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép mã voucher");
  };

  // --- Logic lọc dữ liệu ---
  const getFilteredVouchers = () => {
    if (!vouchers) return [];
    const now = new Date();

    return vouchers.filter((v) => {
      // Filter by Search
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.voucher_code.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter by Status
      const startDate = new Date(v.start_date);
      const endDate = new Date(v.end_date);

      if (filterStatus === "ALL") return true;
      if (filterStatus === "ACTIVE")
        return v.is_active && startDate <= now && endDate > now && v.used_quantity < v.total_quantity;
      if (filterStatus === "UPCOMING")
        return startDate > now;
      if (filterStatus === "EXPIRED")
        return endDate < now || !v.is_active || v.used_quantity >= v.total_quantity;

      return true;
    });
  };

  const filteredVouchers = getFilteredVouchers();

  // --- Logic thống kê ---
  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => {
      const now = new Date();
      return v.is_active && new Date(v.start_date) <= now && new Date(v.end_date) > now;
    }).length,
    used: vouchers.reduce((acc, v) => acc + v.used_quantity, 0),
  };

  return (
    <div className="min-h-screen space-y-8 p-6 bg-gray-50/30">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Quản lý Voucher
          </h2>
          <p className="text-muted-foreground mt-1">
            Tạo mã giảm giá để thúc đẩy doanh số bán hàng.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            onClick={() => router.push("/dashboard/vouchers/create")}
            className="shadow-md hover:shadow-lg transition-all text-white bg-gradient-to-r from-orange-500 to-amber-500 border-0"
          >
            <Plus className="mr-2 h-5 w-5" />
            Tạo Voucher Mới
          </Button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Tổng số Voucher"
          value={stats.total}
          icon={<Ticket className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatsCard
          title="Đang hoạt động"
          value={stats.active}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatsCard
          title="Lượt đã sử dụng"
          value={stats.used}
          icon={<Ticket className="h-6 w-6 text-white" />} // Reuse icon or use different one
          color="bg-orange-500"
        />
      </div>

      {/* --- Main Content --- */}
      <Card className="border border-orange-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl text-orange-800">Danh sách mã giảm giá</CardTitle>

            {/* Filters Toolbar */}
            <div className="flex flex-1 md:max-w-md gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc mã..."
                  className="pl-9 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] border-gray-200">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="UPCOMING">Sắp diễn ra</SelectItem>
                  <SelectItem value="EXPIRED">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-orange-50/50" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>Không thể tải danh sách voucher</p>
            </div>
          ) : filteredVouchers.length > 0 ? (
            <Table>
              <TableHeader className="bg-orange-50/40">
                <TableRow>
                  <TableHead className="font-semibold text-orange-900">Thông tin Voucher</TableHead>
                  <TableHead className="font-semibold text-orange-900">Giảm giá</TableHead>
                  <TableHead className="font-semibold text-orange-900">Lượt dùng</TableHead>
                  <TableHead className="font-semibold text-orange-900">Thời gian</TableHead>
                  <TableHead className="font-semibold text-orange-900">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-orange-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <VoucherRow
                    key={voucher.id}
                    voucher={voucher}
                    onDelete={() => deleteVoucherMutation.mutate(voucher.id)}
                    onCopy={copyToClipboard}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    router={router}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-orange-50 p-4 rounded-full mb-4">
                <Ticket className="h-10 w-10 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Chưa có voucher nào</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {searchTerm || filterStatus !== "ALL"
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc của bạn."
                  : "Hãy tạo mã giảm giá đầu tiên để thu hút khách hàng."}
              </p>
              {!searchTerm && filterStatus === "ALL" && (
                <Button
                  onClick={() => router.push("/dashboard/vouchers/create")}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Tạo voucher ngay
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Sub-Components for Cleaner Code ---

function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-gray-200`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function VoucherRow({ voucher, onDelete, onCopy, formatPrice, formatDate, router }: any) {
  // Logic tính trạng thái
  const now = new Date();
  const startDate = new Date(voucher.start_date);
  const endDate = new Date(voucher.end_date);
  const percentUsed = (voucher.used_quantity / voucher.total_quantity) * 100;

  let statusBadge;
  if (!voucher.is_active) {
    statusBadge = <Badge variant="secondary">Đã tắt</Badge>;
  } else if (startDate > now) {
    statusBadge = <Badge className="bg-blue-500 hover:bg-blue-600">Sắp diễn ra</Badge>;
  } else if (endDate < now) {
    statusBadge = <Badge variant="destructive" className="bg-gray-500 hover:bg-gray-600">Hết hạn</Badge>;
  } else if (voucher.used_quantity >= voucher.total_quantity) {
    statusBadge = <Badge variant="destructive">Hết lượt</Badge>;
  } else {
    statusBadge = <Badge className="bg-green-500 hover:bg-green-600 border-0">Đang hoạt động</Badge>;
  }

  return (
    <TableRow className="group hover:bg-orange-50/30 transition-colors">
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors">
            {voucher.name}
          </span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => onCopy(voucher.voucher_code)}
                    className="flex items-center gap-1.5 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 cursor-pointer hover:bg-orange-100 hover:text-orange-700 hover:border-orange-200 transition-colors"
                  >
                    {voucher.voucher_code}
                    <Copy className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>Sao chép mã</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-gray-500">
              {voucher.applies_to_type === "ORDER_TOTAL" ? "Đơn hàng" : "Vận chuyển"}
            </Badge>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-orange-100 text-orange-600">
            {voucher.discount_type === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">
              {voucher.discount_type === "PERCENTAGE"
                ? `${voucher.discount_value}%`
                : formatPrice(voucher.discount_value)}
            </span>
            {voucher.discount_type === "PERCENTAGE" && Number(voucher.max_discount_amount) > 0 && (
              <span className="text-xs text-muted-foreground">Tối đa: {formatPrice(voucher.max_discount_amount)}</span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="w-[120px] space-y-1">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>{voucher.used_quantity}</span>
            <span className="text-gray-400">/ {voucher.total_quantity}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarRange className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col text-xs">
            <span>{formatDate(voucher.start_date)}</span>
            <span className="text-gray-400">đến {formatDate(voucher.end_date)}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>{statusBadge}</TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/dashboard/vouchers/${voucher.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/vouchers/${voucher.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
                  onDelete();
                }
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa voucher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}