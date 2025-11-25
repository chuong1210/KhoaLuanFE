"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/services/shop-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
  Wallet,
  Calendar,
  Building2,
  UserCheck,
  ShieldCheck,
  Store,
  Globe,
  CreditCard,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

export default function ShopManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: currentShop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentShop"],
    queryFn: shopService.getCurrentShop,
  });

  // Redirect if no shop (optional logic, keep as is)
  useEffect(() => {
    if (!isLoading && !currentShop && !error) {
      // Consider handling specific error codes or null data appropriately
      // router.push("/dashboard/shop/register");
    }
  }, [currentShop, isLoading, error, router]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
        {/* Hero Loading */}
        <div className="relative h-64 rounded-2xl bg-gray-200 animate-pulse overflow-hidden mb-16">
          <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-2xl bg-gray-300 border-4 border-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="p-10 flex justify-center">
        <Alert
          variant="destructive"
          className="max-w-lg shadow-lg border-red-200 bg-red-50"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Không thể tải dữ liệu
          </AlertTitle>
          <AlertDescription className="mt-2">
            Đã xảy ra lỗi khi tải thông tin cửa hàng. Vui lòng kiểm tra kết nối
            hoặc thử lại sau.
          </AlertDescription>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4 border-red-300 hover:bg-red-100 text-red-700"
          >
            Thử lại
          </Button>
        </Alert>
      </div>
    );
  }

  if (!currentShop) return null;

  // --- HELPERS ---
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="min-h-screen pb-12 bg-[#FFF0E0]/30">
      {/* === 1. HERO SECTION === */}
      <div className="relative bg-white shadow-sm border-b border-[#FFB38A]/30">
        {/* Banner Image */}
        <div className="h-64 w-full relative bg-linear-to-r from-[#FF8A33] to-[#FFB38A] overflow-hidden">
          {currentShop.shopBanner ? (
            <img
              src={`${MEDIA_BASE_URL}/${currentShop.shopBanner}`}
              alt="Cover"
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <ImageIcon className="w-24 h-24 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

          {/* Edit Button (Absolute Top Right) */}
          <Button
            onClick={() => router.push("/dashboard/shop/edit")}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/50 text-white shadow-lg"
          >
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa giao diện
          </Button>
        </div>

        {/* Shop Profile Header */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="relative -mt-16 flex flex-col md:flex-row md:items-end gap-6 mb-2">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-36 w-36 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden p-1">
                <Avatar className="h-full w-full rounded-xl">
                  <AvatarImage
                    src={
                      currentShop.shopLogo
                        ? `${MEDIA_BASE_URL}/${currentShop.shopLogo}`
                        : ""
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-orange-100 text-[#E65100] text-4xl font-bold">
                    {currentShop.shopName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div
                className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-sm"
                title="Online"
              />
            </div>

            {/* Name & Status */}
            <div className="flex-1 pb-2 space-y-2 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {currentShop.shopName}
                </h1>
                {currentShop.shopStatus ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1 text-sm h-fit w-fit mx-auto md:mx-0">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Đang hoạt
                    động
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="px-3 py-1 text-sm h-fit w-fit mx-auto md:mx-0"
                  >
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Tạm dừng
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 max-w-2xl text-base">
                {currentShop.shopDescription ||
                  "Chưa có mô tả giới thiệu cho cửa hàng."}
              </p>
            </div>

            {/* Action Button */}
            <div className="pb-4 hidden md:block">
              <Button
                onClick={() => router.push("/dashboard/shop/edit")}
                className="h-11 px-6 shadow-lg hover:shadow-xl transition-all font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Cập nhật thông tin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === 2. MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#FF6A00] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Doanh thu ví
                </p>
                <h3 className="text-2xl font-bold text-[#E65100]">
                  {formatCurrency(currentShop.walletAmount)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#FFF0E0] flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#FF6A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FF8A33] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Người theo dõi
                </p>
                <h3 className="text-2xl font-bold text-[#E65100]">
                  {currentShop.followerCount}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#FFF0E0] flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#FF8A33]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FFB38A] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Ngày tham gia
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {formatDate(currentShop.createdDate)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#FFF0E0] flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#FFB38A]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Trạng thái Thuế
                </p>
                <h3 className="text-lg font-bold text-green-600">
                  {currentShop.taxInfo?.taxActiveStatus
                    ? "Đã xác thực"
                    : "Chưa xác thực"}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white border border-[#FFB38A]/30 p-1 h-auto w-full md:w-auto flex-wrap justify-start shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white px-6 py-2.5 text-base"
            >
              <Store className="w-4 h-4 mr-2" /> Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white px-6 py-2.5 text-base"
            >
              <Phone className="w-4 h-4 mr-2" /> Liên hệ & Địa chỉ
            </TabsTrigger>
            <TabsTrigger
              value="legal"
              className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white px-6 py-2.5 text-base"
            >
              <Building2 className="w-4 h-4 mr-2" /> Pháp lý & Thuế
            </TabsTrigger>
          </TabsList>

          {/* --- Tab 1: Overview --- */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-[#FFB38A]/50 shadow-md">
              <CardHeader className="border-b border-[#FFB38A]/20 bg-[#FFF0E0]/20">
                <CardTitle className="text-[#E65100] flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Giới thiệu cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Mô tả chi tiết
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 leading-relaxed">
                      {currentShop.shopDescription || "Chưa có nội dung mô tả."}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FFF0E0] p-2.5 rounded-lg">
                        <Store className="h-5 w-5 text-[#FF6A00]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mã cửa hàng</p>
                        <p className="font-mono font-medium text-gray-900">
                          {currentShop.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FFF0E0] p-2.5 rounded-lg">
                        <Clock className="h-5 w-5 text-[#FF6A00]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Cập nhật lần cuối
                        </p>
                        <p className="font-medium text-gray-900">
                          {currentShop.modifiedDate
                            ? formatDate(currentShop.modifiedDate)
                            : "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tab 2: Contact --- */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-[#FFB38A]/50 shadow-md hover:border-[#FF6A00] transition-colors group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#FFF0E0] group-hover:bg-[#FF6A00] transition-colors flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-[#FF6A00] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      Email liên hệ
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Địa chỉ email chính để nhận thông báo và đơn hàng.
                    </p>
                    <p className="text-[#E65100] font-semibold text-lg">
                      {currentShop.shopEmail}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#FFB38A]/50 shadow-md hover:border-[#FF6A00] transition-colors group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#FFF0E0] group-hover:bg-[#FF6A00] transition-colors flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-[#FF6A00] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      Số điện thoại
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Hotline hỗ trợ khách hàng.
                    </p>
                    <p className="text-[#E65100] font-semibold text-lg">
                      {currentShop.shopPhone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-[#FFB38A]/50 shadow-md hover:border-[#FF6A00] transition-colors group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#FFF0E0] group-hover:bg-[#FF6A00] transition-colors flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-[#FF6A00] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      Địa chỉ kho hàng
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Địa chỉ lấy hàng và trả hàng mặc định.
                    </p>
                    <p className="text-gray-900 font-medium text-lg leading-relaxed">
                      {currentShop.shopAddress}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- Tab 3: Legal & Tax --- */}
          <TabsContent value="legal" className="space-y-6">
            {currentShop.taxInfo ? (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Business Info Card */}
                <Card className="md:col-span-3 border-l-4 border-l-[#E65100] border-y border-r border-gray-200 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-[#E65100]">
                      <Building2 className="h-5 w-5" /> Thông tin Doanh nghiệp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <label className="text-sm text-gray-500">
                        Tên đăng ký kinh doanh
                      </label>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {currentShop.taxInfo.taxNationalName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Loại hình kinh doanh
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-[#FF8A33] text-[#E65100] bg-orange-50"
                        >
                          {currentShop.taxInfo.taxBusinessType ||
                            "Cá nhân kinh doanh"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Code */}
                <Card className="border-[#FFB38A]/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-5 w-5 text-[#FF6A00]" />
                      <span className="font-semibold text-gray-700">
                        Mã số thuế
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-[#E65100] tracking-wider">
                      {currentShop.taxInfo.taxCode}
                    </p>
                  </CardContent>
                </Card>

                {/* Identity ID */}
                <Card className="border-[#FFB38A]/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <UserCheck className="h-5 w-5 text-[#FF6A00]" />
                      <span className="font-semibold text-gray-700">
                        CCCD/CMND chủ shop
                      </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-gray-800 tracking-wide">
                      {currentShop.shopPersonalIdentifyId || "---"}
                    </p>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card className="border-[#FFB38A]/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck className="h-5 w-5 text-[#FF6A00]" />
                      <span className="font-semibold text-gray-700">
                        Trạng thái pháp lý
                      </span>
                    </div>
                    {currentShop.taxInfo.taxActiveStatus ? (
                      <div className="flex items-center text-green-600 font-bold text-lg">
                        <CheckCircle className="h-5 w-5 mr-2" /> Đã xác thực
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500 font-bold text-lg">
                        <AlertCircle className="h-5 w-5 mr-2" /> Chưa xác thực
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert className="bg-orange-50 border-[#FFB38A] text-[#E65100]">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Chưa cập nhật thông tin thuế</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-4">
                  <p>
                    Việc cập nhật thông tin thuế là bắt buộc để kích hoạt các
                    tính năng thanh toán và vận chuyển nâng cao.
                  </p>
                  <Button
                    size="sm"
                    className="w-fit bg-[#FF6A00] hover:bg-[#E65100] text-white border-0"
                    onClick={() => router.push("/dashboard/shop/edit")}
                  >
                    Cập nhật ngay
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
