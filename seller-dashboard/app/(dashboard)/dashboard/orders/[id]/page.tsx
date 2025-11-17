"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order-service";
import type { OrderStatus } from "@/types/order";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";

const STATUS_CONFIG = {
  AWAITING_PAYMENT: {
    label: "Chờ thanh toán",
    icon: Clock,
    color: "#FFB000",
    next: "PROCESSING",
  },
  PROCESSING: {
    label: "Đang xử lý",
    icon: Package,
    color: "#FF8A33",
    next: "SHIPPED",
  },
  SHIPPED: {
    label: "Đang giao",
    icon: Truck,
    color: "#FF6A00",
    next: "COMPLETED",
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: CheckCircle,
    color: "#4CAF50",
    next: null,
  },
  CANCELLED: { label: "Đã hủy", icon: XCircle, color: "#9E9E9E", next: null },
  REFUNDED: { label: "Hoàn tiền", icon: XCircle, color: "#E65100", next: null },
};

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => orderService.getOrderById(params.id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) =>
      orderService.updateOrderStatus(params.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã cập nhật trạng thái đơn hàng");
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái");
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
        className="text-white font-medium px-3 py-1"
        style={{ backgroundColor: config.color }}
      >
        <Icon className="mr-1 h-4 w-4" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          Không thể tải thông tin đơn hàng
        </AlertDescription>
      </Alert>
    );
  }

  const currentStatus = order.order_shop.status;
  const statusConfig = STATUS_CONFIG[currentStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-[#FFF0E0]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Chi tiết đơn hàng
            </h2>
            <p className="text-gray-600 mt-1">
              Mã đơn:{" "}
              <span className="font-semibold">#{order.order.order_code}</span>
            </p>
          </div>
        </div>
        {getStatusBadge(currentStatus)}
      </div>

      {/* Status Update Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: "#E65100" }}
          >
            <Package className="h-5 w-5" />
            Cập nhật trạng thái
          </CardTitle>
          <CardDescription>
            Thay đổi trạng thái đơn hàng theo quy trình xử lý
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {statusConfig?.next && (
            <Button
              onClick={() =>
                updateStatusMutation.mutate(statusConfig.next as OrderStatus)
              }
              disabled={updateStatusMutation.isPending}
              className="text-white"
              style={{
                background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
              }}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {STATUS_CONFIG[statusConfig.next as OrderStatus].icon && (
                    <>
                      {React.createElement(
                        STATUS_CONFIG[statusConfig.next as OrderStatus].icon,
                        { className: "mr-2 h-4 w-4" }
                      )}
                    </>
                  )}
                  Chuyển sang:{" "}
                  {STATUS_CONFIG[statusConfig.next as OrderStatus].label}
                </>
              )}
            </Button>
          )}

          {(currentStatus === "AWAITING_PAYMENT" ||
            currentStatus === "PROCESSING") && (
            <Button
              variant="destructive"
              onClick={() => updateStatusMutation.mutate("CANCELLED")}
              disabled={updateStatusMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy đơn hàng
            </Button>
          )}

          {currentStatus === "COMPLETED" && (
            <Button
              variant="outline"
              onClick={() => updateStatusMutation.mutate("REFUNDED")}
              disabled={updateStatusMutation.isPending}
              className="border-[#E65100] text-[#E65100] hover:bg-[#FFF0E0]"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hoàn tiền
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: "#E65100" }}
            >
              <Mail className="h-5 w-5" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB38A 0%, #FFD3A3 100%)",
                }}
              >
                <Mail className="h-5 w-5 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Họ tên</p>
                <p className="font-semibold text-lg">
                  {order.order.shipping_address.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB38A 0%, #FFD3A3 100%)",
                }}
              >
                <Phone className="h-5 w-5 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Số điện thoại
                </p>
                <p className="font-semibold text-lg">
                  {order.order.shipping_address.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB38A 0%, #FFD3A3 100%)",
                }}
              >
                <MapPin className="h-5 w-5 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Địa chỉ giao hàng
                </p>
                <p className="font-medium">
                  {order.order.shipping_address.address},{" "}
                  {order.order.shipping_address.district},{" "}
                  {order.order.shipping_address.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: "#E65100" }}
            >
              <FileText className="h-5 w-5" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã shop order</p>
              <p className="font-semibold">
                #{order.order_shop.shop_order_code}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">
                Phương thức thanh toán
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="h-4 w-4 text-[#FF6A00]" />
                <span className="font-medium">
                  {order.order.payment_method.name}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Ngày đặt hàng</p>
              <p className="font-medium">
                {formatDate(order.order_shop.created_at)}
              </p>
            </div>

            {order.order_shop.paid_at && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ngày thanh toán
                </p>
                <p className="font-medium">
                  {formatDate(order.order_shop.paid_at)}
                </p>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng tiền hàng
              </p>
              <p className="text-xl font-bold" style={{ color: "#FF6A00" }}>
                {formatPrice(order.order_shop.subtotal)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">
                Phí vận chuyển
              </p>
              <p className="font-semibold">
                {formatPrice(order.order_shop.shipping_fee)}
              </p>
            </div>

            {order.order_shop.total_discount > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600">Giảm giá</p>
                <p className="font-semibold text-green-600">
                  -{formatPrice(order.order_shop.total_discount)}
                </p>
              </div>
            )}

            <Separator />

            <div
              className="p-4 rounded-lg"
              style={{
                background: "linear-gradient(90deg, #FFB38A 0%, #FFD3A3 100%)",
              }}
            >
              <p className="text-sm font-medium text-[#E65100]">
                Tổng thanh toán
              </p>
              <p className="text-2xl font-bold text-[#E65100]">
                {formatPrice(order.order_shop.total_amount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle style={{ color: "#E65100" }}>
            Sản phẩm trong đơn hàng
          </CardTitle>
          <CardDescription>
            {order.order_shop.items.length} sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_shop.items.map((item) => (
              <div key={item.item_id}>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-[#FFB38A]">
                    <img
                      src={item.product_image || "/placeholder.svg"}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.product_name}</p>
                    {item.sku_attributes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.sku_attributes}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.final_unit_price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{ color: "#FF6A00" }}
                    >
                      {formatPrice(item.total_price)}
                    </p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {(order.order_shop.paid_at ||
        order.order_shop.processing_at ||
        order.order_shop.shipped_at ||
        order.order_shop.completed_at ||
        order.order_shop.cancelled_at) && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle style={{ color: "#E65100" }}>Lịch sử đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_shop.created_at && (
                <TimelineItem
                  icon={Clock}
                  title="Đơn hàng được tạo"
                  time={formatDate(order.order_shop.created_at)}
                  color="#FFB000"
                />
              )}
              {order.order_shop.paid_at && (
                <TimelineItem
                  icon={CreditCard}
                  title="Đã thanh toán"
                  time={formatDate(order.order_shop.paid_at)}
                  color="#FF8A33"
                />
              )}
              {order.order_shop.processing_at && (
                <TimelineItem
                  icon={Package}
                  title="Đang xử lý"
                  time={formatDate(order.order_shop.processing_at)}
                  color="#FF8A33"
                />
              )}
              {order.order_shop.shipped_at && (
                <TimelineItem
                  icon={Truck}
                  title="Đã giao cho vận chuyển"
                  time={formatDate(order.order_shop.shipped_at)}
                  color="#FF6A00"
                />
              )}
              {order.order_shop.completed_at && (
                <TimelineItem
                  icon={CheckCircle}
                  title="Hoàn thành"
                  time={formatDate(order.order_shop.completed_at)}
                  color="#4CAF50"
                />
              )}
              {order.order_shop.cancelled_at && (
                <TimelineItem
                  icon={XCircle}
                  title="Đã hủy"
                  time={formatDate(order.order_shop.cancelled_at)}
                  color="#9E9E9E"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  title,
  time,
  color,
}: {
  icon: any;
  title: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{time}</p>
      </div>
    </div>
  );
}
