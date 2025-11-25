"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Loader2,
  Ticket,
  Save,
  Calendar,
  Percent,
  Users,
  Package,
  ArrowLeft,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Truck,
  Lock,
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import type { VoucherFormData } from "@/types/voucher";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

export default function CreateVoucherPage() {
  const router = useRouter();
  const shopId = useAppSelector((state) => state.shop.data?.id);

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
    total_quantity: 100,
    max_usage_per_user: 1,
    user_use: [],
    user_use_str: "",
  });

  const createVoucherMutation = useMutation({
    mutationFn: (data: VoucherFormData) =>
      voucherService.createVoucher(data, shopId),
    onSuccess: () => {
      toast.success("Đã tạo voucher thành công");
      router.push("/dashboard/vouchers");
    },
    onError: (error: any) => {
      toast.error("Tạo voucher thất bại", {
        description: error.message || "Vui lòng kiểm tra lại thông tin.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Logic
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("Lỗi thời gian", {
        description: "Ngày kết thúc phải sau ngày bắt đầu",
      });
      return;
    }
    if (
      formData.audience_type === "ASSIGNED" &&
      !formData.user_use_str.trim()
    ) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập danh sách User ID",
      });
      return;
    }

    // Prepare Payload với type chính xác
    const payload: any = {
      name: formData.name,
      voucher_code: formData.voucher_code,
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
      shop_id: shopId,
    };

    // Chỉ thêm user_use nếu là ASSIGNED và có data
    if (formData.audience_type === "ASSIGNED" && formData.user_use_str.trim()) {
      payload.user_use = formData.user_use_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    createVoucherMutation.mutate(payload);
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
          <span className="text-slate-800 font-medium">Tạo mới</span>
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
                Tạo Voucher Mới
              </h1>
              <p className="text-slate-500 text-sm">
                Thiết lập chương trình khuyến mãi cho cửa hàng
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
              disabled={createVoucherMutation.isPending}
              className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl px-6"
            >
              {createVoucherMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Tạo Voucher
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Mã Voucher (Code) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={formData.voucher_code}
                      onChange={(e) =>
                        handleChange(
                          "voucher_code",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="SUMMER2024"
                      className="font-mono uppercase focus-visible:ring-orange-500 pl-9"
                      required
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400 font-mono">
                      #
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mã này khách hàng sẽ nhập khi thanh toán.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Trạng thái tự động
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Voucher sẽ tự động kích hoạt khi đến thời gian bắt đầu và tự
                  động kết thúc khi hết hạn.
                </p>
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
                  <Label className="text-slate-700">
                    Mức giảm <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) =>
                        handleChange("discount_value", e.target.value)
                      }
                      className="pr-12 font-semibold text-orange-600 focus-visible:ring-orange-500"
                      required
                    />
                    <div className="absolute right-3 top-2.5 text-sm text-slate-400 font-medium">
                      {formData.discount_type === "PERCENTAGE" ? "%" : "VND"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Đơn hàng tối thiểu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={formData.min_purchase_amount}
                      onChange={(e) =>
                        handleChange("min_purchase_amount", e.target.value)
                      }
                      className="pr-12 focus-visible:ring-orange-500"
                      required
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
                        placeholder="0 (không giới hạn)"
                        className="pr-12 focus-visible:ring-orange-500"
                      />
                      <div className="absolute right-3 top-2.5 text-sm text-slate-400">
                        ₫
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Để trống hoặc 0 nếu không giới hạn
                    </p>
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
                  <Label className="text-slate-700">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="focus-visible:ring-purple-500 block"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="focus-visible:ring-purple-500 block"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Tổng số lượng phát hành{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.total_quantity}
                    onChange={(e) =>
                      handleChange("total_quantity", e.target.value)
                    }
                    className="focus-visible:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Lượt dùng tối đa / Người{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_usage_per_user}
                    onChange={(e) =>
                      handleChange("max_usage_per_user", e.target.value)
                    }
                    className="focus-visible:ring-purple-500"
                    required
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
                          {formData.discount_value || 0}
                        </>
                      ) : (
                        <>
                          <span className="text-sm">₫</span>
                          {new Intl.NumberFormat("vi-VN").format(
                            Number(formData.discount_value) || 0
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
                      {formatCurrency(
                        Number(formData.min_purchase_amount) || 0
                      )}
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
                        : "--/--/----"}
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
                <AlertCircle className="h-4 w-4" /> Lưu ý khi tạo voucher
              </h4>
              <ul className="space-y-1.5">
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Mã voucher phải là duy nhất và không thể thay đổi sau khi tạo.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Thời gian kết thúc phải sau thời gian bắt đầu.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Voucher "ASSIGNED" yêu cầu danh sách User ID hợp lệ.
                </li>
                <li className="text-xs text-blue-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                  Trạng thái voucher tự động cập nhật dựa trên thời gian hiện
                  tại.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
