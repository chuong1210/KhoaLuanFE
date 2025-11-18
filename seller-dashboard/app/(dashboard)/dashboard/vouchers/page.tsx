"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherService } from "@/services/voucher-service";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Ticket,
  RefreshCw,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Voucher } from "@/types/voucher";

export default function VouchersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: vouchers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherService.getVouchers,
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("Đã xóa voucher");
    },
    onError: () => {
      toast.error("Không thể xóa voucher");
    },
  });

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    const endDate = new Date(voucher.end_date);
    const startDate = new Date(voucher.start_date);

    if (!voucher.is_active) {
      return <Badge className="bg-gray-500 text-white">Không hoạt động</Badge>;
    }
    if (startDate > now) {
      return <Badge className="bg-blue-500 text-white">Sắp diễn ra</Badge>;
    }
    if (endDate < now) {
      return <Badge className="bg-red-600 text-white">Hết hạn</Badge>;
    }
    if (voucher.used_quantity >= voucher.total_quantity) {
      return <Badge className="bg-red-600 text-white">Hết lượt</Badge>;
    }
    return (
      <Badge className="text-white" style={{ backgroundColor: "#4CAF50" }}>
        Đang hoạt động
      </Badge>
    );
  };

  const getActiveCount = () => {
    if (!vouchers) return 0;
    const now = new Date();
    return vouchers.filter((v) => {
      const endDate = new Date(v.end_date);
      const startDate = new Date(v.start_date);
      return (
        v.is_active &&
        startDate <= now &&
        endDate > now &&
        v.used_quantity < v.total_quantity
      );
    }).length;
  };

  const getTotalUsed = () => {
    if (!vouchers) return 0;
    return vouchers.reduce((sum, v) => sum + v.used_quantity, 0);
  };

  return (
    <div className="space-y-6 p-6">
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
            Quản lý Voucher
          </h2>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý các voucher giảm giá cho cửa hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-[#FFB38A] hover:bg-[#FFF0E0]"
            style={{ color: "#FF6A00" }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            onClick={() => router.push("/dashboard/vouchers/create")}
            className="text-white"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo voucher mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng voucher
            </CardTitle>
            <Ticket className="h-5 w-5" style={{ color: "#FF6A00" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#FF6A00" }}>
              {vouchers?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang hoạt động
            </CardTitle>
            <Ticket className="h-5 w-5" style={{ color: "#4CAF50" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#4CAF50" }}>
              {getActiveCount()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đã sử dụng
            </CardTitle>
            <Tag className="h-5 w-5" style={{ color: "#FFB000" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#FFB000" }}>
              {getTotalUsed()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle style={{ color: "#E65100" }}>Danh sách Voucher</CardTitle>
          <CardDescription>
            Quản lý các voucher giảm giá của cửa hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-800" />
              <AlertTitle className="text-red-800">Lỗi</AlertTitle>
              <AlertDescription className="text-red-800">
                Không thể tải danh sách voucher
              </AlertDescription>
            </Alert>
          ) : vouchers && vouchers.length > 0 ? (
            <div className="rounded-lg border border-[#FFB38A] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FFF0E0] hover:bg-[#FFF0E0]">
                    <TableHead style={{ color: "#E65100" }}>
                      Tên voucher
                    </TableHead>
                    <TableHead style={{ color: "#E65100" }}>Mã</TableHead>
                    <TableHead style={{ color: "#E65100" }}>Loại</TableHead>
                    <TableHead style={{ color: "#E65100" }}>Giảm giá</TableHead>
                    <TableHead style={{ color: "#E65100" }}>
                      Đã dùng/Tổng
                    </TableHead>
                    <TableHead style={{ color: "#E65100" }}>Thời hạn</TableHead>
                    <TableHead style={{ color: "#E65100" }}>
                      Trạng thái
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: "#E65100" }}
                    >
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow
                      key={voucher.id}
                      className="hover:bg-[#FFF0E0]/30"
                    >
                      <TableCell className="font-medium">
                        {voucher.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-[#FF8A33] text-[#FF8A33] bg-[#FFF0E0]"
                        >
                          {voucher.voucher_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {voucher.applies_to_type === "ORDER_TOTAL"
                            ? "Đơn hàng"
                            : "Phí ship"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className="font-semibold"
                          style={{ color: "#FF6A00" }}
                        >
                          {voucher.discount_type === "PERCENTAGE"
                            ? `${voucher.discount_value}%`
                            : formatPrice(voucher.discount_value)}
                        </div>
                        {voucher.discount_type === "PERCENTAGE" &&
                          Number(voucher.max_discount_amount) > 0 && (
                            <div className="text-xs text-gray-500">
                              Tối đa: {formatPrice(voucher.max_discount_amount)}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold"
                            style={{ color: "#FF6A00" }}
                          >
                            {voucher.used_quantity}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>{voucher.total_quantity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${
                                (voucher.used_quantity /
                                  voucher.total_quantity) *
                                100
                              }%`,
                              background:
                                "linear-gradient(90deg, #FF6A00 0%, #FFB000 100%)",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(voucher.start_date)}</p>
                          <p className="text-gray-500">
                            {formatDate(voucher.end_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-[#FFF0E0]"
                            >
                              <MoreHorizontal
                                className="h-4 w-4"
                                style={{ color: "#FF6A00" }}
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-[#FFB38A]"
                          >
                            <DropdownMenuLabel style={{ color: "#E65100" }}>
                              Thao tác
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#FFB38A]/30" />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/vouchers/${voucher.id}`)
                              }
                              className="hover:bg-[#FFF0E0] cursor-pointer"
                            >
                              <Eye
                                className="mr-2 h-4 w-4"
                                style={{ color: "#FF8A33" }}
                              />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/vouchers/${voucher.id}/edit`
                                )
                              }
                              className="hover:bg-[#FFF0E0] cursor-pointer"
                            >
                              <Edit
                                className="mr-2 h-4 w-4"
                                style={{ color: "#FF8A33" }}
                              />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#FFB38A]/30" />
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  confirm("Bạn có chắc muốn xóa voucher này?")
                                ) {
                                  deleteVoucherMutation.mutate(voucher.id);
                                }
                              }}
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB38A 0%, #FFD3A3 100%)",
                }}
              >
                <Ticket className="h-8 w-8 text-[#E65100]" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-4">
                Chưa có voucher nào
              </p>
              <Button
                variant="outline"
                className="border-[#FFB38A] hover:bg-[#FFF0E0]"
                style={{ color: "#FF6A00" }}
                onClick={() => router.push("/dashboard/vouchers/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo voucher mới
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
