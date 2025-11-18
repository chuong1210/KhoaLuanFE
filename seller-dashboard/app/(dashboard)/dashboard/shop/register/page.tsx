"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import type { ShopFormData } from "@/types/shop";
import { Progress } from "@/components/ui/progress";

export default function ShopRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: "",
    shopDescription: "",
    shopLogo: undefined,
    shopBanner: undefined,
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    shopPersonalIdentifyId: "",
    shopAddressId: "",
    shopTaxId: "",
  });

  const createShopMutation = useMutation({
    mutationFn: (data: ShopFormData) => shopService.createShopWithTax(data),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu đăng ký shop", {
        description: "Vui lòng chờ admin phê duyệt",
      });
      router.push("/dashboard/shop");
    },
    onError: (error: any) => {
      toast.error("Đăng ký shop thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.shopName || !formData.shopEmail || !formData.shopPhone) {
        toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
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
            className="border-2 shadow-lg"
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
                Điền thông tin cơ bản về cửa hàng của bạn
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
                  type="text"
                  value={formData.shopName}
                  onChange={handleTextChange}
                  placeholder="VD: Shop Thời Trang ABC"
                  required
                  className="h-11 border-2 focus:border-[#FF6A00]"
                />
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
                    required
                    className="h-11 border-2 focus:border-[#FF6A00]"
                  />
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
                    required
                    className="h-11 border-2 focus:border-[#FF6A00]"
                  />
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
            className="border-2 shadow-lg"
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
                Tải lên logo và banner cho cửa hàng
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
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#FF6A00] transition-colors cursor-pointer"
                    style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
                  >
                    <input
                      id="shopLogo"
                      name="shopLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopLogo")}
                      className="hidden"
                    />
                    <label htmlFor="shopLogo" className="cursor-pointer">
                      <Upload
                        className="h-12 w-12 mx-auto mb-3"
                        style={{ color: "#FF6A00" }}
                      />
                      <p
                        className="font-semibold mb-1"
                        style={{ color: "#E65100" }}
                      >
                        Nhấp để tải logo lên
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG (tối đa 5MB)
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Kích thước đề xuất: 400x400px
                      </p>
                    </label>
                  </div>
                ) : (
                  <div
                    className="relative border-2 rounded-lg overflow-hidden w-48 h-48 mx-auto"
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
                      className="absolute top-2 right-2 shadow-lg"
                      onClick={() => handleRemoveImage("shopLogo")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Shop Banner */}
              <div className="space-y-3">
                <Label
                  htmlFor="shopBanner"
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "#E65100" }}
                >
                  <ImageIcon className="h-4 w-4" />
                  Banner cửa hàng (Tùy chọn)
                </Label>

                {!bannerPreview ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#FF6A00] transition-colors cursor-pointer"
                    style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
                  >
                    <input
                      id="shopBanner"
                      name="shopBanner"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopBanner")}
                      className="hidden"
                    />
                    <label htmlFor="shopBanner" className="cursor-pointer">
                      <Upload
                        className="h-12 w-12 mx-auto mb-3"
                        style={{ color: "#FF6A00" }}
                      />
                      <p
                        className="font-semibold mb-1"
                        style={{ color: "#E65100" }}
                      >
                        Nhấp để tải banner lên
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG (tối đa 5MB)
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Kích thước đề xuất: 1920x400px
                      </p>
                    </label>
                  </div>
                ) : (
                  <div
                    className="relative border-2 rounded-lg overflow-hidden"
                    style={{ borderColor: "#FF6A00" }}
                  >
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 shadow-lg"
                      onClick={() => handleRemoveImage("shopBanner")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
                <Textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleTextChange}
                  placeholder="Nhập địa chỉ đầy đủ của cửa hàng"
                  required
                  rows={3}
                  className="border-2 focus:border-[#FF6A00] resize-none"
                />
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
            className="border-2 shadow-lg"
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
                Cung cấp thông tin pháp lý để xác thực cửa hàng
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
                    className="h-11 border-2 focus:border-[#FF6A00]"
                  />
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
                    className="h-11 border-2 focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div
                className="p-4 rounded-lg border-2"
                style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
              >
                <div className="flex gap-3">
                  <CheckCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#FF6A00" }}
                  />
                  <div className="space-y-1">
                    <p className="font-semibold" style={{ color: "#E65100" }}>
                      Thông tin của bạn được bảo mật
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Chúng tôi sử dụng thông tin này để xác thực và bảo vệ
                      quyền lợi của bạn. Sau khi gửi, yêu cầu sẽ được admin xem
                      xét và phê duyệt.
                    </p>
                  </div>
                </div>
              </div>

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
                      Đang gửi yêu cầu...
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
