"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
import type { VoucherFormData } from "@/types/voucher";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAppSelector } from "@/store/hooks"; // Redux hook

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  ArrowLeft,
  Save,
  Loader2,
  Ticket,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Users,
  Clock,
  Percent,
  Truck,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const voucherId = params.id as string;
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // --- State Form ---
  const [formData, setFormData] = useState<
    VoucherFormData & { user_use_str: string }
  >({
    name: "",
    voucher_code: "",
    discount_type: "PERCENTAGE",
    discount_value: 0,
    max_discount_amount: 0,
    applies_to_type: "ORDER_TOTAL",
    min_purchase_amount: 0,
    audience_type: "PUBLIC",
    start_date: "",
    end_date: "",
    total_quantity: 0,
    max_usage_per_user: 1,
    user_use: [],
    user_use_str: "",
  });

  // --- Fetch Data ---
  const {
    data: voucher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: () =>
      voucherService.getVouchers({ page: 1, page_size: 100, shop_id: shopId! }), // Giả sử API hỗ trợ shopId để lấy list
    select: (response: any) => {
      // Xử lý tùy thuộc vào cấu trúc trả về của API (Array trực tiếp hay object chứa data)
      const list = Array.isArray(response)
        ? response
        : response?.result?.data || [];
      return list.find((v: any) => v.id === voucherId);
    },
    enabled: !!shopId, // Chỉ fetch khi có shopId
  });

  // --- Sync Data to Form ---
  useEffect(() => {
    if (voucher) {
      setFormData({
        name: voucher.name,
        voucher_code: voucher.voucher_code,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        max_discount_amount:
          Number(
            voucher.max_discount_amount?.String || voucher.max_discount_amount
          ) || 0,
        applies_to_type: voucher.applies_to_type,
        min_purchase_amount: Number(voucher.min_purchase_amount),
        audience_type: voucher.audience_type,
        // Convert sang format datetime-local: YYYY-MM-DDThh:mm
        start_date: voucher.start_date
          ? new Date(voucher.start_date).toISOString().slice(0, 16)
          : "",
        end_date: voucher.end_date
          ? new Date(voucher.end_date).toISOString().slice(0, 16)
          : "",
        total_quantity: voucher.total_quantity,
        max_usage_per_user: voucher.max_usage_per_user,
        user_use: voucher.user_use || [],
        user_use_str: voucher.user_use?.join(", ") || "",
      });
    }
  }, [voucher]);

  // --- Mutation Update ---
  const updateMutation = useMutation({
    mutationFn: (data: VoucherFormData) => {
      if (!shopId) throw new Error("Thiếu thông tin Shop ID");
      return voucherService.updateVoucher(voucherId, data, shopId);
    },
    onSuccess: () => {
      toast.success("Cập nhật voucher thành công!");
      // Invalidate queries để refetch data mới
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      // Reload trang để hiển thị dữ liệu mới nhất
      setTimeout(() => {
        window.location.reload();
      }, 500); // Delay nhỏ để toast hiển thị trước khi reload
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi cập nhật voucher");
    },
  });

  // --- Handlers ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    // Payload với type chính xác
    const payload: any = {
      name: formData.name,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      max_discount_amount: Number(formData.max_discount_amount) || 0,
      applies_to_type: formData.applies_to_type,
      min_purchase_amount: Number(formData.min_purchase_amount),
      audience_type: formData.audience_type,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      total_quantity: Number(formData.total_quantity),
      max_usage_per_user: Number(formData.max_usage_per_user),
    };

    // Chỉ thêm user_use nếu là ASSIGNED và có data
    if (formData.audience_type === "ASSIGNED" && formData.user_use_str.trim()) {
      payload.user_use = formData.user_use_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    updateMutation.mutate(payload);
  };

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  // Helper function để check voucher có đang hoạt động hay không dựa trên thời gian
  const isVoucherActive = () => {
    if (!formData.start_date || !formData.end_date) return false;
    const now = new Date();
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return now >= start && now <= end;
  };

  // --- Render Logic ---
  if (isLoading) return <EditVoucherSkeleton />;

  if (isError || !voucher)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Không tìm thấy Voucher
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Voucher bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/vouchers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 pb-24 font-sans">
      {/* Header Section */}
      <div className="mx-auto max-w-6xl mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span
            className="cursor-pointer hover:text-orange-600"
            onClick={() => router.push("/dashboard/vouchers")}
          >
            Danh sách
          </span>
          <span>/</span>
          <span className="text-slate-800 font-medium">Chỉnh sửa</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="rounded-xl h-10 w-10 bg-white border-slate-200 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Chỉnh sửa Voucher
              </h1>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                Mã:{" "}
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 font-mono"
                >
                  {voucher.voucher_code}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl px-6"
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Thông tin cơ bản */}
          <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-orange-50/40 border-b border-orange-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-900">
                <Ticket className="h-5 w-5 text-orange-500" /> Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Tên chương trình <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Siêu sale tháng 11"
                    className="focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Mã Voucher</Label>
                  <div className="relative">
                    <Input
                      value={formData.voucher_code}
                      disabled
                      className="bg-slate-100 font-mono text-slate-500 border-slate-200 pl-9"
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 italic">
                      Không thể sửa
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  isVoucherActive()
                    ? "bg-emerald-50 border-emerald-200"
                    : new Date(formData.start_date) > new Date()
                    ? "bg-blue-50 border-blue-200"
                    : "bg-slate-100 border-slate-200"
                )}
              >
                <div className="space-y-1">
                  <Label
                    className={cn(
                      "text-base font-medium",
                      isVoucherActive()
                        ? "text-emerald-900"
                        : new Date(formData.start_date) > new Date()
                        ? "text-blue-900"
                        : "text-slate-700"
                    )}
                  >
                    Trạng thái voucher
                  </Label>
                  <p className="text-sm text-slate-600">
                    {isVoucherActive()
                      ? "Voucher đang hoạt động trong khoảng thời gian hiệu lực."
                      : new Date(formData.start_date) > new Date()
                      ? "Voucher chưa đến thời gian bắt đầu."
                      : "Voucher đã hết hạn sử dụng."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isVoucherActive() ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : new Date(formData.start_date) > new Date() ? (
                    <Clock className="h-6 w-6 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-slate-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Thiết lập giá trị */}
          <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50/40 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <DollarSign className="h-5 w-5 text-blue-500" /> Giá trị ưu đãi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Loại giảm giá</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v) => handleChange("discount_type", v)}
                  >
                    <SelectTrigger className="focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        Theo phần trăm (%)
                      </SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        Số tiền cố định (₫)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Mức giảm</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) =>
                        handleChange("discount_value", e.target.value)
                      }
                      className="pr-12 font-semibold text-orange-600 focus-visible:ring-orange-500"
                    />
                    <div className="absolute right-3 top-2.5 text-sm text-slate-400 font-medium">
                      {formData.discount_type === "PERCENTAGE" ? "%" : "VND"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Đơn hàng tối thiểu</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={formData.min_purchase_amount}
                      onChange={(e) =>
                        handleChange("min_purchase_amount", e.target.value)
                      }
                      className="pr-12 focus-visible:ring-orange-500"
                    />
                    <div className="absolute right-3 top-2.5 text-sm text-slate-400">
                      ₫
                    </div>
                  </div>
                </div>
                {formData.discount_type === "PERCENTAGE" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <Label className="text-slate-700">Giảm tối đa</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={formData.max_discount_amount}
                        onChange={(e) =>
                          handleChange("max_discount_amount", e.target.value)
                        }
                        className="pr-12 focus-visible:ring-orange-500"
                      />
                      <div className="absolute right-3 top-2.5 text-sm text-slate-400">
                        ₫
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-2" />

              <div className="space-y-3">
                <Label className="text-slate-700">Áp dụng cho</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all relative overflow-hidden",
                      formData.applies_to_type === "ORDER_TOTAL"
                        ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500"
                        : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                    )}
                    onClick={() =>
                      handleChange("applies_to_type", "ORDER_TOTAL")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <ShoppingBag
                        className={cn(
                          "h-6 w-6",
                          formData.applies_to_type === "ORDER_TOTAL"
                            ? "text-orange-600"
                            : "text-slate-400"
                        )}
                      />
                      {formData.applies_to_type === "ORDER_TOTAL" && (
                        <CheckCircle2 className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        formData.applies_to_type === "ORDER_TOTAL"
                          ? "text-orange-900"
                          : "text-slate-600"
                      )}
                    >
                      Tổng đơn hàng
                    </span>
                  </div>

                  <div
                    className={cn(
                      "cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all relative overflow-hidden",
                      formData.applies_to_type === "SHIPPING_FEE"
                        ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    )}
                    onClick={() =>
                      handleChange("applies_to_type", "SHIPPING_FEE")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <Truck
                        className={cn(
                          "h-6 w-6",
                          formData.applies_to_type === "SHIPPING_FEE"
                            ? "text-blue-600"
                            : "text-slate-400"
                        )}
                      />
                      {formData.applies_to_type === "SHIPPING_FEE" && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        formData.applies_to_type === "SHIPPING_FEE"
                          ? "text-blue-900"
                          : "text-slate-600"
                      )}
                    >
                      Phí vận chuyển
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Thời gian & Đối tượng */}
          <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-purple-50/40 border-b border-purple-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                <Clock className="h-5 w-5 text-purple-500" /> Thời gian & Giới
                hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Thời gian bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="focus-visible:ring-purple-500 block"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Thời gian kết thúc</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="focus-visible:ring-purple-500 block"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Tổng số lượng phát hành
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.total_quantity}
                    onChange={(e) =>
                      handleChange("total_quantity", e.target.value)
                    }
                    className="focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Lượt dùng tối đa / Người
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_usage_per_user}
                    onChange={(e) =>
                      handleChange("max_usage_per_user", e.target.value)
                    }
                    className="focus-visible:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700">Đối tượng áp dụng</Label>
                <Select
                  value={formData.audience_type}
                  onValueChange={(v) => handleChange("audience_type", v)}
                >
                  <SelectTrigger className="focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>Công khai (Tất cả người dùng)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ASSIGNED">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span>Riêng tư (Chỉ định người dùng)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {formData.audience_type === "ASSIGNED" && (
                  <div className="animate-in fade-in slide-in-from-top-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Label className="text-xs text-slate-500 mb-2 block font-medium uppercase">
                      Danh sách User ID (ngăn cách bởi dấu phẩy)
                    </Label>
                    <Textarea
                      placeholder="user_123, user_456..."
                      value={formData.user_use_str}
                      onChange={(e) =>
                        handleChange("user_use_str", e.target.value)
                      }
                      className="h-24 font-mono text-sm bg-white border-slate-200 focus-visible:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview - STICKY */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Xem trước
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* VOUCHER PREVIEW CARD */}
            <div className="relative w-full max-w-[350px] mx-auto filter drop-shadow-lg transition-transform hover:scale-[1.02] duration-300">
              {/* Top Part */}
              <div className="h-32 bg-linear-to-br from-orange-500 to-amber-500 rounded-t-2xl p-6 flex flex-col justify-center text-white relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[10px_10px]"></div>

                <div className="relative z-10">
                  <h3 className="font-bold text-xl leading-tight line-clamp-2 mb-1">
                    {formData.name || "Tên Voucher"}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/20 text-white border border-white/20">
                    Shop Voucher
                  </span>
                </div>
              </div>

              {/* Middle Connector with Holes */}
              <div className="h-4 bg-white relative flex items-center justify-between px-2">
                <div className="w-6 h-6 bg-slate-50/50 rounded-full absolute -left-3 top-1/2 -translate-y-1/2 shadow-inner"></div>
                <div className="w-full border-b-2 border-dashed border-slate-200 h-px"></div>
                <div className="w-6 h-6 bg-slate-50/50 rounded-full absolute -right-3 top-1/2 -translate-y-1/2 shadow-inner"></div>
              </div>

              {/* Bottom Part */}
              <div className="bg-white rounded-b-2xl p-5 pt-2 relative">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Mã Code
                    </p>
                    <div className="px-3 py-1 bg-orange-50 text-orange-700 font-mono font-bold text-lg rounded border border-orange-100 inline-block">
                      {formData.voucher_code || "CODE"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-orange-600 font-bold text-2xl">
                      {formData.discount_type === "PERCENTAGE" ? (
                        <>
                          <Percent className="h-5 w-5" />{" "}
                          {formData.discount_value}
                        </>
                      ) : (
                        <>
                          <span className="text-sm">₫</span>
                          {new Intl.NumberFormat("vi-VN").format(
                            Number(formData.discount_value)
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Giảm giá</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Đơn tối thiểu:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(formData.min_purchase_amount))}
                    </span>
                  </div>
                  {formData.discount_type === "PERCENTAGE" &&
                    Number(formData.max_discount_amount) > 0 && (
                      <div className="flex justify-between">
                        <span>Giảm tối đa:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(formData.max_discount_amount))}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between items-center">
                    <span>Hạn sử dụng:</span>
                    <span className="font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      {formData.end_date
                        ? format(new Date(formData.end_date), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        : "--"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isVoucherActive() ? (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đang hoạt động
                    </div>
                  ) : new Date(formData.start_date) > new Date() ? (
                    <div className="flex items-center justify-center gap-1.5 text-blue-600 text-xs font-medium">
                      <Clock className="h-3.5 w-3.5" /> Chưa bắt đầu
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                      <AlertCircle className="h-3.5 w-3.5" /> Đã kết thúc
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Lưu ý quản trị
              </h4>
              <ul className="space-y-1.5">
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Chỉnh sửa "Giảm giá" không ảnh hưởng đơn đã đặt.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Giảm "Tổng số lượng" thấp hơn số đã dùng sẽ vô hiệu hóa
                  voucher.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Trạng thái voucher tự động cập nhật dựa trên thời gian hiện
                  tại.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Trang sẽ tự động reload sau khi cập nhật thành công.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function EditVoucherSkeleton() {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
