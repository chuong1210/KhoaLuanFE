"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Ticket,
  Plus,
  Eye,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Filter,
  X,
  Download,
  Store,
} from "lucide-react";
import { ShopSelect } from "@/components/ui/shop-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useVouchers,
  useCreateVoucher,
  useDeleteVoucher,
  useToggleVoucherStatus,
} from "@/features/vouchers/hooks/useVouchers";
import type {
  Voucher,
  VoucherSearchParams,
  CreateVoucherRequest,
} from "@/features/vouchers/types";
import { voucherSchema, type VoucherFormData } from "@/lib/validators";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export default function VouchersPage() {
  const [searchParams, setSearchParams] = useState<VoucherSearchParams>({
    page: 1,
    page_size: 10,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const { data, isLoading } = useVouchers(searchParams);
  const createVoucher = useCreateVoucher();
  const deleteVoucher = useDeleteVoucher();
  const toggleStatus = useToggleVoucherStatus();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      discount_type: "PERCENTAGE",
      applies_to_type: "ORDER_TOTAL",
      audience_type: "PUBLIC",
      min_purchase_amount: 0,
      max_usage_per_user: 1,
      total_quantity: 100,
    },
  });

  const discountType = watch("discount_type");

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const onSubmit = (data: VoucherFormData) => {
    const request: CreateVoucherRequest = {
      ...data,
      max_discount_amount: data.max_discount_amount || undefined,
    };
    createVoucher.mutate(request, {
      onSuccess: () => {
        setIsCreateOpen(false);
        reset();
      },
    });
  };

  const handleDeleteVoucher = (voucherId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      deleteVoucher.mutate(voucherId);
    }
  };

  const handleToggleStatus = (voucherId: string, currentStatus: boolean) => {
    toggleStatus.mutate({ id: voucherId, isActive: !currentStatus });
  };

  const handleViewVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailOpen(true);
  };

  const clearFilters = () => {
    setSearchParams({ page: 1, page_size: 10 });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(searchParams).filter(
      (key) =>
        key !== "page" &&
        key !== "page_size" &&
        searchParams[key as keyof VoucherSearchParams] !== undefined
    ).length;
  };

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.status === "EXPIRED")
      return <Badge variant="expired">Hết hạn</Badge>;
    if (!voucher.is_active) return <Badge variant="inactive">Tạm dừng</Badge>;
    if (voucher.remaining_quantity === 0)
      return <Badge variant="error">Hết lượt</Badge>;
    return <Badge variant="active">Hoạt động</Badge>;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
          <p className="text-gray-500 mt-1">
            Tạo và quản lý các mã giảm giá trên sàn
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo voucher mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Basic Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã voucher..."
                className="pl-10"
                value={searchParams.voucher_code || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    voucher_code: e.target.value || undefined,
                    page: 1,
                  }))
                }
              />
            </div>

            {/* Discount Type */}
            <Select
              value={searchParams.discount_type || "all"}
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  discount_type:
                    value === "all"
                      ? undefined
                      : (value as "PERCENTAGE" | "FIXED_AMOUNT"),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại giảm giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
              </SelectContent>
            </Select>

            {/* Applies To */}
            <Select
              value={searchParams.applies_to_type || "all"}
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  applies_to_type:
                    value === "all"
                      ? undefined
                      : (value as "ORDER_TOTAL" | "SHIPPING_FEE"),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Áp dụng cho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ORDER_TOTAL">Đơn hàng</SelectItem>
                <SelectItem value="SHIPPING_FEE">Phí ship</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={
                searchParams.is_active === undefined
                  ? "all"
                  : searchParams.is_active
                  ? "active"
                  : "inactive"
              }
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  is_active:
                    value === "all"
                      ? undefined
                      : value === "active"
                      ? true
                      : false,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc nâng cao
              {getActiveFiltersCount() > 0 && (
                <Badge variant="processing" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Xóa bộ lọc"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          <Collapsible open={isAdvancedFiltersOpen}>
            <CollapsibleContent className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name Search */}
                <div>
                  <Label className="text-sm">Tên voucher</Label>
                  <Input
                    placeholder="Tìm theo tên..."
                    value={searchParams.name || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        name: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Shop */}
                <div>
                  <Label className="text-sm">Shop</Label>
                  <ShopSelect
                    value={searchParams.shop_id}
                    onValueChange={(value: any) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        shop_id: value,
                        page: 1,
                      }))
                    }
                    placeholder="Chọn shop để lọc..."
                    className="mt-1 w-full"
                  />
                </div>

                {/* Audience Type */}
                <div>
                  <Label className="text-sm">Đối tượng</Label>
                  <Select
                    value={searchParams.audience_type || "all"}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        audience_type:
                          value === "all"
                            ? undefined
                            : (value as "PUBLIC" | "ASSIGNED"),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="PUBLIC">Công khai</SelectItem>
                      <SelectItem value="ASSIGNED">Chỉ định</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Range */}
                <div>
                  <Label className="text-sm">Ngày bắt đầu (từ)</Label>
                  <Input
                    type="date"
                    value={searchParams.start_date_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        start_date_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Ngày bắt đầu (đến)</Label>
                  <Input
                    type="date"
                    value={searchParams.start_date_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        start_date_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* End Date Range */}
                <div>
                  <Label className="text-sm">Ngày kết thúc (từ)</Label>
                  <Input
                    type="date"
                    value={searchParams.end_date_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        end_date_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Ngày kết thúc (đến)</Label>
                  <Input
                    type="date"
                    value={searchParams.end_date_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        end_date_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-sm">Sắp xếp theo</Label>
                  <Select
                    value={searchParams.sort_by || "created_at_desc"}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        sort_by: value as any,
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at_desc">Mới nhất</SelectItem>
                      <SelectItem value="created_at_asc">Cũ nhất</SelectItem>
                      <SelectItem value="end_date_asc">
                        Hết hạn sớm nhất
                      </SelectItem>
                      <SelectItem value="end_date_desc">
                        Hết hạn muộn nhất
                      </SelectItem>
                      <SelectItem value="start_date_asc">
                        Bắt đầu sớm nhất
                      </SelectItem>
                      <SelectItem value="start_date_desc">
                        Bắt đầu muộn nhất
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-vivid" />
            Danh sách voucher
            {data?.pagination && (
              <Badge variant="processing" className="ml-2">
                {data.pagination.total_items} voucher
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>Mã voucher</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Áp dụng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((voucher) => (
                  <TableRow key={voucher.id} className="table-row-hover">
                    <TableCell>
                      <span className="font-mono font-bold text-orange-vivid">
                        {voucher.voucher_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{voucher.name}</p>
                      {voucher.owner_type === "SHOP" && (
                        <Badge variant="info" className="mt-1">
                          Shop Voucher
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {voucher.owner_type === "SHOP" ? (
                        <span className="text-sm">{voucher.owner_id}</span>
                      ) : (
                        <Badge variant="processing">Platform</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {voucher.discount_type === "PERCENTAGE" ? (
                          <>
                            <Percent className="h-4 w-4 text-orange-vivid" />
                            <span>{parseFloat(voucher.discount_value)}%</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-orange-vivid" />
                            <span>
                              {formatCurrency(
                                parseFloat(voucher.discount_value)
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          voucher.applies_to_type === "ORDER_TOTAL"
                            ? "info"
                            : "processing"
                        }
                      >
                        {voucher.applies_to_type === "ORDER_TOTAL"
                          ? "Đơn hàng"
                          : "Phí ship"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(voucher.end_date).split(" ")[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {voucher.used_quantity}/{voucher.total_quantity}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewVoucher(voucher)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleToggleStatus(voucher.id, voucher.is_active)
                          }
                          title={voucher.is_active ? "Tạm dừng" : "Kích hoạt"}
                          className={cn(
                            voucher.is_active
                              ? "text-orange-amber"
                              : "text-green-600"
                          )}
                        >
                          {voucher.is_active ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          className="text-orange-deep"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Ticket className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                    <p className="text-gray-500">Không có voucher nào</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data?.pagination && data.pagination.total_pages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={data.pagination.current_page}
                totalPages={data.pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Voucher Dialog - Same as before */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        {/* ... Previous create dialog content ... */}
      </Dialog>

      {/* Voucher Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết voucher</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-6">
              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-vivid font-mono">
                        {selectedVoucher.voucher_code}
                      </p>
                      <p className="text-lg font-medium mt-1">
                        {selectedVoucher.name}
                      </p>
                    </div>
                    {getStatusBadge(selectedVoucher)}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm text-gray-500">Giảm giá</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedVoucher.discount_type === "PERCENTAGE" ? (
                        <>
                          <Percent className="h-5 w-5 text-orange-vivid" />
                          <span className="text-xl font-bold">
                            {parseFloat(selectedVoucher.discount_value)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-5 w-5 text-orange-vivid" />
                          <span className="text-xl font-bold">
                            {formatCurrency(
                              parseFloat(selectedVoucher.discount_value)
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm text-gray-500">Đã sử dụng</Label>
                    <p className="text-xl font-bold mt-1">
                      {selectedVoucher.used_quantity}/
                      {selectedVoucher.total_quantity}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm text-gray-500">Áp dụng cho</Label>
                    <p className="text-lg font-medium mt-1">
                      {selectedVoucher.applies_to_type === "ORDER_TOTAL"
                        ? "Tổng đơn hàng"
                        : "Phí vận chuyển"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <Label className="text-sm text-gray-500">
                      Đơn tối thiểu
                    </Label>
                    <p className="text-lg font-bold mt-1">
                      {formatCurrency(
                        parseFloat(selectedVoucher.min_purchase_amount)
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-500">
                      Thời gian hiệu lực:
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Bắt đầu</p>
                      <p className="font-medium">
                        {formatDate(selectedVoucher.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kết thúc</p>
                      <p className="font-medium">
                        {formatDate(selectedVoucher.end_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm text-gray-500 block mb-2">
                    Thông tin khác
                  </Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đối tượng:</span>
                      <span className="font-medium">
                        {selectedVoucher.audience_type === "PUBLIC"
                          ? "Công khai"
                          : "Chỉ định"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tối đa/người:</span>
                      <span className="font-medium">
                        {selectedVoucher.max_usage_per_user}
                      </span>
                    </div>
                    {selectedVoucher.max_discount_amount?.Valid && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm tối đa:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            parseFloat(
                              selectedVoucher.max_discount_amount.String
                            )
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại chủ sở hữu:</span>
                      <span className="font-medium">
                        {selectedVoucher.owner_type === "PLATFORM"
                          ? "Platform"
                          : "Shop"}
                      </span>
                    </div>
                    {selectedVoucher.owner_type === "SHOP" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shop ID:</span>
                        <span className="font-medium">
                          {selectedVoucher.owner_id}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
