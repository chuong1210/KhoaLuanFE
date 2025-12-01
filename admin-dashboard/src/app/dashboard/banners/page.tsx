"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/features/banners/services/banner-service";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Thêm imports cho Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Calendar,
  Link as LinkIcon,
  Filter, // Icon lọc
  X, // Icon xóa lọc
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

// Định nghĩa các loại banner để dùng chung cho Select và Label
const BANNER_TYPES = [
  { value: "HOME", label: "Trang chủ" },
  { value: "CATEGORY", label: "Danh mục" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "PROMOTION", label: "Khuyến mãi" },
];

export default function BannersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  // State cho bộ lọc
  const [filterType, setFilterType] = useState<string>("ALL");

  // Cập nhật useQuery để phụ thuộc vào filterType
  const {
    data: bannersData,
    isLoading,
    error,
  } = useQuery({
    // Thêm filterType vào queryKey để tự động fetch lại khi đổi lọc
    queryKey: ["banners", filterType],
    queryFn: () =>
      bannerService.getBanners({
        pageNumber: 1,
        pageSize: 30,
        // Chỉ gửi bannerType nếu khác "ALL"
        bannerType: filterType === "ALL" ? undefined : filterType,
      }),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Đã xóa banner thành công");
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    },
    onError: () => {
      toast.error("Không thể xóa banner", {
        description: "Vui lòng thử lại sau",
      });
    },
  });

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bannerToDelete) {
      deleteBannerMutation.mutate(bannerToDelete);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBannerTypeLabel = (type: string) => {
    const found = BANNER_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const banners = bannersData?.banners || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#E65100" }}
          >
            Quản lý Banner
          </h2>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các banner quảng cáo thu hút khách hàng
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/banners/create")}
          className="h-11 px-6 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Tạo banner mới
        </Button>
      </div>

      {/* Thanh công cụ lọc */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Filter className="h-4 w-4" />
          <span>Bộ lọc:</span>
        </div>

        <div className="w-[200px]">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger className="h-9 border-dashed focus:ring-0 focus:ring-offset-0 focus:border-orange-500">
              <SelectValue placeholder="Chọn loại banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {BANNER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filterType !== "ALL" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterType("ALL")}
            className="h-9 px-2 text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 h-4 w-4" />
            Xóa lọc
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          Hiển thị:{" "}
          <span className="font-semibold text-orange-600">
            {banners.length}
          </span>{" "}
          kết quả
        </div>
      </div>

      <Card className="border-2 shadow-lg" style={{ borderColor: "#FFB38A" }}>
        <CardHeader
          style={{
            background: "linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)",
          }}
        >
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Danh sách Banner
          </CardTitle>
          <CardDescription className="text-white/90">
            {filterType === "ALL"
              ? "Tất cả banner đang được quản lý"
              : `Đang lọc theo: ${getBannerTypeLabel(filterType)}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-32 w-48 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                Không thể tải danh sách banner. Vui lòng thử lại sau.
              </AlertDescription>
            </Alert>
          ) : banners.length > 0 ? (
            <div className="space-y-4">
              {banners.map((banner) => (
                <Card
                  key={banner.id}
                  className="overflow-hidden border-2 hover:shadow-lg transition-all group"
                  style={{ borderColor: "#FFB38A" }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Banner Image */}
                    <div
                      className="relative h-40 sm:h-32 sm:w-48 shrink-0 overflow-hidden rounded-lg border-2"
                      style={{ borderColor: "#FF6A00" }}
                    >
                      <img
                        src={`${MEDIA_BASE_URL}/${banner.bannerImage}`}
                        alt={banner.bannerName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg";
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={"cancelled"}
                          className="bg-white/90 backdrop-blur-sm border-0 font-semibold shadow-sm"
                          style={{ color: "#FF6A00" }}
                        >
                          #{banner.bannerOrder}
                        </Badge>
                      </div>
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-bold truncate mb-1 group-hover:text-[#E65100] transition-colors"
                            style={{ color: "#333" }}
                          >
                            {banner.bannerName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[300px]">
                              {banner.bannerUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {banner.isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge
                              variant={"active"}
                              className="bg-gray-200 text-gray-700"
                            >
                              Tạm dừng
                            </Badge>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/banners/${banner.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/banners/${banner.id}`)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(banner.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa banner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm mt-auto pt-2 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={"cancelled"}
                            className="font-medium"
                            style={{
                              borderColor: "#FFB38A",
                              color: "#E65100",
                              backgroundColor: "#FFF3E0",
                            }}
                          >
                            {getBannerTypeLabel(banner.bannerType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(banner.startDate)} -{" "}
                            {formatDate(banner.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                <Filter className="h-10 w-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {filterType === "ALL"
                  ? "Chưa có banner nào"
                  : "Không tìm thấy kết quả"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {filterType === "ALL"
                  ? "Bắt đầu tạo banner quảng cáo đầu tiên để thu hút khách hàng."
                  : `Chưa có banner nào thuộc loại "${getBannerTypeLabel(
                      filterType
                    )}". Hãy thử chọn loại khác hoặc tạo mới.`}
              </p>
              <Button
                onClick={() => {
                  if (filterType !== "ALL") {
                    setFilterType("ALL");
                  } else {
                    router.push("/dashboard/banners/create");
                  }
                }}
                variant={filterType !== "ALL" ? "outline" : "default"}
                className={
                  filterType === "ALL"
                    ? "text-white bg-orange-600 hover:bg-orange-700"
                    : ""
                }
              >
                {filterType !== "ALL" ? "Xóa bộ lọc" : "Tạo banner mới"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa banner</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
