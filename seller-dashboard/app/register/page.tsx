"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AddressSelector } from "../(dashboard)/dashboard/shop/components/address-selector";
import { shopService } from "@/services/shop-service"; // Đảm bảo đường dẫn đúng
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
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ShopFormData } from "@/types/shop";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // Hàm tiện ích của shadcn (thường là clsx + twMerge)

export default function ShopRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // State lưu danh sách lỗi từ Backend trả về
  // Format: { "ShopName": ["Tên shop không được để trống"], "TaxCode": ["Mã thuế đã tồn tại"] }
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const [formData, setFormData] = useState<ShopFormData>({
    shopName: "",
    shopDescription: "",
    shopLogo: undefined,
    shopBanner: undefined,
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    shopPersonalIdentifyId: "",
    shopTaxId: "",
    bannerType: "HOME", // Mặc định
  });

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      // Xóa lỗi cũ trước khi gửi
      setValidationErrors({});
      return await shopService.createShopWithTax(data);
    },
    onSuccess: (data) => {
      console.log("Shop created successfully:", data);
      toast.success("Đăng ký shop thành công!", {
        description: "Vui lòng chờ admin phê duyệt.",
      });
      router.push("/dashboard/shop");
    },
    onError: (error: any) => {
      console.error("Shop registration error:", error);

      // Xử lý lỗi Validation từ Backend (400 Bad Request)
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error("Dữ liệu không hợp lệ", {
          description: "Vui lòng kiểm tra các trường báo đỏ bên dưới.",
        });
      } else {
        // Lỗi chung khác (500, Network, etc)
        toast.error("Đăng ký thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
        });
      }
    },
  });

  // Hàm hiển thị lỗi dưới Input
  const renderError = (backendFieldName: string) => {
    const errors = validationErrors[backendFieldName];
    if (errors && errors.length > 0) {
      return (
        <div className="flex items-center gap-1 mt-1.5 text-sm font-medium text-red-600 animate-in slide-in-from-top-1 fade-in duration-300">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errors[0]}</span>
        </div>
      );
    }
    return null;
  };

  // Hàm check xem field có lỗi không để đổi màu border input
  const hasError = (backendFieldName: string) => {
    return (
      validationErrors[backendFieldName] &&
      validationErrors[backendFieldName].length > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản phía Client trước khi gửi
    if (!formData.shopTaxId) {
      toast.error("Vui lòng nhập mã số thuế");
      return;
    }
    if (!formData.shopLogo) {
      toast.error("Vui lòng chọn logo cửa hàng");
      return;
    }

    createShopMutation.mutate(formData);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // (Tùy chọn) Có thể xóa lỗi validation của trường đó ngay khi user nhập lại
    // Nhưng để đơn giản thì cứ giữ nguyên, khi submit lại sẽ clear
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "shopLogo" | "shopBanner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn", {
          description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
        });
        return;
      }

      setFormData({
        ...formData,
        [field]: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "shopLogo") {
          setLogoPreview(reader.result as string);
        } else {
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (field: "shopLogo" | "shopBanner") => {
    setFormData({
      ...formData,
      [field]: undefined,
    });
    if (field === "shopLogo") {
      setLogoPreview("");
    } else {
      setBannerPreview("");
      // Reset banner type về default nếu xóa banner
      setFormData((prev) => ({ ...prev, bannerType: "HOME" }));
    }
  };

  const nextStep = () => {
    // Validate sơ bộ chuyển bước
    if (currentStep === 1) {
      if (!formData.shopName || !formData.shopEmail || !formData.shopPhone) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);
  const progress = (currentStep / 3) * 100;

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
            Đăng ký Cửa hàng
          </h2>
          <p className="text-muted-foreground mt-1">
            Hoàn thành các bước để trở thành người bán trên nền tảng
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="border-2" style={{ borderColor: "#FFB38A" }}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span style={{ color: currentStep >= 1 ? "#FF6A00" : "#94a3b8" }}>
                Thông tin cơ bản
              </span>
              <span style={{ color: currentStep >= 2 ? "#FF6A00" : "#94a3b8" }}>
                Hình ảnh & Địa chỉ
              </span>
              <span style={{ color: currentStep >= 3 ? "#FF6A00" : "#94a3b8" }}>
                Thông tin pháp lý
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card
            className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4"
            style={{ borderColor: "#FFB38A" }}
          >
            <CardHeader
              style={{
                background: "linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)",
              }}
            >
              <CardTitle className="text-white flex items-center gap-2">
                <Store className="h-5 w-5" />
                Bước 1: Thông tin cơ bản
              </CardTitle>
              <CardDescription className="text-white/90">
                Điền thông tin giới thiệu về cửa hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Shop Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="shopName"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <Store className="h-4 w-4" />
                  Tên cửa hàng *
                </Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleTextChange}
                  placeholder="VD: Shop Thời Trang ABC"
                  className={cn(
                    "h-11 border-2 focus:border-[#FF6A00]",
                    hasError("ShopName") &&
                      "border-red-500 focus:border-red-500 bg-red-50"
                  )}
                />
                {renderError("ShopName")}
              </div>

              {/* Shop Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="shopDescription"
                  className="text-base font-semibold"
                  style={{ color: "#E65100" }}
                >
                  Mô tả cửa hàng
                </Label>
                <Textarea
                  id="shopDescription"
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleTextChange}
                  placeholder="Giới thiệu về cửa hàng của bạn..."
                  rows={4}
                  className="border-2 focus:border-[#FF6A00] resize-none"
                />
                {/* Nếu backend có validate description thì thêm renderError("ShopDescription") */}
              </div>

              {/* Contact Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="shopEmail"
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "#E65100" }}
                  >
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="shopEmail"
                    name="shopEmail"
                    type="email"
                    value={formData.shopEmail}
                    onChange={handleTextChange}
                    placeholder="shop@example.com"
                    className={cn(
                      "h-11 border-2 focus:border-[#FF6A00]",
                      hasError("ShopEmail") &&
                        "border-red-500 focus:border-red-500 bg-red-50"
                    )}
                  />
                  {renderError("ShopEmail")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="shopPhone"
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "#E65100" }}
                  >
                    <Phone className="h-4 w-4" />
                    Số điện thoại *
                  </Label>
                  <Input
                    id="shopPhone"
                    name="shopPhone"
                    type="tel"
                    value={formData.shopPhone}
                    onChange={handleTextChange}
                    placeholder="0123456789"
                    className={cn(
                      "h-11 border-2 focus:border-[#FF6A00]",
                      hasError("ShopPhone") &&
                        "border-red-500 focus:border-red-500 bg-red-50"
                    )}
                  />
                  {renderError("ShopPhone")}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-11 px-8 text-white font-semibold shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  Tiếp theo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Images & Address */}
        {currentStep === 2 && (
          <Card
            className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4"
            style={{ borderColor: "#FFB38A" }}
          >
            <CardHeader
              style={{
                background: "linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)",
              }}
            >
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Bước 2: Hình ảnh & Địa chỉ
              </CardTitle>
              <CardDescription className="text-white/90">
                Tải lên logo, banner và cập nhật địa chỉ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Shop Logo */}
              <div className="space-y-3">
                <Label
                  htmlFor="shopLogo"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <ImageIcon className="h-4 w-4" />
                  Logo cửa hàng *
                </Label>

                {!logoPreview ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                      hasError("ShopLogo")
                        ? "border-red-400 bg-red-50"
                        : "border-[#FFB38A] bg-[#FFF0E0] hover:border-[#FF6A00]"
                    )}
                  >
                    <input
                      id="shopLogo"
                      name="shopLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopLogo")}
                      className="hidden"
                    />
                    <label
                      htmlFor="shopLogo"
                      className="cursor-pointer w-full block"
                    >
                      <Upload
                        className="h-12 w-12 mx-auto mb-3"
                        style={{
                          color: hasError("ShopLogo") ? "#ef4444" : "#FF6A00",
                        }}
                      />
                      <p
                        className="font-semibold mb-1"
                        style={{
                          color: hasError("ShopLogo") ? "#ef4444" : "#E65100",
                        }}
                      >
                        Nhấp để tải logo lên
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG (tối đa 5MB) - 400x400px
                      </p>
                    </label>
                  </div>
                ) : (
                  <div
                    className="relative border-2 rounded-lg overflow-hidden w-48 h-48 mx-auto shadow-md"
                    style={{ borderColor: "#FF6A00" }}
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 shadow-sm h-8 w-8"
                      onClick={() => handleRemoveImage("shopLogo")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {renderError("ShopLogo")}
              </div>

              {/* Shop Banner + Banner Type */}
              <div
                className={cn(
                  "space-y-3 p-4 rounded-xl border bg-white",
                  hasError("ShopBanner")
                    ? "border-red-200"
                    : "border-gray-100 shadow-sm"
                )}
              >
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="shopBanner"
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "#E65100" }}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Banner cửa hàng & Loại
                  </Label>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                    Tùy chọn
                  </span>
                </div>

                {!bannerPreview ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                      hasError("ShopBanner")
                        ? "border-red-400 bg-red-50"
                        : "border-[#FFB38A] bg-[#FFF0E0] hover:border-[#FF6A00]"
                    )}
                  >
                    <input
                      id="shopBanner"
                      name="shopBanner"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopBanner")}
                      className="hidden"
                    />
                    <label
                      htmlFor="shopBanner"
                      className="cursor-pointer w-full block"
                    >
                      <Upload
                        className="h-10 w-10 mx-auto mb-2"
                        style={{
                          color: hasError("ShopBanner") ? "#ef4444" : "#FF6A00",
                        }}
                      />
                      <p
                        className="font-medium mb-1 text-sm"
                        style={{
                          color: hasError("ShopBanner") ? "#ef4444" : "#E65100",
                        }}
                      >
                        Tải banner (1920x400px)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in">
                    <div
                      className="relative border-2 rounded-lg overflow-hidden shadow-md"
                      style={{ borderColor: "#FF6A00" }}
                    >
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleRemoveImage("shopBanner")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Select Banner Type - Chỉ hiện khi có Banner */}
                    <div className="grid gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">
                        Loại Banner hiển thị
                      </Label>
                      <Select
                        value={formData.bannerType}
                        onValueChange={(val) =>
                          setFormData({ ...formData, bannerType: val })
                        }
                      >
                        <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-[#FF6A00]">
                          <SelectValue placeholder="Chọn vị trí hiển thị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOME">Trang chủ (Home)</SelectItem>
                          <SelectItem value="CATEGORY">
                            Danh mục (Category)
                          </SelectItem>
                          <SelectItem value="PROMOTION">
                            Khuyến mãi (Promotion)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {renderError("BannerType")}
                    </div>
                  </div>
                )}
                {renderError("ShopBanner")}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="shopAddress"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <MapPin className="h-4 w-4" />
                  Địa chỉ cửa hàng *
                </Label>
                {/* Component chọn địa chỉ mới */}
                <div
                  className={cn(
                    "p-4 bg-gray-50 rounded-lg border",
                    hasError("ShopAddress") && "border-red-500 bg-red-50"
                  )}
                >
                  <AddressSelector
                    onChange={(fullAddress) =>
                      setFormData((prev) => ({
                        ...prev,
                        shopAddress: fullAddress,
                      }))
                    }
                    hasError={hasError("ShopAddress")}
                  />
                </div>
                {/* Input ẩn để debug hoặc fallback nếu cần, có thể xóa đi */}
                {/* Hiển thị địa chỉ xem trước */}
                {formData.shopAddress && (
                  <p className="text-sm text-gray-600 italic mt-2">
                    Địa chỉ sẽ lưu: {formData.shopAddress}
                  </p>
                )}{" "}
                {renderError("ShopAddress")}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 px-8 border-2"
                  style={{ borderColor: "#FF6A00", color: "#FF6A00" }}
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 text-white font-semibold shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  Tiếp theo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Legal Info */}
        {currentStep === 3 && (
          <Card
            className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4"
            style={{ borderColor: "#FFB38A" }}
          >
            <CardHeader
              style={{
                background: "linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)",
              }}
            >
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bước 3: Thông tin pháp lý
              </CardTitle>
              <CardDescription className="text-white/90">
                Cung cấp thông tin pháp lý để xác thực
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Legal Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="shopPersonalIdentifyId"
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "#E65100" }}
                  >
                    <FileText className="h-4 w-4" />
                    CMND/CCCD
                  </Label>
                  <Input
                    id="shopPersonalIdentifyId"
                    name="shopPersonalIdentifyId"
                    type="text"
                    value={formData.shopPersonalIdentifyId}
                    onChange={handleTextChange}
                    placeholder="Số CMND/CCCD"
                    className={cn(
                      "h-11 border-2 focus:border-[#FF6A00]",
                      hasError("ShopPersonalIdentifyId") &&
                        "border-red-500 focus:border-red-500 bg-red-50"
                    )}
                  />
                  {renderError("ShopPersonalIdentifyId")}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="shopTaxId"
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "#E65100" }}
                  >
                    <FileText className="h-4 w-4" />
                    Mã số thuế *
                  </Label>
                  <Input
                    id="shopTaxId"
                    name="shopTaxId"
                    type="text"
                    value={formData.shopTaxId}
                    onChange={handleTextChange}
                    placeholder="Mã số thuế doanh nghiệp"
                    required
                    className={cn(
                      "h-11 border-2 focus:border-[#FF6A00]",
                      hasError("TaxCode") &&
                        "border-red-500 focus:border-red-500 bg-red-50"
                    )}
                  />
                  {/* Lưu ý: Backend trả về key là "TaxCode", nhưng input name là shopTaxId -> dùng renderError("TaxCode") */}
                  {renderError("TaxCode")}
                </div>
              </div>

              {/* Info Box */}
              <div
                className="p-4 rounded-lg border-2 flex gap-3"
                style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
              >
                <CheckCircle
                  className="h-5 w-5 shrink-0 mt-0.5"
                  style={{ color: "#FF6A00" }}
                />
                <div className="space-y-1">
                  <p className="font-semibold" style={{ color: "#E65100" }}>
                    Thông tin của bạn được bảo mật
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi sử dụng thông tin này để xác thực và bảo vệ quyền
                    lợi của bạn.
                  </p>
                </div>
              </div>

              {/* Error Summary (Optional) */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Vui lòng kiểm tra lại các lỗi ở các bước trước.
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 px-8 border-2"
                  style={{ borderColor: "#FF6A00", color: "#FF6A00" }}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={createShopMutation.isPending}
                  className="flex-1 h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  style={{
                    background: createShopMutation.isPending
                      ? "#FFB38A"
                      : "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  {createShopMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Store className="mr-2 h-5 w-5" />
                      Gửi yêu cầu đăng ký
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
