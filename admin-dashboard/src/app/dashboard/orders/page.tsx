"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Eye,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Filter,
  X,
  Download,
  Store,
  Truck,
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
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useOrders, useExportOrders } from "@/features/orders/hooks/useOrders";
import type {
  OrderWithShop,
  OrderSearchParams,
  OrderStatus,
} from "@/features/orders/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const STATUS_OPTIONS: {
  value: OrderStatus | "ALL";
  label: string;
  variant: any;
}[] = [
  { value: "ALL", label: "Tất cả", variant: "default" },
  { value: "AWAITING_PAYMENT", label: "Chờ thanh toán", variant: "warning" },
  { value: "PROCESSING", label: "Đang xử lý", variant: "processing" },
  { value: "SHIPPED", label: "Đang giao", variant: "shipped" },
  { value: "COMPLETED", label: "Hoàn thành", variant: "completed" },
  { value: "CANCELLED", label: "Đã hủy", variant: "cancelled" },
  { value: "REFUNDED", label: "Đã hoàn tiền", variant: "error" },
];

const getStatusBadge = (status: string) => {
  const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
  if (!statusOption) return <Badge>{status}</Badge>;

  return (
    <Badge variant={statusOption.variant as any}>{statusOption.label}</Badge>
  );
};

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderWithShop | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const { data, isLoading } = useOrders(searchParams);
  const exportOrders = useExportOrders();

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleStatusChange = (status: string) => {
    setSearchParams((prev) => ({
      ...prev,
      status: status === "ALL" ? undefined : (status as OrderStatus),
      page: 1,
    }));
  };

  const handleViewOrder = (order: OrderWithShop) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    exportOrders.mutate(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      page_size: 10,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(searchParams).filter(
      (key) =>
        !["page", "page_size", "sort_by", "sort_order"].includes(key) &&
        searchParams[key as keyof OrderSearchParams] !== undefined
    ).length;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-1">
            Theo dõi và quản lý tất cả đơn hàng trên sàn
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportOrders.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportOrders.isPending ? "Đang xuất..." : "Xuất Excel"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Basic Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search by Order Code */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đơn hàng..."
                className="pl-10"
                value={searchParams.order_code || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    order_code: e.target.value || undefined,
                    page: 1,
                  }))
                }
              />
            </div>

            {/* Shop */}
            <ShopSelect
              value={searchParams.shop_id}
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  shop_id: value,
                  page: 1,
                }))
              }
              placeholder="Chọn shop..."
              className="w-[250px]"
            />

            {/* Status Filter */}
            <Select
              value={searchParams.status || "ALL"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={`${searchParams.sort_by}_${searchParams.sort_order}`}
              onValueChange={(value) => {
                const [sort_by, sort_order] = value.split("_");
                setSearchParams((prev) => ({
                  ...prev,
                  sort_by: sort_by as any,
                  sort_order: sort_order as "asc" | "desc",
                  page: 1,
                }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Mới nhất</SelectItem>
                <SelectItem value="created_at_asc">Cũ nhất</SelectItem>
                <SelectItem value="grand_total_desc">Giá cao nhất</SelectItem>
                <SelectItem value="grand_total_asc">Giá thấp nhất</SelectItem>
                <SelectItem value="updated_at_desc">
                  Cập nhật mới nhất
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Lọc nâng cao
              {getActiveFiltersCount() > 0 && (
                <Badge variant="processing" className="ml-2">
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
              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Khoảng giá</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ (VND)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={searchParams.min_amount || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        min_amount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến (VND)</Label>
                  <Input
                    type="number"
                    placeholder="Không giới hạn"
                    value={searchParams.max_amount || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        max_amount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Created Date */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Ngày tạo đơn</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.created_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        created_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.created_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        created_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Paid Date */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Ngày thanh toán</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.paid_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        paid_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.paid_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        paid_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Processing Date */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Ngày xử lý</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.processing_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        processing_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.processing_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        processing_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Shipped Date */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Ngày giao hàng</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.shipped_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        shipped_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.shipped_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        shipped_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Completed Date */}
                <div className="md:col-span-4">
                  <Label className="text-sm font-medium">Ngày hoàn thành</Label>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.completed_from || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        completed_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={searchParams.completed_to || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        completed_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">User ID</Label>
                  <Input
                    placeholder="Lọc theo User ID..."
                    value={searchParams.user_id || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        user_id: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mã vận đơn</Label>
                  <div className="relative mt-1">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tracking code..."
                      value={searchParams.tracking_code || ""}
                      onChange={(e) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          tracking_code: e.target.value || undefined,
                          page: 1,
                        }))
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Voucher Site</Label>
                  <Input
                    placeholder="Mã voucher site..."
                    value={searchParams.site_voucher_code || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        site_voucher_code: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Voucher Shop</Label>
                  <Input
                    placeholder="Mã voucher shop..."
                    value={searchParams.shop_voucher_code || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        shop_voucher_code: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-vivid" />
            Danh sách đơn hàng
            {data && (
              <Badge variant="processing" className="ml-2">
                {data.totalElements} đơn hàng
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-12 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((orderData) => (
                  <TableRow
                    key={orderData.order.order_id}
                    className="table-row-hover"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-orange-vivid">
                          {orderData.order.order_code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {orderData.order_shop.shop_order_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {orderData.order_shop.shop_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {orderData.order.shipping_address.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {orderData.order.shipping_address.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-orange-vivid">
                        {formatCurrency(orderData.order.grand_total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(orderData.order_shop.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(orderData.order.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(orderData)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                      <p>Không có đơn hàng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog - Same as before with enhancements */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-vivid" />
              Chi tiết đơn hàng
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card variant="gradient">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-orange-vivid" />
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                        <p className="font-bold text-orange-vivid">
                          {selectedOrder.order.order_code}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Shop: {selectedOrder.order_shop.shop_order_code}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="gradient">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-orange-vivid" />
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-bold text-orange-vivid">
                          {formatCurrency(selectedOrder.order.grand_total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedOrder.order.payment_method.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Trạng thái & Thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Trạng thái hiện tại:
                      </span>
                      {getStatusBadge(selectedOrder.order_shop.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      {selectedOrder.order_shop.paid_at && (
                        <div>
                          <p className="text-gray-500">Đã thanh toán:</p>
                          <p className="font-medium">
                            {formatDate(selectedOrder.order_shop.paid_at)}
                          </p>
                        </div>
                      )}
                      {selectedOrder.order_shop.processing_at && (
                        <div>
                          <p className="text-gray-500">Đang xử lý:</p>
                          <p className="font-medium">
                            {formatDate(selectedOrder.order_shop.processing_at)}
                          </p>
                        </div>
                      )}
                      {selectedOrder.order_shop.shipped_at && (
                        <div>
                          <p className="text-gray-500">Đang giao:</p>
                          <p className="font-medium">
                            {formatDate(selectedOrder.order_shop.shipped_at)}
                          </p>
                        </div>
                      )}
                      {selectedOrder.order_shop.completed_at && (
                        <div>
                          <p className="text-gray-500">Hoàn thành:</p>
                          <p className="font-medium">
                            {formatDate(selectedOrder.order_shop.completed_at)}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedOrder.order_shop.tracking_code && (
                      <div className="flex items-center gap-2 mt-4 p-3 bg-orange-apricot/20 rounded">
                        <Truck className="h-4 w-4 text-orange-vivid" />
                        <div>
                          <p className="text-xs text-gray-500">Mã vận đơn</p>
                          <p className="font-medium">
                            {selectedOrder.order_shop.tracking_code}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-vivid" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {selectedOrder.order.shipping_address.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.order.shipping_address.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.order.shipping_address.address},{" "}
                      {selectedOrder.order.shipping_address.district},{" "}
                      {selectedOrder.order.shipping_address.city}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-vivid" />
                    Sản phẩm ({selectedOrder.order_shop.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_shop.items?.map((item) => (
                      <div
                        key={item.item_id}
                        className="flex gap-4 p-3 rounded-lg bg-orange-apricot/20"
                      >
                        <div className="relative h-16 w-16 rounded overflow-hidden bg-white flex-shrink-0">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-full w-full p-4 text-orange-peach" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            {item.sku_attributes}
                          </p>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm">x{item.quantity}</span>
                            <span className="font-bold text-orange-vivid">
                              {formatCurrency(item.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính:</span>
                      <span>
                        {formatCurrency(selectedOrder.order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển:</span>
                      <span>
                        {formatCurrency(selectedOrder.order.total_shipping_fee)}
                      </span>
                    </div>
                    {selectedOrder.order.total_discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giảm giá:</span>
                        <span className="text-green-600">
                          -{formatCurrency(selectedOrder.order.total_discount)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.order.site_order_voucher_code && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          Voucher site:{" "}
                          {selectedOrder.order.site_order_voucher_code}
                        </span>
                        <span className="text-green-600">
                          -
                          {formatCurrency(
                            selectedOrder.order.site_order_voucher_discount
                          )}
                        </span>
                      </div>
                    )}
                    {selectedOrder.order_shop.shop_voucher_code && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          Voucher shop:{" "}
                          {selectedOrder.order_shop.shop_voucher_code}
                        </span>
                        <span className="text-green-600">
                          -
                          {formatCurrency(
                            selectedOrder.order_shop.shop_voucher_discount
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-orange-peach/30 pt-2 flex justify-between font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-vivid">
                        {formatCurrency(selectedOrder.order.grand_total)}
                      </span>
                    </div>
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
