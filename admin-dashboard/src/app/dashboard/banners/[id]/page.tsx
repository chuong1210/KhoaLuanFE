"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bannerService } from "@/features/banners/services/banner-service";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Loader2,
  ImageIcon,
  Upload,
  X,
  Calendar,
  Link as LinkIcon,
  Hash,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import type { BannerFormData } from "@/features/banners/types/banner";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<BannerFormData>({
    bannerName: "",
    bannerImage: "",
    bannerUrl: "",
    bannerOrder: 1,
    isActive: true,
    startDate: "",
    endDate: "",
    bannerType: "HOME",
    targetId: "",
  });

  // Fetch banner data
  const {
    data: banner,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banner", bannerId],
    queryFn: () => bannerService.getBannerById(bannerId),
    enabled: !!bannerId,
  });

  // Initialize form with banner data
  useEffect(() => {
    if (banner) {
      setFormData({
        bannerName: banner.bannerName,
        bannerImage: banner.bannerImage,
        bannerUrl: banner.bannerUrl,
        bannerOrder: banner.bannerOrder,
        isActive: banner.isActive,
        startDate: banner.startDate.slice(0, 16),
        endDate: banner.endDate.slice(0, 16),
        bannerType: banner.bannerType,
        targetId: banner.targetId || "",
      });

      // Set image preview if banner has image
      if (banner.bannerImage) {
        setImagePreview(`${MEDIA_BASE_URL}/${banner.bannerImage}`);
      }
    }
  }, [banner]);

  const updateBannerMutation = useMutation({
    mutationFn: (data: Partial<BannerFormData>) =>
      bannerService.updateBanner(bannerId, data),
    onSuccess: () => {
      toast.success("Cập nhật banner thành công", {
        description: "Thông tin banner đã được lưu",
      });
      router.push("/dashboard/banners");
    },
    onError: (error: any) => {
      toast.error("Cập nhật banner thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bannerImage) {
      toast.error("Vui lòng chọn hình ảnh banner");
      return;
    }

    updateBannerMutation.mutate(formData);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number"
        ? Number.parseInt(e.target.value)
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn", {
          description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
        });
        return;
      }

      setFormData({ ...formData, bannerImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, bannerImage: "" });
    setImagePreview("");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin banner. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-[#FFF0E0]"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: "#FF6A00" }} />
        </Button>
        <div className="flex-1">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#E65100" }}
          >
            Chỉnh Sửa Banner
          </h2>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin banner quảng cáo của bạn
          </p>
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
            Thông tin Banner
          </CardTitle>
          <CardDescription className="text-white/90">
            Chỉnh sửa các thông tin cần thiết cho banner
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Image Upload */}
            <div className="space-y-3">
              <Label
                htmlFor="bannerImage"
                className="text-base font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <ImageIcon className="h-4 w-4" />
                Hình ảnh Banner *
              </Label>

              {!imagePreview ? (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#FF6A00] transition-colors cursor-pointer"
                  style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
                >
                  <input
                    id="bannerImage"
                    name="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="bannerImage" className="cursor-pointer">
                    <Upload
                      className="h-12 w-12 mx-auto mb-3"
                      style={{ color: "#FF6A00" }}
                    />
                    <p
                      className="font-semibold mb-1"
                      style={{ color: "#E65100" }}
                    >
                      Nhấp để tải ảnh lên
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF (tối đa 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div
                  className="relative border-2 rounded-lg overflow-hidden"
                  style={{ borderColor: "#FF6A00" }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 shadow-lg"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      {formData.bannerImage instanceof File
                        ? formData.bannerImage.name
                        : banner?.bannerImage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Banner Name */}
            <div className="space-y-2">
              <Label
                htmlFor="bannerName"
                className="text-base font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Hash className="h-4 w-4" />
                Tên Banner *
              </Label>
              <Input
                id="bannerName"
                name="bannerName"
                value={formData.bannerName}
                onChange={handleTextChange}
                placeholder="VD: Banner khuyến mãi mùa hè"
                required
                className="h-11 border-2 focus:border-[#FF6A00]"
              />
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <Label
                htmlFor="bannerUrl"
                className="text-base font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <LinkIcon className="h-4 w-4" />
                Link đích *
              </Label>
              <Input
                id="bannerUrl"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleTextChange}
                placeholder="https://example.com/promotion"
                type="text"
                required
                className="h-11 border-2 focus:border-[#FF6A00]"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Banner Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="bannerType"
                  className="text-base font-semibold"
                  style={{ color: "#E65100" }}
                >
                  Loại Banner
                </Label>
                <Select
                  value={formData.bannerType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, bannerType: value })
                  }
                >
                  <SelectTrigger className="h-11 border-2">
                    <SelectValue placeholder="Chọn loại banner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">Trang chủ</SelectItem>
                    <SelectItem value="CATEGORY">Danh mục</SelectItem>
                    <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                    <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Banner Order */}
              <div className="space-y-2">
                <Label
                  htmlFor="bannerOrder"
                  className="text-base font-semibold"
                  style={{ color: "#E65100" }}
                >
                  Thứ tự hiển thị *
                </Label>
                <Input
                  id="bannerOrder"
                  name="bannerOrder"
                  type="number"
                  value={formData.bannerOrder}
                  onChange={handleTextChange}
                  min="0"
                  max="999"
                  required
                  className="h-11 border-2 focus:border-[#FF6A00]"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <Calendar className="h-4 w-4" />
                  Ngày bắt đầu *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleTextChange}
                  required
                  className="h-11 border-2 focus:border-[#FF6A00]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <Calendar className="h-4 w-4" />
                  Ngày kết thúc *
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleTextChange}
                  required
                  className="h-11 border-2 focus:border-[#FF6A00]"
                />
              </div>
            </div>

            {/* Target ID */}
            <div className="space-y-2">
              <Label
                htmlFor="targetId"
                className="text-base font-semibold"
                style={{ color: "#E65100" }}
              >
                ID Mục tiêu (Tùy chọn)
              </Label>
              <Input
                id="targetId"
                name="targetId"
                value={formData.targetId}
                onChange={handleTextChange}
                placeholder="VD: product-123, category-456"
                className="h-11 border-2 focus:border-[#FF6A00]"
              />
            </div>

            {/* Active Status */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border-2"
              style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
            >
              <div className="space-y-0.5">
                <Label
                  htmlFor="isActive"
                  className="text-base font-semibold"
                  style={{ color: "#E65100" }}
                >
                  Trạng thái hoạt động
                </Label>
                <p className="text-sm text-muted-foreground">
                  Banner sẽ hiển thị khi được kích hoạt
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: any) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateBannerMutation.isPending}
                className="flex-1 h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: updateBannerMutation.isPending
                    ? "#FFB38A"
                    : "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                {updateBannerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Cập nhật banner
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-12 px-8 border-2"
                style={{ borderColor: "#FF6A00", color: "#FF6A00" }}
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
