"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
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
  CreditCard,
  Clock,
  ShieldCheck
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

import type { VoucherFormData } from "@/types/voucher";
import { useAppSelector } from "@/store/hooks";

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
    is_active: true,
  });

  const createVoucherMutation = useMutation({
    mutationFn: (data: VoucherFormData) => voucherService.createVoucher(data, shopId),
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
      toast.error("Lỗi thời gian", { description: "Ngày kết thúc phải sau ngày bắt đầu" });
      return;
    }
    if (formData.audience_type === "ASSIGNED" && !formData.user_use_str.trim()) {
      toast.error("Thiếu thông tin", { description: "Vui lòng nhập danh sách User ID" });
      return;
    }

    // Prepare Payload
    const payload: VoucherFormData = {
      ...formData,

      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      shop_id: shopId
    };

    createVoucherMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSelectChange = (name: keyof VoucherFormData, value: string) => {
    setFormData({ ...formData, [name]: value as any });
  };

  const handleUserUseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const userIds = value.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
    setFormData({ ...formData, user_use_str: value, user_use: userIds });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-10">
      {/* --- Header --- */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tạo Voucher Mới</h1>
              <p className="text-sm text-gray-500">Thiết lập mã giảm giá cho cửa hàng</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} className="border-orange-200 text-orange-700 hover:bg-orange-50">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createVoucherMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 shadow-md transition-all"
            >
              {createVoucherMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu Voucher
            </Button>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Basic Information */}
          <Card className="border-orange-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-50/30 border-b border-orange-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                <Ticket className="h-5 w-5" /> Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Tên chương trình <span className="text-red-500">*</span></Label>
                  <Input
                    id="name" name="name" required
                    value={formData.name} onChange={handleChange}
                    placeholder="VD: Siêu Sale Mùa Hè 2024"
                    className="border-gray-200 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voucher_code" className="text-gray-700 font-medium">Mã Voucher (Code) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-mono">#</span>
                    </div>
                    <Input
                      id="voucher_code" name="voucher_code" required
                      value={formData.voucher_code} onChange={handleChange}
                      placeholder="SUMMER2024"
                      className="pl-8 font-mono uppercase border-gray-200 focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Mã này khách hàng sẽ nhập khi thanh toán.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Discount Configuration */}
          <Card className="border-orange-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-50/30 border-b border-orange-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                <Percent className="h-5 w-5" /> Thiết lập giảm giá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Loại giảm giá</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(val) => handleSelectChange("discount_type", val)}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Theo phần trăm (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Mức giảm {formData.discount_type === "PERCENTAGE" ? "(%)" : "(VNĐ)"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="discount_value" type="number" required
                    value={formData.discount_value} onChange={handleChange}
                    min="0"
                    className="border-gray-200 focus:ring-orange-400"
                  />
                </div>
              </div>

              {formData.discount_type === "PERCENTAGE" && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Label className="text-gray-700 font-medium">Giảm tối đa (VNĐ)</Label>
                  <Input
                    name="max_discount_amount" type="number"
                    value={formData.max_discount_amount} onChange={handleChange}
                    placeholder="0 (Không giới hạn)"
                    className="bg-white border-gray-200 focus:ring-orange-400"
                  />
                  <p className="text-xs text-gray-500">Giới hạn số tiền giảm tối đa cho mỗi đơn hàng.</p>
                </div>
              )}

              <Separator className="bg-gray-100" />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Áp dụng cho</Label>
                  <Select
                    value={formData.applies_to_type}
                    onValueChange={(val) => handleSelectChange("applies_to_type", val)}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER_TOTAL">Tổng giá trị đơn hàng</SelectItem>
                      <SelectItem value="SHIPPING_FEE">Phí vận chuyển</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Đơn tối thiểu (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input
                    name="min_purchase_amount" type="number" required
                    value={formData.min_purchase_amount} onChange={handleChange}
                    className="border-gray-200 focus:ring-orange-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-1 space-y-6">

          {/* 3. Timing */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="bg-orange-50/30 border-b border-orange-100 py-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-800">
                <Clock className="h-4 w-4" /> Thời gian hiệu lực
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase font-semibold">Bắt đầu</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local" name="start_date" required
                    value={formData.start_date} onChange={handleChange}
                    className="pl-9 border-gray-200 text-sm focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase font-semibold">Kết thúc</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local" name="end_date" required
                    value={formData.end_date} onChange={handleChange}
                    className="pl-9 border-gray-200 text-sm focus:ring-orange-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Usage Limits */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="bg-orange-50/30 border-b border-orange-100 py-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-800">
                <Package className="h-4 w-4" /> Giới hạn sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Tổng số lượng phát hành</Label>
                <Input
                  type="number" name="total_quantity" min="1" required
                  value={formData.total_quantity} onChange={handleChange}
                  className="border-gray-200 focus:ring-orange-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Giới hạn lượt dùng / User</Label>
                <Input
                  type="number" name="max_usage_per_user" min="1" required
                  value={formData.max_usage_per_user} onChange={handleChange}
                  className="border-gray-200 focus:ring-orange-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Audience & Status */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="bg-orange-50/30 border-b border-orange-100 py-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-800">
                <Users className="h-4 w-4" /> Đối tượng & Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Phạm vi áp dụng</Label>
                <Select
                  value={formData.audience_type}
                  onValueChange={(val) => handleSelectChange("audience_type", val)}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Công khai (Tất cả mọi người)</SelectItem>
                    <SelectItem value="ASSIGNED">Chỉ định User cụ thể</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.audience_type === "ASSIGNED" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label className="text-sm text-gray-700">Danh sách User ID (phân cách dấu phẩy)</Label>
                  <Input
                    name="user_use"
                    value={formData.user_use_str} onChange={handleUserUseChange}
                    placeholder="user_1, user_2..."
                    className="border-gray-200 focus:ring-orange-400"
                  />
                </div>
              )}

              <Separator className="bg-gray-100 my-2" />

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <Label htmlFor="is_active" className="text-sm font-medium text-green-800 cursor-pointer">Kích hoạt ngay</Label>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}