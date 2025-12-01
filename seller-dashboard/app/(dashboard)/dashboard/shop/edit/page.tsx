"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressSelector } from "../components/address-selector";
import { shopService } from "@/services/shop-service";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/real-switch"; // Cần cài shadcn switch
import { toast } from "sonner";
import {
  Loader2,
  Store,
  Upload,
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  ImageIcon,
  ArrowLeft,
  AlertCircle,
  Save,
} from "lucide-react";
import type { UpdateShopRequest } from "@/types/shop";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppSelector } from "@/store/hooks";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

export default function EditShopPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // State lưu lỗi validation từ Backend
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // State form
  const [formData, setFormData] = useState<UpdateShopRequest>({
    shopName: "",
    shopDescription: "",
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    shopPersonalIdentifyId: "",
    shopStatus: true,
    shopLogo: undefined,
    shopBanner: undefined,
    bannerType: "HOME",
  });

  // State preview ảnh
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // 1. Fetch Shop Data
  const {
    data: shop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentShop"],
    queryFn: shopService.getCurrentShop,
  });

  // 2. Populate Data khi fetch xong
  useEffect(() => {
    if (shop) {
      setFormData({
        shopName: shop.shopName,
        shopDescription: shop.shopDescription,
        shopEmail: shop.shopEmail,
        shopPhone: shop.shopPhone,
        shopAddress: shop.shopAddress,
        shopPersonalIdentifyId: shop.shopPersonalIdentifyId || "",
        shopStatus: shop.shopStatus,
        shopLogo: shop.shopLogo || undefined, // Giữ URL cũ
        shopBanner: shop.shopBanner || undefined, // Giữ URL cũ
        bannerType: "HOME", // Mặc định hoặc lấy từ banner đầu tiên nếu API trả về
      });

      // Set preview ảnh cũ
      if (shop.shopLogo) {
        setLogoPreview(
          shop.shopLogo.startsWith("http")
            ? shop.shopLogo
            : `${MEDIA_BASE_URL}/${shop.shopLogo}`
        );
      }
      if (shop.shopBanner) {
        setBannerPreview(
          shop.shopBanner.startsWith("http")
            ? shop.shopBanner
            : `${MEDIA_BASE_URL}/${shop.shopBanner}`
        );
      }
      // Nếu shop có banner type từ API (cần check type ShopData trả về có banners[] không)
      // if(shop.banners && shop.banners.length > 0) setFormData(prev => ({...prev, bannerType: shop.banners[0].bannerType}))
    }
  }, [shop]);

  // 3. Mutation Update
  const updateMutation = useMutation({
    mutationFn: (data: UpdateShopRequest) => {
      if (!shop?.id) throw new Error("Shop ID not found");
      setValidationErrors({});
      return shopService.updateShop(shop.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentShop"] });
      toast.success("Cập nhật cửa hàng thành công!");
      router.push("/dashboard/shop");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error("Dữ liệu không hợp lệ", {
          description: "Vui lòng kiểm tra các trường báo đỏ.",
        });
      } else {
        toast.error("Cập nhật thất bại", { description: error.message });
      }
    },
  });

  // --- HANDLERS ---

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "shopLogo" | "shopBanner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh quá lớn (< 5MB)");
        return;
      }
      setFormData({ ...formData, [field]: file });

      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "shopLogo") setLogoPreview(reader.result as string);
        else setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (field: "shopLogo" | "shopBanner") => {
    setFormData({ ...formData, [field]: "" }); // Gán rỗng để API biết là xóa (nếu backend hỗ trợ xóa) hoặc upload đè
    if (field === "shopLogo") setLogoPreview("");
    else setBannerPreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  const handleAddressChange = useCallback((fullAddress: string) => {
    setFormData((prev) => ({ ...prev, shopAddress: fullAddress }));
  }, []);

  // Helper render lỗi
  const renderError = (field: string) => {
    const errors = validationErrors[field]; // Lưu ý: Field name từ backend thường là PascalCase (ShopName)
    if (errors && errors.length > 0) {
      return (
        <div className="flex items-center gap-1 mt-1.5 text-sm font-medium text-red-600 animate-in slide-in-from-top-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errors[0]}</span>
        </div>
      );
    }
    return null;
  };

  const hasError = (field: string) => !!validationErrors[field]?.length;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-5xl mx-auto">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 w-full md:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/shop")}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-orange-50 text-orange-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa cửa hàng
              </h1>
              <p className="text-sm text-gray-500">
                Cập nhật thông tin hiển thị và liên hệ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border">
              <span className="text-sm font-medium text-gray-700">
                Trạng thái:
              </span>
              <Switch
                checked={!!formData.shopStatus}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, shopStatus: c })
                }
                className="data-[state=checked]:bg-[#FF6A00]"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  formData.shopStatus ? "text-green-600" : "text-gray-500"
                )}
              >
                {formData.shopStatus ? "Hoạt động" : "Tạm nghỉ"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Info (Chiếm 2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Basic Info */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Store className="h-5 w-5 text-[#FF6A00]" />
                  Thông tin chung
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="shopName">
                    Tên cửa hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleTextChange}
                    className={cn(
                      "h-11 focus:ring-[#FF6A00]",
                      hasError("ShopName") && "border-red-500"
                    )}
                  />
                  {renderError("ShopName")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopDescription">Mô tả</Label>
                  <Textarea
                    id="shopDescription"
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleTextChange}
                    rows={4}
                    className="resize-none focus:ring-[#FF6A00]"
                    placeholder="Giới thiệu về cửa hàng của bạn..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Contact Info */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <MapPin className="h-5 w-5 text-[#FF6A00]" />
                  Liên hệ & Địa chỉ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shopEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="shopEmail"
                        name="shopEmail"
                        type="email"
                        value={formData.shopEmail}
                        onChange={handleTextChange}
                        className={cn(
                          "pl-9 h-11 focus:ring-[#FF6A00]",
                          hasError("ShopEmail") && "border-red-500"
                        )}
                      />
                    </div>
                    {renderError("ShopEmail")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="shopPhone"
                        name="shopPhone"
                        value={formData.shopPhone}
                        onChange={handleTextChange}
                        className={cn(
                          "pl-9 h-11 focus:ring-[#FF6A00]",
                          hasError("ShopPhone") && "border-red-500"
                        )}
                      />
                    </div>
                    {renderError("ShopPhone")}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="shopAddress">
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>

                  {/* Hiển thị địa chỉ hiện tại dưới dạng Textarea (ReadOnly hoặc để copy) */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Địa chỉ hiện tại (kết quả):
                    </span>
                    <Textarea
                      id="shopAddress"
                      name="shopAddress"
                      value={formData.shopAddress}
                      readOnly // Khóa không cho sửa tay trực tiếp để đảm bảo tính nhất quán từ dropdown
                      className={cn(
                        "resize-none bg-gray-100 text-gray-700 cursor-not-allowed",
                        hasError("ShopAddress") && "border-red-500"
                      )}
                    />
                  </div>

                  {/* Component chọn để CẬP NHẬT địa chỉ */}
                  <div className="rounded-md border p-4 bg-white shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-orange-700">
                      <MapPin className="h-4 w-4" />
                      Chọn địa chỉ mới (Nếu muốn thay đổi)
                    </div>

                    <AddressSelector
                      onChange={handleAddressChange} // Truyền hàm đã được memorize
                      hasError={hasError("ShopAddress")}
                      // Không truyền initialValue để parse dropdown vì rất khó khớp chuỗi text cũ vào dropdown
                      // Người dùng sẽ chọn lại từ đầu nếu muốn đổi địa chỉ
                    />
                  </div>

                  {renderError("ShopAddress")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopPersonalIdentifyId">CMND/CCCD</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="shopPersonalIdentifyId"
                      name="shopPersonalIdentifyId"
                      value={formData.shopPersonalIdentifyId}
                      onChange={handleTextChange}
                      className="pl-9 h-11 focus:ring-[#FF6A00]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Images (Chiếm 1/3) */}
          <div className="space-y-6">
            {/* 3. Logo */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <ImageIcon className="h-5 w-5 text-[#FF6A00]" />
                  Logo Shop
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative group">
                  <div
                    className={cn(
                      "h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center",
                      hasError("ShopLogo") &&
                        "border-red-400 ring-2 ring-red-200"
                    )}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-12 w-12 text-gray-300" />
                    )}
                  </div>

                  {/* Edit Overlay */}
                  <label
                    htmlFor="shopLogo"
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-white" />
                    <Input
                      id="shopLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopLogo")}
                      className="hidden"
                    />
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("shopLogo")}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Kích thước: 400x400px
                  <br />
                  Dung lượng &lt; 5MB
                </p>
                {renderError("ShopLogo")}
              </CardContent>
            </Card>

            {/* 4. Banner */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <ImageIcon className="h-5 w-5 text-[#FF6A00]" />
                  Banner Shop
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div
                  className={cn(
                    "relative w-full aspect-3/1 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center group hover:border-[#FF6A00] transition-colors",
                    hasError("ShopBanner") && "border-red-400 bg-red-50"
                  )}
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload className="h-8 w-8 mb-1" />
                      <span className="text-xs">Tải banner</span>
                    </div>
                  )}

                  <Input
                    id="shopBanner"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "shopBanner")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("shopBanner")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded shadow-md hover:bg-red-600 z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Banner Type */}
                {bannerPreview && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label
                      htmlFor="bannerType"
                      className="text-xs font-semibold text-gray-500 uppercase"
                    >
                      Loại hiển thị
                    </Label>
                    <Select
                      value={formData.bannerType}
                      onValueChange={(val) =>
                        setFormData({ ...formData, bannerType: val })
                      }
                    >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME">Trang chủ</SelectItem>
                        <SelectItem value="CATEGORY">Danh mục</SelectItem>
                        <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {renderError("ShopBanner")}
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="min-w-[100px]"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="min-w-40 text-white shadow-lg hover:shadow-xl transition-all"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
            }}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
