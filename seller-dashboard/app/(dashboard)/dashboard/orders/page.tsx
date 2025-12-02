"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order-service";
import { useAppSelector } from "@/store/hooks";
import type { OrderStatus, OrderSearchParams } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination } from "@/components/pagination_form";

const STATUS_CONFIG = {
  AWAITING_PAYMENT: { label: "Chờ thanh toán", icon: Clock, color: "#FFB000" },
  PROCESSING: { label: "Đang xử lý", icon: Package, color: "#FF8A33" },
  SHIPPED: { label: "Đang giao", icon: Truck, color: "#FF6A00" },
  COMPLETED: { label: "Hoàn thành", icon: CheckCircle, color: "#4CAF50" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, color: "#9E9E9E" },
  REFUNDED: { label: "Hoàn tiền", icon: DollarSign, color: "#E65100" },
};

export default function OrdersListPage() {
  const router = useRouter();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [filters, setFilters] = useState<OrderSearchParams>({
    shop_id: shopId || undefined,
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["shopOrders", filters],
    queryFn: () => orderService.getShopOrders(filters),
    enabled: !!shopId,
  });

  useEffect(() => {
    if (shopId) {
      setFilters((prev) => ({ ...prev, shop_id: shopId }));
    }
  }, [shopId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    const Icon = config.icon;

    return (
      <Badge
        className="text-white font-medium px-3 py-1 rounded-full"
        style={{ backgroundColor: config.color }}
      >
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!shopId) {
    return (
      <div className="p-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            ⚠️ Vui lòng đăng nhập và có shop để xem danh sách đơn hàng.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-linear-to-br from-orange-50/30 via-white to-amber-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            📦 Quản lý Đơn hàng
          </h2>
          <p className="text-gray-500 text-sm">
            Bạn có{" "}
            <span className="font-semibold text-orange-600">
              {data?.result.totalElements || 0}
            </span>{" "}
            đơn hàng
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-orange-200 hover:bg-orange-50 text-orange-600 transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-orange-100 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block text-sm font-medium text-gray-700">
                  Trạng thái đơn hàng
                </Label>
                <Select
                  value={filters.status || "ALL"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "status",
                      value === "ALL" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="h-10 border-orange-200 focus:ring-orange-400 focus:border-orange-400 bg-white">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  onClick={() =>
                    setFilters({
                      shop_id: shopId || undefined,
                      page: 1,
                      limit: 12,
                    })
                  }
                  variant="outline"
                  className="h-10 w-full sm:w-auto border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card className="border-orange-100 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-orange-100">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Danh sách đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  ❌ Không thể tải danh sách đơn hàng
                </AlertDescription>
              </Alert>
            </div>
          ) : data?.result.data && data.result.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-linear-to-r from-orange-50 to-amber-50 hover:from-orange-50 hover:to-amber-50">
                      <TableHead className="text-orange-700 font-semibold">
                        Mã đơn hàng
                      </TableHead>
                      <TableHead className="text-orange-700 font-semibold">
                        Sản phẩm
                      </TableHead>
                      <TableHead className="text-orange-700 font-semibold">
                        Phí ship
                      </TableHead>
                      <TableHead className="text-orange-700 font-semibold">
                        Tổng tiền
                      </TableHead>
                      <TableHead className="text-orange-700 font-semibold">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-orange-700 font-semibold">
                        Ngày tạo
                      </TableHead>
                      <TableHead className="text-right text-orange-700 font-semibold">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.result.data.map((order) => (
                      <TableRow
                        key={order.shop_order_id}
                        className="hover:bg-orange-50/50 transition-colors border-b border-orange-50"
                      >
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-orange-700">
                              #{order.shop_order_code}
                            </p>
                            {order.tracking_code && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {order.tracking_code}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                order.items[0]?.product_image ||
                                "https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg"
                              }
                              alt={order.items[0]?.product_name}
                              className="w-12 h-12 object-cover rounded-lg border-2 border-orange-100 shadow-sm"
                            />
                            <div className="max-w-[200px]">
                              <p className="text-sm font-medium truncate text-gray-800">
                                {order.items[0]?.product_name}
                              </p>
                              {order.items.length > 1 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  +{order.items.length - 1} sản phẩm khác
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-700">
                              {formatPrice(order.shipping_fee)}
                            </p>
                            {order.shipping_method && (
                              <p className="text-xs text-gray-500 mt-1">
                                🚚 {order.shipping_method}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-orange-600 text-lg">
                            {formatPrice(order.total_amount)}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/dashboard/orders/${order.shop_order_id}`
                              )
                            }
                            className="border-orange-200 hover:bg-orange-50 text-orange-600 hover:border-orange-300 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.result.totalPages > 1 && (
                <div className="p-6 border-t border-orange-100 bg-linear-to-r from-orange-50/50 to-amber-50/50">
                  <Pagination
                    currentPage={data.result.currentPage}
                    totalPages={data.result.totalPages}
                    onPageChange={handlePageChange}
                    totalElements={data.result.totalElements}
                    pageSize={filters.limit || 12}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-orange-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                Chưa có đơn hàng nào
              </p>
              <p className="text-gray-400 text-sm max-w-md">
                Các đơn hàng sẽ xuất hiện tại đây khi có khách mua hàng từ shop
                của bạn
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
