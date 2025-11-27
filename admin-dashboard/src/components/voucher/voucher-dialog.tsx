"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  Edit,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Package,
  Users,
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ShopSelect } from "@/components/ui/shop-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateVoucher } from "@/features/vouchers/hooks/useVouchers";
import type { Voucher, UpdateVoucherRequest } from "@/features/vouchers/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

// Form schema for update (same as create but all optional except required ones)
const updateVoucherSchema = z
  .object({
    name: z.string().min(1, "Tên voucher là bắt buộc"),
    discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discount_value: z.number().min(0, "Giá trị giảm phải lớn hơn 0"),
    is_shop_voucher: z.boolean(),
    shop_id: z.string().nullable().optional(),
    max_discount_amount: z.number().optional(),
    applies_to_type: z.enum(["ORDER_TOTAL", "SHIPPING_FEE"]),
    min_purchase_amount: z.number().min(0),
    audience_type: z.enum(["PUBLIC", "ASSIGNED"]),
    start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
    end_date: z.string().min(1, "Ngày kết thúc là bắt buộc"),
    total_quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
    max_usage_per_user: z.number().min(1),
    is_active: z.boolean(),
    user_use: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.is_shop_voucher) {
        return !!data.shop_id;
      }
      return true;
    },
    {
      message: "Vui lòng chọn shop",
      path: ["shop_id"],
    }
  );

interface VoucherFormData {
  name: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  is_shop_voucher: boolean;
  shop_id?: string | null;
  max_discount_amount?: number;
  applies_to_type: "ORDER_TOTAL" | "SHIPPING_FEE";
  min_purchase_amount: number;
  audience_type: "PUBLIC" | "ASSIGNED";
  start_date: string;
  end_date: string;
  total_quantity: number;
  max_usage_per_user: number;
  is_active: boolean;
  user_use?: string[];
}

// Helper to convert ISO to datetime-local format
const formatISOToDateTimeLocal = (isoString: string): string => {
  if (!isoString) return "";
  // "2026-01-01T00:00:00Z" → "2026-01-01T00:00"
  return isoString.slice(0, 16);
};

// Helper to convert datetime-local to ISO
const formatDateTimeToISO = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return "";
  const date = new Date(dateTimeLocal);
  return date.toISOString();
};

// Check if voucher is expired
const isVoucherExpired = (endDate: string): boolean => {
  return new Date(endDate) < new Date();
};

// Check if voucher is in valid period
const isVoucherInValidPeriod = (
  startDate: string,
  endDate: string
): boolean => {
  const now = new Date();
  return new Date(startDate) <= now && now <= new Date(endDate);
};

