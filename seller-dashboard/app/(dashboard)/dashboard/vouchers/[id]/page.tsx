"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
import type { VoucherUsageDetail } from "@/types/voucher";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  TrendingUp,
  User,
  Clock,
  Tag,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { VoucherFormData, Voucher } from "@/types/voucher";

export default function EditVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const voucherId = params.id as string;

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

  const [usageOffset, setUsageOffset] = useState(0);
  const usageLimit = 20;

  const {
    data: voucher,
    isLoading: voucherLoading,
    error: voucherError,
  } = useQuery<Voucher>({
    queryKey: ["voucher", voucherId],
    queryFn: () => voucherService.getVoucherById(voucherId),
    enabled: !!voucherId,
  });

  const { data: usageDetails, isLoading: usageLoading } = useQuery<
    VoucherUsageDetail[]
  >({
    queryKey: ["voucherUsage", voucherId, usageOffset],
    queryFn: () =>
      voucherService.getVoucherUsageDetails(voucherId, usageLimit, usageOffset),
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
        user_use_str: voucher.user_use?.join(", ") || "",
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
      (!formData.user_use_str || formData.user_use_str.trim() === "")
    ) {
      toast.error("Vui lòng nhập danh sách user IDs cho audience ASSIGNED");
      return;
    }

    const payload = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    updateVoucherMutation.mutate({ id: voucherId, data: payload });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSelectChange = (name: keyof VoucherFormData, value: string) => {
    setFormData({ ...formData, [name]: value as any });
  };

  const handleUserUseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const userIds = value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    setFormData({ ...formData, user_use_str: value, user_use: userIds });
  };

  const handleIsActiveChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked });
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadMoreUsage = () => {
    setUsageOffset((prev) => prev + usageLimit);
  };

  if (voucherError) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-800" />
          <AlertTitle className="text-red-800">Lỗi</AlertTitle>
          <AlertDescription className="text-red-800">
            Không thể tải thông tin voucher. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (voucherLoading || !voucher) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
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
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
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
            Chỉnh sửa Voucher
          </h2>
          <p className="text-gray-600">
            Cập nhật thông tin voucher "{voucher.name}"
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-[#FFF0E0]/50">
          <CardTitle style={{ color: "#E65100" }}>Thông tin Voucher</CardTitle>
          <CardDescription>
            Cập nhật các trường cần thiết. Thay đổi sẽ được lưu ngay lập tức.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same form structure as create page but with pre-filled data */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên voucher *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-[#FFB38A] focus:border-[#FF6A00]"
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
                  className="border-[#FFB38A] focus:border-[#FF6A00]"
                  required
                />
              </div>
            </div>

            {/* Discount, Apply, Audience, Dates sections - same as create page */}
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
                    <SelectTrigger className="border-[#FFB38A]">
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
                    min="0"
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
                    min="0"
                    step="1000"
                    className="border-[#FFB38A] focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Other sections similar to create page */}
            <div
              className="flex items-center space-x-2 p-4 rounded-lg border-2 border-[#FFB38A]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,179,138,0.1) 0%, rgba(255,211,163,0.1) 100%)",
              }}
            >
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleIsActiveChange}
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                Kích hoạt voucher
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateVoucherMutation.isPending}
                className="flex-1 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
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
                className="border-[#FFB38A] hover:bg-[#FFF0E0]"
                style={{ color: "#FF6A00" }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Usage Stats Section */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-[#FFF0E0]/50 border-b border-[#FFB38A]/30">
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: "#E65100" }}
          >
            <TrendingUp className="h-5 w-5" />
            Thống kê sử dụng Voucher
          </CardTitle>
          <CardDescription>
            Tổng {usageDetails?.length || 0} lần sử dụng gần đây
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {usageLoading && usageOffset === 0 ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : usageDetails && usageDetails.length > 0 ? (
            <div className="relative">
              <div className="rounded-lg overflow-hidden border border-[#FFB38A]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FFF0E0] hover:bg-[#FFF0E0]">
                      <TableHead style={{ color: "#E65100" }}>ID</TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        User ID
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Giảm giá
                      </TableHead>
                      <TableHead style={{ color: "#E65100" }}>
                        Thời gian sử dụng
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageDetails.map((usage) => (
                      <TableRow
                        key={usage.id}
                        className="hover:bg-[#FFF0E0]/30 transition-colors"
                      >
                        <TableCell
                          className="font-medium"
                          style={{ color: "#FF6A00" }}
                        >
                          {usage.id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-[#FF8A33] text-[#FF8A33] bg-[#FFF0E0]"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {usage.user_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(usage.discount_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock
                              className="h-3 w-3"
                              style={{ color: "#FF6A00" }}
                            />
                            {formatDate(usage.used_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-[#FFB38A]/30 bg-[#FFF0E0]/30 flex justify-center">
                <Button
                  onClick={loadMoreUsage}
                  variant="outline"
                  className="border-[#FF6A00] hover:bg-[#FF6A00] hover:text-white"
                  style={{ color: "#FF6A00" }}
                  disabled={usageLoading}
                >
                  {usageLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Tải thêm ({usageLimit} lần)
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FFF0E0]/20">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: "#E65100" }}
              >
                Chưa có lượt sử dụng
              </h3>
              <p className="text-gray-600 mb-4">
                Voucher này chưa được áp dụng trong đơn hàng nào.
              </p>
              <Badge
                className="text-white"
                style={{ backgroundColor: "#FF6A00" }}
              >
                Sẵn sàng cho khách hàng!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
