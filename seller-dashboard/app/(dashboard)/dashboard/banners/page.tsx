"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/services/banner-service";
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
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

export default function BannersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const {
    data: bannersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.getBanners({ pageNumber: 1, pageSize: 30 }),
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
    const types: Record<string, string> = {
      HOME: "Trang chủ",
      CATEGORY: "Danh mục",
      PRODUCT: "Sản phẩm",
      PROMOTION: "Khuyến mãi",
    };
    return types[type] || type;
  };

  const banners = bannersData?.banners || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            {banners.length} banner đang được quản lý
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
                  className="overflow-hidden border-2 hover:shadow-lg transition-all"
                  style={{ borderColor: "#FFB38A" }}
                >
                  <div className="flex gap-4 p-4">
                    {/* Banner Image */}
                    <div
                      className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg border-2"
                      style={{ borderColor: "#FF6A00" }}
                    >
                      <img
                        src={`${MEDIA_BASE_URL}/${banner.bannerImage}`}
                        alt={banner.bannerName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=128&width=192";
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm border-0 font-semibold"
                          style={{ color: "#FF6A00" }}
                        >
                          #{banner.bannerOrder}
                        </Badge>
                      </div>
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-bold truncate mb-1"
                            style={{ color: "#E65100" }}
                          >
                            {banner.bannerName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <LinkIcon className="h-3.5 w-3.5" />
                            <span className="truncate">{banner.bannerUrl}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {banner.isActive ? (
                            <Badge className="bg-success text-white">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Tạm dừng</Badge>
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

                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Badge
                            variant="outline"
                            style={{ borderColor: "#FFB38A", color: "#E65100" }}
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
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "#E65100" }}
              >
                Chưa có banner nào
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Bắt đầu tạo banner quảng cáo đầu tiên để thu hút khách hàng đến
                cửa hàng của bạn
              </p>
              <Button
                onClick={() => router.push("/dashboard/banners/create")}
                className="h-11 px-6 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Tạo banner mới
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