interface VoucherDetailDialogProps {
  voucher: Voucher | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function VoucherDetailDialog({
  voucher,
  isOpen,
  onClose,
  onEdit,
}: VoucherDetailDialogProps) {
  if (!voucher) return null;

  const isExpired = isVoucherExpired(voucher.end_date);
  const isInValidPeriod = isVoucherInValidPeriod(
    voucher.start_date,
    voucher.end_date
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-orange-vivid" />
              Chi tiết Voucher
            </DialogTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {voucher.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-orange-vivid">
                    {voucher.voucher_code}
                  </span>
                  {voucher.shop_id ? (
                    <Badge variant="info" className="gap-1">
                      <Store className="h-3 w-3" />
                      Shop #{voucher.shop_id}
                    </Badge>
                  ) : (
                    <Badge variant="processing" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Platform
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                {isExpired ? (
                  <Badge variant="expired" className="gap-1 mb-2">
                    <XCircle className="h-3 w-3" />
                    Đã hết hạn
                  </Badge>
                ) : isInValidPeriod ? (
                  <Badge variant="active" className="gap-1 mb-2">
                    <CheckCircle className="h-3 w-3" />
                    Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="processing" className="gap-1 mb-2">
                    <Clock className="h-3 w-3" />
                    Chưa bắt đầu
                  </Badge>
                )}
                {!voucher.is_active && (
                  <Badge variant="inactive" className="gap-1 ml-2">
                    <AlertCircle className="h-3 w-3" />
                    Tạm dừng
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Discount Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                {voucher.discount_type === "PERCENTAGE" ? (
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Percent className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Giá trị giảm</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {voucher.discount_type === "PERCENTAGE"
                      ? `${parseFloat(voucher.discount_value)}%`
                      : formatCurrency(parseFloat(voucher.discount_value))}
                  </p>
                </div>
              </div>
              {voucher.discount_type === "PERCENTAGE" &&
                voucher.max_discount_amount?.Valid && (
                  <p className="text-sm text-gray-600">
                    Giảm tối đa:{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        parseFloat(voucher.max_discount_amount.String)
                      )}
                    </span>
                  </p>
                )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đơn tối thiểu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(parseFloat(voucher.min_purchase_amount))}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Áp dụng cho:{" "}
                <Badge
                  variant={
                    voucher.applies_to_type === "ORDER_TOTAL"
                      ? "info"
                      : "processing"
                  }
                  className="ml-1"
                >
                  {voucher.applies_to_type === "ORDER_TOTAL"
                    ? "Đơn hàng"
                    : "Phí ship"}
                </Badge>
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-600">
                  Tổng số lượng
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {voucher.total_quantity}
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-gray-600">Đã sử dụng</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {voucher.used_quantity}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-gray-600">Còn lại</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {voucher.remaining_quantity}
              </p>
            </div>
          </div>

          {/* Time Period */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">
                Thời gian hiệu lực
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bắt đầu</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(voucher.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Kết thúc</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(voucher.end_date)}
                </p>
              </div>
            </div>
            {isExpired && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Voucher đã hết hạn vào {formatDate(voucher.end_date)}
                </span>
              </div>
            )}
            {!isInValidPeriod && !isExpired && (
              <div className="mt-4 flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Voucher sẽ bắt đầu vào {formatDate(voucher.start_date)}
                </span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-gray-600" />
                <p className="text-sm font-medium text-gray-600">Đối tượng</p>
              </div>
              <Badge
                variant={
                  voucher.audience_type === "PUBLIC" ? "active" : "processing"
                }
              >
                {voucher.audience_type === "PUBLIC" ? "Công khai" : "Chỉ định"}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Tối đa {voucher.max_usage_per_user} lần/người
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <p className="text-sm font-medium text-gray-600">Trạng thái</p>
              </div>
              {voucher.is_active ? (
                <Badge variant="active" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Đang kích hoạt
                </Badge>
              ) : (
                <Badge variant="inactive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Tạm dừng
                </Badge>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Tạo lúc: {formatDate(voucher.created_at)}
              </p>
            </div>
          </div>

          {/* Assigned Users (if any) */}
          {voucher.audience_type === "ASSIGNED" && voucher.user_use && (
            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">
                  Người dùng được chỉ định
                </h4>
                <Badge variant="processing">{voucher.user_use.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {voucher.user_use.map((userId) => (
                  <Badge key={userId} variant="info">
                    {userId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VoucherEditDialogProps {
  voucher: Voucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherEditDialog({
  voucher,
  isOpen,
  onClose,
}: VoucherEditDialogProps) {
  const updateVoucher = useUpdateVoucher();

  const form = useForm<VoucherFormData>({
    resolver: zodResolver(updateVoucherSchema),
    defaultValues: voucher
      ? {
          name: voucher.name,
          discount_type: voucher.discount_type,
          discount_value: parseFloat(voucher.discount_value),
          is_shop_voucher: !!voucher.shop_id,
          shop_id: voucher.shop_id?.toString() || null,
          max_discount_amount: voucher.max_discount_amount?.Valid
            ? parseFloat(voucher.max_discount_amount.String)
            : undefined,
          applies_to_type: voucher.applies_to_type,
          min_purchase_amount: parseFloat(voucher.min_purchase_amount),
          audience_type: voucher.audience_type,
          start_date: formatISOToDateTimeLocal(voucher.start_date),
          end_date: formatISOToDateTimeLocal(voucher.end_date),
          total_quantity: voucher.total_quantity,
          max_usage_per_user: voucher.max_usage_per_user,
          is_active: voucher.is_active,
          user_use: voucher.user_use || [],
        }
      : undefined,
  });

  const discountType = form.watch("discount_type");
  const isShopVoucher = form.watch("is_shop_voucher");

  const onSubmit = (data: VoucherFormData) => {
    if (!voucher) return;

    try {
      // Transform to API request
      const request: UpdateVoucherRequest = {
        name: data.name,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        // Note: voucher_code cannot be updated per API
        applies_to_type: data.applies_to_type,
        min_purchase_amount: data.min_purchase_amount,
        audience_type: data.audience_type,
        start_date: formatDateTimeToISO(data.start_date),
        end_date: formatDateTimeToISO(data.end_date),
        total_quantity: data.total_quantity,
        max_usage_per_user: data.max_usage_per_user,
        is_active: data.is_active,
        max_discount_amount: data.max_discount_amount || undefined,
        user_use:
          data.user_use && data.user_use.length > 0 ? data.user_use : undefined,
      };

      console.log("Update API Request:", request);

      updateVoucher.mutate(
        { id: voucher.id, data: request },
        {
          onSuccess: () => {
            onClose();
            form.reset();
            toast.success("Cập nhật voucher thành công!");
          },
          onError: (error: any) => {
            console.error("Update voucher error:", error);
            toast.error(error?.message || "Có lỗi xảy ra khi cập nhật voucher");
          },
        }
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Có lỗi xảy ra khi xử lý form");
    }
  };

  if (!voucher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Edit className="h-6 w-6 text-orange-vivid" />
            Chỉnh sửa Voucher
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin voucher. Mã voucher không thể thay đổi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Voucher Code (Read-only) */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <Label className="text-sm text-gray-600">Mã voucher</Label>
              <p className="font-mono text-lg font-bold text-orange-vivid mt-1">
                {voucher.voucher_code}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Mã voucher không thể thay đổi
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên voucher *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Giảm giá mùa hè" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Kích hoạt voucher</FormLabel>
                      <FormDescription>
                        Bỏ chọn để tạm dừng voucher (người dùng không thể sử
                        dụng)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Shop Info (Read-only) */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <Label className="text-sm text-gray-600">Loại voucher</Label>
              {voucher.shop_id ? (
                <Badge variant="info" className="gap-1 mt-2">
                  <Store className="h-3 w-3" />
                  Shop #{voucher.shop_id}
                </Badge>
              ) : (
                <Badge variant="processing" className="gap-1 mt-2">
                  <Sparkles className="h-3 w-3" />
                  Platform
                </Badge>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Loại voucher không thể thay đổi
              </p>
            </div>

            {/* Discount Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin giảm giá</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại giảm giá *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">
                            Phần trăm (%)
                          </SelectItem>
                          <SelectItem value="FIXED_AMOUNT">
                            Số tiền cố định (VNĐ)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá trị giảm{" "}
                        {discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={
                            discountType === "PERCENTAGE"
                              ? "VD: 10"
                              : "VD: 50000"
                          }
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="applies_to_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Áp dụng cho *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ORDER_TOTAL">
                            Tổng đơn hàng
                          </SelectItem>
                          <SelectItem value="SHIPPING_FEE">
                            Phí vận chuyển
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_purchase_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn tối thiểu (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 100000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {discountType === "PERCENTAGE" && (
                <FormField
                  control={form.control}
                  name="max_discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giảm tối đa (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 50000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống nếu không giới hạn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Usage Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin sử dụng</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổng số lượng *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Đã dùng: {voucher.used_quantity}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_usage_per_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tối đa/người *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="audience_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đối tượng *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Công khai</SelectItem>
                        <SelectItem value="ASSIGNED">Chỉ định</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>Chọn ngày giờ bắt đầu</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>Chọn ngày giờ kết thúc</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  form.reset();
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={updateVoucher.isPending}
                className="bg-orange-vivid hover:bg-orange-deep"
              >
                {updateVoucher.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
