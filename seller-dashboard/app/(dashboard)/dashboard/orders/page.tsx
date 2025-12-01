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
        className="text-white font-medium"
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

  const getStatusCount = (status: OrderStatus) => {
    return (
      data?.result.data.filter((order) => order.status === status).length || 0
    );
  };

  if (!shopId) {
    return (
      <Alert className="border-[#FFB38A] bg-[#FFF0E0]">
        <AlertDescription style={{ color: "#E65100" }}>
          Vui lòng đăng nhập và có shop để xem danh sách đơn hàng.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Quản lý Đơn hàng
          </h2>
          <p className="text-gray-600 mt-1">
            Tổng cộng:{" "}
            <span className="font-semibold" style={{ color: "#FF6A00" }}>
              {data?.result.totalElements || 0}
            </span>{" "}
            đơn hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-[#FFB38A] hover:bg-[#FFF0E0]"
            style={{ color: "#FF6A00" }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="text-white"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = getStatusCount(status as OrderStatus);

          return (
            <Card
              key={status}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">
                  {config.label}
                </CardTitle>
                <Icon className="h-4 w-4" style={{ color: config.color }} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  style={{ color: config.color }}
                >
                  {count}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "#E65100" }}>
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block text-sm font-medium">
                  Trạng thái
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
                  <SelectTrigger className="h-10 border-[#FFB38A] focus:ring-[#FF6A00]">
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

              <div className="sm:self-end">
                <Button
                  onClick={() =>
                    setFilters({
                      shop_id: shopId || undefined,
                      page: 1,
                      limit: 12,
                    })
                  }
                  variant="outline"
                  className="h-10 w-full sm:w-auto border-[#E65100] hover:bg-[#FFF0E0]"
                  style={{ color: "#E65100" }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle style={{ color: "#E65100" }}>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Không thể tải danh sách đơn hàng
              </AlertDescription>
            </Alert>
          ) : data?.result.data && data.result.data.length > 0 ? (
            <>
              <div className="rounded-lg border border-[#FFB38A] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FFF0E0] hover:bg-[#FFF0E0]">
                      <TableHead style={{ color: "#E65100" }}>
                        Mã đơn hàng
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Sản phẩm
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Phí ship
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Tổng tiền
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Trạng thái
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Ngày tạo
                      </TableHead>
                      <TableHead
                        className="text-right"
                        style={{ color: "#E65100" }}
                      >
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.result.data.map((order) => (
                      <TableRow
                        key={order.shop_order_id}
                        className="hover:bg-[#FFF0E0]/30"
                      >
                        <TableCell className="font-medium">
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: "#E65100" }}
                            >
                              #{order.shop_order_code}
                            </p>
                            {order.tracking_code && (
                              <p className="text-xs text-gray-500">
                                Tracking: {order.tracking_code}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                order.items[0]?.product_image ||
                                "https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg"
                              }
                              alt={order.items[0]?.product_name}
                              className="w-10 h-10 object-cover rounded border border-[#FFB38A]"
                            />
                            <div className="max-w-[200px]">
                              <p className="text-sm font-medium truncate">
                                {order.items[0]?.product_name}
                              </p>
                              {order.items.length > 1 && (
                                <p className="text-xs text-gray-500">
                                  +{order.items.length - 1} sản phẩm khác
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatPrice(order.shipping_fee)}
                            </p>
                            {order.shipping_method && (
                              <p className="text-xs text-gray-500">
                                {order.shipping_method}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="font-bold"
                          style={{ color: "#FF6A00" }}
                        >
                          {formatPrice(order.total_amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm">
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
                            className="border-[#FFB38A] hover:bg-[#FFF0E0]"
                            style={{ color: "#FF6A00" }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Modern Pagination */}
              {data.result.totalPages > 1 && (
                <Pagination
                  currentPage={data.result.currentPage}
                  totalPages={data.result.totalPages}
                  onPageChange={handlePageChange}
                  totalElements={data.result.totalElements}
                  pageSize={filters.limit || 12}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                Không có đơn hàng nào
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Các đơn hàng sẽ xuất hiện tại đây khi có khách mua hàng
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
