// pages/dashboard/vouchers/[id]/edit.tsx
// New: Update page, similar to Create but loads data with useQuery.
// - Pre-populate form.
// - Use updateMutation.
// - For user_use: Display as comma-separated string.
// - Validate on submit.

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { toast } from "sonner";
import {
  Loader2,
  Ticket,
  Save,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Package,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import type { VoucherFormData, Voucher } from "@/types/voucher";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpdateVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const voucherId = params.id as string;

  const [formData, setFormData] = useState<VoucherFormData>({
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
    is_active: true,
  });

  const { data: voucher, isLoading } = useQuery({
    queryKey: ["voucher", voucherId],
    queryFn: () => voucherService.getVoucherById(voucherId),
    enabled: !!voucherId,
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        name: voucher.name,
        voucher_code: voucher.voucher_code,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        max_discount_amount: Number(voucher.max_discount_amount) || 0,
        applies_to_type: voucher.applies_to_type,
        min_purchase_amount: Number(voucher.min_purchase_amount),
        audience_type: voucher.audience_type,
        start_date: new Date(voucher.start_date).toISOString().slice(0, 16),
        end_date: new Date(voucher.end_date).toISOString().slice(0, 16),
        total_quantity: voucher.total_quantity,
        max_usage_per_user: voucher.max_usage_per_user,
        user_use: voucher.user_use || [],
        is_active: voucher.is_active,
      });
    }
  }, [voucher]);

  const updateVoucherMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VoucherFormData>;
    }) => voucherService.updateVoucher(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật voucher thành công");
      router.push("/dashboard/vouchers");
    },
    onError: (error: any) => {
      toast.error("Cập nhật voucher thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    if (
      formData.audience_type === "ASSIGNED" &&
      (!formData.user_use || formData.user_use.length === 0)
    ) {
      toast.error("Vui lòng nhập danh sách user IDs cho audience ASSIGNED");
      return;
    }
    const userUseArray = Array.isArray(formData.user_use)
      ? formData.user_use
      : (formData.user_use || "")
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
    updateVoucherMutation.mutate({
      id: voucherId,
      data: { ...formData, user_use: userUseArray },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "number"
        ? Number.parseFloat(e.target.value) || 0
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
    setFormData({
      ...formData,
      user_use: (e.target.value || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
    });
  };

  const handleIsActiveChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!voucher) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Không tìm thấy voucher</AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Ticket className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa Voucher
          </h2>
          <p className="text-muted-foreground">
            Cập nhật thông tin voucher "{voucher.name}"
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Voucher</CardTitle>
          <CardDescription>
            Cập nhật các trường cần thiết. Thay đổi sẽ được lưu ngay lập tức.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same form structure as Create, but with is_active toggle */}
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
                  required
                />
              </div>
            </div>

            {/* Discount Settings - same as Create */}

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
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
                    <SelectTrigger>
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
                  />
                </div>
              </div>
            </div>

            {/* Apply Settings - same */}

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
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
                    <SelectTrigger>
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
                    required
                  />
                </div>
              </div>
            </div>

            {/* Audience & Usage - same, plus is_active toggle */}

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
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
                    <SelectTrigger>
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
                      User IDs (phân cách bằng dấu phẩy)
                    </Label>
                    <Input
                      id="user_use"
                      name="user_use"
                      value={formData.user_use?.join(", ") || ""}
                      onChange={handleUserUseChange}
                      placeholder="user_001, user_002"
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
                    required
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleIsActiveChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Kích hoạt voucher
                </Label>
              </div>
            </div>

            {/* Dates - same */}

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
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
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateVoucherMutation.isPending}
                className="flex-1"
              >
                {updateVoucherMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Cập nhật
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
