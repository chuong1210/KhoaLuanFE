"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order-service";
import type { OrderStatus } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  ShoppingBag,
  Percent,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// --- CONFIG MÀU SẮC & LABEL ---
const STATUS_MAP = {
  AWAITING_PAYMENT: {
    label: "Chờ thanh toán",
    color: "bg-yellow-500",
    step: 1,
  },
  PROCESSING: { label: "Đang xử lý", color: "bg-blue-500", step: 2 },
  SHIPPED: { label: "Đang giao hàng", color: "bg-orange-500", step: 3 },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-500", step: 4 },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-500", step: 0 },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-red-500", step: 0 },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      status,
      reason,
    }: {
      status: OrderStatus;
      reason?: string;
    }) => {
      if (!shopId) throw new Error("Thiếu thông tin Shop ID");
      return orderService.updateOrderStatus(
        order!.shop_order_id,
        status,
        shopId,
        reason
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
      toast.success("Cập nhật trạng thái thành công");
      setCancelDialogOpen(false);
      setCancelReason("");
      // Reload trang để đảm bảo dữ liệu mới nhất
      window.location.reload();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi cập nhật trạng thái";
      toast.error(errorMessage);
    },
  });

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn");
      return;
    }
    updateStatusMutation.mutate({ status: "CANCELLED", reason: cancelReason });
  };

  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  if (error || !order)
    return <div className="p-8">Không tìm thấy đơn hàng</div>;

  const currentStatus = order.status;
  const isCancelledOrRefunded = ["CANCELLED", "REFUNDED"].includes(
    currentStatus
  );

  // Logic xác định hành động tiếp theo
  const renderActionPanel = () => {
    if (isCancelledOrRefunded) {
      return (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Đơn hàng này đã {STATUS_MAP[currentStatus].label.toLowerCase()}.
            Không thể thực hiện thêm hành động.
          </AlertDescription>
        </Alert>
      );
    }

    if (currentStatus === "COMPLETED") {
      return (
        <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Đơn hàng đã hoàn tất thành công.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            onClick={() => updateStatusMutation.mutate({ status: "REFUNDED" })}
            disabled={updateStatusMutation.isPending}
          >
            Yêu cầu hoàn tiền (Nếu cần)
          </Button>
        </div>
      );
    }

    // Các trạng thái hoạt động (Active)
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="space-y-1">
          <h4 className="font-semibold text-gray-900">Hành động tiếp theo</h4>
          <p className="text-sm text-gray-500">
            {currentStatus === "AWAITING_PAYMENT" &&
              "Vui lòng chờ khách hàng thanh toán."}
            {currentStatus === "PROCESSING" &&
              "Chuẩn bị hàng và giao cho đơn vị vận chuyển."}
            {currentStatus === "SHIPPED" &&
              "Theo dõi vận chuyển và xác nhận khi khách đã nhận."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Hủy (chỉ hiện khi chưa giao) */}
          {(currentStatus === "AWAITING_PAYMENT" ||
            currentStatus === "PROCESSING") && (
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setCancelDialogOpen(true)}
              disabled={updateStatusMutation.isPending}
            >
              Hủy đơn hàng
            </Button>
          )}

          {/* Nút Hành động chính */}
          {currentStatus === "PROCESSING" && (
            <Button
              className="bg-[#FF6A00] hover:bg-[#E65100] text-white shadow-md min-w-40"
              onClick={() => updateStatusMutation.mutate({ status: "SHIPPED" })}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Giao vận chuyển
            </Button>
          )}

          {currentStatus === "SHIPPED" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white shadow-md min-w-40"
              onClick={() =>
                updateStatusMutation.mutate({ status: "COMPLETED" })
              }
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Xác nhận hoàn thành
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render Stepper
  const renderStepper = () => {
    if (isCancelledOrRefunded) return null;

    const steps = [
      { key: "AWAITING_PAYMENT", label: "Đặt hàng" },
      { key: "PROCESSING", label: "Đang xử lý" },
      { key: "SHIPPED", label: "Đang giao" },
      { key: "COMPLETED", label: "Hoàn thành" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === currentStatus);

    return (
      <div className="relative w-full py-4">
        {/* Line background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded"></div>

        {/* Active Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#FF6A00] -translate-y-1/2 rounded transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div
                key={step.key}
                className="flex flex-col items-center gap-2 bg-white px-2"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive
                      ? "bg-[#FF6A00] border-[#FF6A00] text-white shadow-lg scale-110"
                      : "bg-white border-gray-300 text-gray-300"
                  )}
                >
                  {isActive ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-[#FF6A00]" : "text-gray-400",
                    isCurrent && "font-bold"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Nav */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-white shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng #{order.shop_order_code}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
          <Badge
            className={cn(
              "ml-auto text-base px-4 py-1.5",
              STATUS_MAP[currentStatus].color
            )}
          >
            {STATUS_MAP[currentStatus].label}
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Status & Items (Chiếm 2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* 1. Status & Actions Card */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-white border-b pb-6">
                <CardTitle className="text-lg">Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6 space-y-8">
                {renderStepper()}
                {renderActionPanel()}
              </CardContent>
            </Card>

            {/* 2. Products List */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    Sản phẩm ({order.items.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.item_id}
                      className="flex gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-medium text-gray-900 line-clamp-1">
                            {item.product_name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.sku_attributes || "Mặc định"}
                          </p>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="text-sm text-gray-500">
                            x{item.quantity}
                          </div>
                          <div className="font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.total_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section với Voucher */}
                <div className="bg-gray-50 p-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.shipping_fee)}
                    </span>
                  </div>

                  {/* Hiển thị Shop Voucher nếu có */}
                  {order.shop_voucher_code &&
                    order.shop_voucher_discount > 0 && (
                      <div className="bg-orange-50 -mx-4 px-4 py-2 border-y border-orange-100">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-orange-600" />
                            <span className="text-orange-700 font-medium">
                              Shop Voucher
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-white text-orange-600 border-orange-200 font-mono text-xs"
                            >
                              {order.shop_voucher_code}
                            </Badge>
                          </div>
                          <span className="text-orange-600 font-semibold">
                            -
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.shop_voucher_discount)}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Tổng giảm giá khác (nếu có) */}
                  {order.total_discount > order.shop_voucher_discount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá khác</span>
                      <span>
                        -
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          order.total_discount - order.shop_voucher_discount
                        )}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-[#FF6A00]">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Info (Chiếm 1/3) */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Voucher Applied */}
                {order.shop_voucher_code && (
                  <div className="bg-linear-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <Percent className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-orange-900 mb-1">
                          Voucher đã áp dụng
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-white text-orange-700 border border-orange-300 font-mono">
                            {order.shop_voucher_code}
                          </Badge>
                        </div>
                        <p className="text-xs text-orange-700">
                          Giảm{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.shop_voucher_discount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.shipping_method && (
                  <div className="flex gap-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Vận chuyển
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shipping_method}
                      </p>
                      {order.tracking_code && (
                        <p className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                          {order.tracking_code}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="flex gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Thanh toán
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.paid_at ? (
                        <span className="text-green-600">Đã thanh toán</span>
                      ) : (
                        <span className="text-orange-600">Chưa thanh toán</span>
                      )}
                    </p>
                    {order.paid_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(order.paid_at).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Log */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Lịch sử
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative border-l border-gray-200 ml-2 space-y-6 pl-6 py-1">
                  {[
                    { label: "Hoàn thành", date: order.completed_at },
                    { label: "Đã giao vận chuyển", date: order.shipped_at },
                    { label: "Đã xử lý", date: order.processing_at },
                    { label: "Đã thanh toán", date: order.paid_at },
                    { label: "Đặt hàng thành công", date: order.created_at },
                  ]
                    .filter((x) => x.date)
                    .map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[30px] h-3 w-3 rounded-full bg-gray-200 border-2 border-white ring-1 ring-gray-100"></div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date!).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do hủy đơn hàng. Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="VD: Khách hàng yêu cầu hủy, Hết hàng..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={updateStatusMutation.isPending}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={updateStatusMutation.isPending || !cancelReason.trim()}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
