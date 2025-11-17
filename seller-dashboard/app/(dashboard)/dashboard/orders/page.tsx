"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order-service";
import { useAppSelector } from "@/store/hooks";
import type { OrderStatus, OrderSearchParams } from "@/types/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const shopId = useAppSelector((state) => state.auth.shopId);

  const [filters, setFilters] = useState<OrderSearchParams>({
    shop_id: shopId || undefined,
    page: 1,
    page_size: 20,
    sort_by: "created_at",
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderService.searchOrders(filters),
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

  const formatDate = (date: string) => {
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

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (!shopId) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập và chọn shop để xem danh sách đơn hàng.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
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
            Xem và xử lý các đơn hàng của cửa hàng
          </p>
        </div>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count =
            data?.result.data.filter(
              (item) => item.order_shop.status === status
            ).length || 0;

          return (
            <Card
              key={status}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {config.label}
                </CardTitle>
                <Icon className="h-5 w-5" style={{ color: config.color }} />
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) =>
                    handleFilterChange("status", value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Giá trị tối thiểu</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.min_amount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "min_amount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Giá trị tối đa</Label>
                <Input
                  type="number"
                  placeholder="Không giới hạn"
                  value={filters.max_amount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "max_amount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input
                  type="date"
                  value={filters.created_from || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "created_from",
                      e.target.value || undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input
                  type="date"
                  value={filters.created_to || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "created_to",
                      e.target.value || undefined
                    )
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() =>
                    setFilters({
                      shop_id: shopId || undefined,
                      page: 1,
                      page_size: 20,
                      sort_by: "created_at",
                    })
                  }
                  variant="outline"
                  className="w-full"
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
          <CardDescription>
            {data?.result.totalElements || 0} đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert>
              <AlertDescription>
                Không thể tải danh sách đơn hàng
              </AlertDescription>
            </Alert>
          ) : data?.result.data && data.result.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.result.data.map((orderDetail) => (
                    <TableRow key={orderDetail.order_shop.shop_order_id}>
                      <TableCell className="font-medium">
                        #{orderDetail.order.order_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {orderDetail.order.shipping_address.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {orderDetail.order.shipping_address.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {orderDetail.order_shop.items[0]?.product_name.substring(
                          0,
                          40
                        )}
                        ...
                        {orderDetail.order_shop.items.length > 1 && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            +{orderDetail.order_shop.items.length - 1} sản phẩm
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="font-semibold"
                        style={{ color: "#FF6A00" }}
                      >
                        {formatPrice(orderDetail.order_shop.total_amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(orderDetail.order_shop.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(orderDetail.order_shop.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/dashboard/orders/${orderDetail.order_shop.shop_order_id}`
                            )
                          }
                          className="hover:bg-[#FFF0E0]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.result.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Trang {data.result.currentPage} / {data.result.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={data.result.currentPage === 1}
                      onClick={() =>
                        handlePageChange(data.result.currentPage - 1)
                      }
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        data.result.currentPage === data.result.totalPages
                      }
                      onClick={() =>
                        handlePageChange(data.result.currentPage + 1)
                      }
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Không có đơn hàng nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
