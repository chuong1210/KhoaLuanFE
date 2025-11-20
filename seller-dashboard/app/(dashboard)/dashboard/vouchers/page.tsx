"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAppSelector } from "@/store/hooks";
import { useDebounce } from "use-debounce"; // Cần cài: npm install use-debounce hoặc tự viết hook

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  Truck,
  ShoppingBag,
  FilterX,
  ArrowUpDown,
} from "lucide-react";

export default function VouchersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // --- Filter States ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500); // Delay search 500ms

  // Các bộ lọc
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL"); // PERCENTAGE | FIXED_AMOUNT
  const [sortBy, setSortBy] = useState<string>("created_at_desc");

  // --- Data Fetching (Server-side Filtering) ---
  // Xây dựng params gửi lên server
  const queryParams = {
    page,
    page_size: pageSize,
    shop_id: shopId!,
    name: debouncedSearch || undefined, // Tìm kiếm
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    discount_type: typeFilter !== "ALL" ? typeFilter : undefined,
    sort_by: sortBy,
  };

  const {
    data: response, // API trả về { result: { data: [], pagination: {} } }
    isLoading,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: ["vouchers", queryParams],
    queryFn: () => voucherService.getVouchers(queryParams),
    placeholderData: keepPreviousData, // Giữ data cũ khi chuyển trang để ko bị nháy
    enabled: !!shopId, // Chỉ fetch khi có shopId
  });

  const vouchers = response?.result?.data || [];
  const pagination = response?.result?.pagination || { total_pages: 1, total_items: 0 };

  // --- Mutations ---
  const deleteVoucherMutation = useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("Đã xóa voucher thành công");
    },
    onError: () => toast.error("Không thể xóa voucher"),
  });

  // --- Handlers ---
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã: " + code);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSortBy("created_at_desc");
    setPage(1);
  };

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, sortBy]);

  return (
    <div className="min-h-screen space-y-6 p-6 bg-slate-50/50 font-sans">
      {/* --- Header & Create Button --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Ticket className="h-6 w-6" />
            </span>
            Quản lý Mã Giảm Giá
          </h2>
          <p className="text-slate-500 mt-1 text-sm ml-12">
            Quản lý các chương trình khuyến mãi và voucher của cửa hàng
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/dashboard/vouchers/create")}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl px-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Tạo Voucher Mới
          </Button>
        </div>
      </div>

      {/* --- Filter Toolbar --- */}
      <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

            {/* Search Box */}
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên voucher, mã code..."
                className="pl-9 border-slate-200 focus-visible:ring-orange-500 rounded-lg bg-slate-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FilterX className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="UPCOMING">Sắp diễn ra</SelectItem>
                  <SelectItem value="EXPIRED">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>

              {/* Discount Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Percent className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Loại giảm giá" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="PERCENTAGE">Theo phần trăm (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Theo số tiền (₫)</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Sắp xếp" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_desc">Mới tạo nhất</SelectItem>
                  <SelectItem value="end_date_asc">Sắp hết hạn</SelectItem>
                  <SelectItem value="start_date_desc">Ngày bắt đầu</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  title="Xóa bộ lọc"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Voucher Table --- */}
      <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-orange-50/60 border-b border-orange-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-semibold text-orange-900">Thông tin Voucher</TableHead>
                <TableHead className="font-semibold text-orange-900">Mức giảm</TableHead>
                <TableHead className="font-semibold text-orange-900">Sử dụng / Tổng</TableHead>
                <TableHead className="font-semibold text-orange-900">Thời gian hiệu lực</TableHead>
                <TableHead className="font-semibold text-orange-900">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-orange-900 w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-full rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : vouchers.length > 0 ? (
                vouchers.map((item: any) => (
                  <VoucherRow
                    key={item.id}
                    voucher={item}
                    onCopy={handleCopyCode}
                    onDelete={() => deleteVoucherMutation.mutate(item.id)}
                    router={router}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Ticket className="h-12 w-12 opacity-20" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Không tìm thấy voucher</h3>
                      <p className="text-sm max-w-xs mx-auto mt-1">
                        Không có kết quả nào phù hợp với bộ lọc hiện tại của bạn.
                      </p>
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="text-orange-600 mt-2"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* --- Pagination --- */}
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:text-orange-600 hover:bg-orange-50"}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.total_pages }).map((_, i) => {
                  const pageNumber = i + 1;
                  // Simple pagination logic: Show first, last, and current surrounding
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.total_pages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={page === pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={page === pageNumber ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white" : "cursor-pointer hover:text-orange-600 hover:bg-orange-50"}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (pageNumber === page - 2 || pageNumber === page + 2) {
                    return <PaginationItem key={pageNumber}>...</PaginationItem>
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                    className={page === pagination.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer hover:text-orange-600 hover:bg-orange-50"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}

// --- Helper Components ---

function VoucherRow({ voucher, onCopy, onDelete, router }: any) {
  const formatPrice = (price: any) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(price));

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });

  // Tính toán trạng thái hiển thị
  const now = new Date();
  const start = new Date(voucher.start_date);
  const end = new Date(voucher.end_date);
  const isExpired = end < now;
  const isUpcoming = start > now;
  const isFullyUsed = voucher.used_quantity >= voucher.total_quantity;
  const percentUsed = (voucher.used_quantity / voucher.total_quantity) * 100;

  // Badge Style
  let statusConfig = { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" };
  if (!voucher.is_active) statusConfig = { label: "Đã tắt", className: "bg-slate-100 text-slate-600 hover:bg-slate-100" };
  else if (isUpcoming) statusConfig = { label: "Sắp diễn ra", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" };
  else if (isExpired) statusConfig = { label: "Đã hết hạn", className: "bg-red-100 text-red-700 hover:bg-red-100" };
  else if (isFullyUsed) statusConfig = { label: "Đã hết lượt", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" };

  return (
    <TableRow className="group hover:bg-orange-50/20 transition-colors border-slate-100">
      {/* Info Column */}
      <TableCell className="py-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${voucher.applies_to_type === "SHIPPING_FEE" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
            {voucher.applies_to_type === "SHIPPING_FEE" ? <Truck className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1" title={voucher.name}>
              {voucher.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onCopy(voucher.voucher_code)}
                      className="flex items-center gap-1.5 text-xs font-mono font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all"
                    >
                      {voucher.voucher_code}
                      <Copy className="h-3 w-3 opacity-70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Sao chép mã</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium px-1">
                {voucher.owner_type}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Discount Column */}
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-base">
            {voucher.discount_type === "PERCENTAGE" ? (
              <>
                <span className="text-orange-600">{Number(voucher.discount_value)}%</span>
                <span className="text-xs font-normal text-slate-500 ml-1">Giảm</span>
              </>
            ) : (
              <span className="text-orange-600">{formatPrice(voucher.discount_value)}</span>
            )}
          </div>
          {voucher.discount_type === "PERCENTAGE" && Number(voucher.max_discount_amount?.String || voucher.max_discount_amount) > 0 && (
            <span className="text-xs text-slate-500 mt-0.5">Tối đa {formatPrice(voucher.max_discount_amount?.String || voucher.max_discount_amount)}</span>
          )}
          <span className="text-xs text-slate-400 mt-0.5">Đơn tối thiểu {formatPrice(voucher.min_purchase_amount)}</span>
        </div>
      </TableCell>

      {/* Usage Column */}
      <TableCell>
        <div className="w-32">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">{voucher.used_quantity}</span>
            <span className="text-slate-400">/ {voucher.total_quantity}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isFullyUsed ? "bg-slate-400" : "bg-gradient-to-r from-orange-400 to-amber-500"}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </TableCell>

      {/* Date Column */}
      <TableCell>
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <CalendarRange className="h-4 w-4 text-slate-400 mt-0.5" />
          <div className="flex flex-col text-xs gap-0.5">
            <span>{formatDate(voucher.start_date)}</span>
            <span className="text-slate-400">đến {formatDate(voucher.end_date)}</span>
          </div>
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell>
        <Badge variant="secondary" className={`font-medium border-none px-2.5 py-0.5 ${statusConfig.className}`}>
          {statusConfig.label}
        </Badge>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-lg p-1">
            <DropdownMenuLabel className="text-xs text-slate-500 font-normal px-2 py-1.5">Thao tác</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/vouchers/${voucher.id}`)}
              className="rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-700"
            >
              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/vouchers/${voucher.id}`)}
              className="rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-700"
              disabled={isExpired} // Không cho sửa nếu đã hết hạn (optional)
            >
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
                  onDelete();
                }
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa voucher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}