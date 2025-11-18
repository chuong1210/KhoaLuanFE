"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
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
import { toast } from "sonner";
import {
  Loader2,
  Ticket,
  Save,
  Calendar,
  Percent,
  Users,
  Package,
  ArrowLeft,
} from "lucide-react";
import type { VoucherFormData } from "@/types/voucher";

export default function CreateVoucherPage() {
  const router = useRouter();

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
    is_active: true,
  });

  const createVoucherMutation = useMutation({
    mutationFn: (data: VoucherFormData) => voucherService.createVoucher(data),
    onSuccess: () => {
      toast.success("Đã tạo voucher thành công");
      router.push("/dashboard/vouchers");
    },
    onError: (error: any) => {
      toast.error("Tạo voucher thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    if (
      formData.audience_type === "ASSIGNED" &&
      (!formData.user_use_str || formData.user_use_str.trim() === "")
    ) {
      toast.error("Vui lòng nhập danh sách user IDs cho audience ASSIGNED");
      return;
    }

    // Convert dates to ISO format
    const payload: VoucherFormData = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    createVoucherMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSelectChange = (name: keyof VoucherFormData, value: string) => {
    setFormData({
      ...formData,
      [name]: value as any,
    });
  };

  const handleUserUseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const userIds = value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    setFormData({
      ...formData,
      user_use_str: value,
      user_use: userIds,
    });
  };

  const handleIsActiveChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          size="sm"
          className="hover:bg-[#FFF0E0]"
          style={{ color: "#FF6A00" }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
          }}
        >
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tạo Voucher Mới
          </h2>
          <p className="text-gray-600">
            Điền thông tin để tạo voucher giảm giá
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-[#FFF0E0]/50">
          <CardTitle style={{ color: "#E65100" }}>Thông tin Voucher</CardTitle>
          <CardDescription>Điền đầy đủ các trường bắt buộc</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên voucher *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Voucher Giảm Giá 15%"
                  className="border-[#FFB38A] focus:border-[#FF6A00] focus:ring-[#FF6A00]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher_code">Mã voucher *</Label>
                <Input
                  id="voucher_code"
                  name="voucher_code"
                  value={formData.voucher_code}
                  onChange={handleChange}
                  placeholder="SALE15"
                  className="border-[#FFB38A] focus:border-[#FF6A00] focus:ring-[#FF6A00]/20"
                  required
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div
              className="space-y-4 p-4 rounded-lg border-2 border-[#FFB38A]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,179,138,0.1) 0%, rgba(255,211,163,0.1) 100%)",
              }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Percent className="h-4 w-4" /> Cài đặt giảm giá
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Loại giảm giá *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) =>
                      handleSelectChange("discount_type", value)
                    }
                  >
                    <SelectTrigger className="border-[#FFB38A] focus:border-[#FF6A00]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        Số tiền cố định (VNĐ)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Giá trị giảm{" "}
                    {formData.discount_type === "PERCENTAGE" ? "(%)" : "(VNĐ)"}{" "}
                    *
                  </Label>
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={handleChange}
                    placeholder={
                      formData.discount_type === "PERCENTAGE" ? "15" : "50000"
                    }
                    min="0"
                    max={
                      formData.discount_type === "PERCENTAGE" ? 100 : undefined
                    }
                    step={formData.discount_type === "PERCENTAGE" ? 0.1 : 1000}
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Giảm tối đa (VNĐ)</Label>
                  <Input
                    id="max_discount_amount"
                    name="max_discount_amount"
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={handleChange}
                    placeholder="0 (không giới hạn)"
                    min="0"
                    step="1000"
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Apply Settings */}
            <div
              className="space-y-4 p-4 rounded-lg border-2 border-[#FFB38A]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,179,138,0.1) 0%, rgba(255,211,163,0.1) 100%)",
              }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Package className="h-4 w-4" /> Áp dụng cho
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Áp dụng cho *</Label>
                  <Select
                    value={formData.applies_to_type}
                    onValueChange={(value) =>
                      handleSelectChange("applies_to_type", value)
                    }
                  >
                    <SelectTrigger className="border-[#FFB38A] focus:border-[#FF6A00]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER_TOTAL">Tổng đơn hàng</SelectItem>
                      <SelectItem value="SHIPPING_FEE">
                        Phí vận chuyển
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_purchase_amount">
                    Đơn hàng tối thiểu (VNĐ) *
                  </Label>
                  <Input
                    id="min_purchase_amount"
                    name="min_purchase_amount"
                    type="number"
                    value={formData.min_purchase_amount}
                    onChange={handleChange}
                    placeholder="100000"
                    min="0"
                    step="1000"
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Audience & Usage */}
            <div
              className="space-y-4 p-4 rounded-lg border-2 border-[#FFB38A]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,179,138,0.1) 0%, rgba(255,211,163,0.1) 100%)",
              }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Users className="h-4 w-4" /> Đối tượng & Số lượng
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Audience type *</Label>
                  <Select
                    value={formData.audience_type}
                    onValueChange={(value) =>
                      handleSelectChange("audience_type", value)
                    }
                  >
                    <SelectTrigger className="border-[#FFB38A] focus:border-[#FF6A00]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Công khai (Tất cả)</SelectItem>
                      <SelectItem value="ASSIGNED">
                        Gán cho user cụ thể
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.audience_type === "ASSIGNED" && (
                  <div className="space-y-2">
                    <Label htmlFor="user_use">
                      User IDs (phân cách bằng dấu phẩy) *
                    </Label>
                    <Input
                      id="user_use"
                      name="user_use"
                      value={formData.user_use_str}
                      onChange={handleUserUseChange}
                      placeholder="user_001, user_002"
                      className="border-[#FFB38A] focus:border-[#FF6A00]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="total_quantity">Tổng số lượng *</Label>
                  <Input
                    id="total_quantity"
                    name="total_quantity"
                    type="number"
                    value={formData.total_quantity}
                    onChange={handleChange}
                    placeholder="1000"
                    min="1"
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_usage_per_user">
                    Sử dụng tối đa/user *
                  </Label>
                  <Input
                    id="max_usage_per_user"
                    name="max_usage_per_user"
                    type="number"
                    value={formData.max_usage_per_user}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-[#FFB38A]/30">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleIsActiveChange}
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm font-medium leading-none"
                >
                  Kích hoạt voucher ngay
                </Label>
              </div>
            </div>

            {/* Dates */}
            <div
              className="space-y-4 p-4 rounded-lg border-2 border-[#FFB38A]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,179,138,0.1) 0%, rgba(255,211,163,0.1) 100%)",
              }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Calendar className="h-4 w-4" /> Thời gian hiệu lực
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Ngày bắt đầu *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Ngày kết thúc *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createVoucherMutation.isPending}
                className="flex-1 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                {createVoucherMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Tạo voucher
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-[#FFB38A] hover:bg-[#FFF0E0]"
                style={{ color: "#FF6A00" }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
