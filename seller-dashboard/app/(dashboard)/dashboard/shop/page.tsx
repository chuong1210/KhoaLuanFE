"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/services/shop-service";
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
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
  Store,
  Users,
  Wallet,
  Calendar,
  Building2,
  ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MEDIA_BASE_URL = "http://localhost:9001/v1/media";

export default function ShopManagementPage() {
  const router = useRouter();

  const {
    data: currentShop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentShop"],
    queryFn: shopService.getCurrentShop,
  });

  useEffect(() => {
    if (!isLoading && !currentShop) {
      router.push("/dashboard/shop/register");
    }
  }, [currentShop, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
          <Skeleton className="h-10 w-32 bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-20 w-20 rounded-lg bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
            <Skeleton className="h-8 w-48 bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
              <Skeleton className="h-32 w-full bg-linear-to-r from-[#FF6A00]/20 via-[#FFB38A]/40 to-[#FF6A00]/20 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin shop. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentShop) {
    return null;
  }

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <Badge className="h-8 px-4 text-sm font-semibold bg-success text-white">
          <CheckCircle className="mr-1.5 h-4 w-4" />
          Đang hoạt động
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="h-8 px-4 text-sm font-semibold">
        <AlertCircle className="mr-1.5 h-4 w-4" />
        Tạm dừng
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#E65100" }}
          >
            Quản lý Cửa hàng
          </h2>
          <p className="text-muted-foreground mt-1">
            Xem và chỉnh sửa thông tin cửa hàng của bạn
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/shop/edit")}
          className="h-11 px-6 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa thông tin
        </Button>
      </div>

      {/* Shop Overview Card */}
      <Card
        className="border-2 shadow-lg overflow-hidden"
        style={{ borderColor: "#FFB38A" }}
      >
        <CardHeader
          style={{
            background: "linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)",
          }}
          className="pb-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white shadow-lg bg-white">
                <img
                  src={
                    currentShop.shopLogo
                      ? `${MEDIA_BASE_URL}/${currentShop.shopLogo}`
                      : "/placeholder.svg?height=80&width=80"
                  }
                  alt={currentShop.shopName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=80&width=80";
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-2xl text-white mb-1">
                  {currentShop.shopName}
                </CardTitle>
                <CardDescription className="text-white/90 text-base">
                  {currentShop.shopDescription || "Chưa có mô tả"}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(currentShop.shopStatus)}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Banner */}
          {currentShop.shopBanner && (
            <div className="space-y-3">
              <h3
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <ImageIcon className="h-4 w-4" />
                Banner cửa hàng
              </h3>
              <div
                className="h-48 w-full overflow-hidden rounded-lg border-2"
                style={{ borderColor: "#FFB38A" }}
              >
                <img
                  src={`${MEDIA_BASE_URL}/${currentShop.shopBanner}`}
                  alt="Shop banner"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=192&width=800";
                  }}
                />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="border-2"
              style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                    }}
                  >
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Số dư ví
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#E65100" }}
                    >
                      {currentShop.walletAmount.toLocaleString()} đ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-2"
              style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                    }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Người theo dõi
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#E65100" }}
                    >
                      {currentShop.followerCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-2"
              style={{ borderColor: "#FFB38A", background: "#FFF0E0" }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                    }}
                  >
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ngày tạo
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "#E65100" }}
                    >
                      {new Date(currentShop.createdDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: "#E65100" }}
            >
              <Phone className="h-5 w-5" />
              Thông tin liên hệ
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border" style={{ borderColor: "#FFB38A" }}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "#FFF0E0" }}
                    >
                      <Mail className="h-5 w-5" style={{ color: "#FF6A00" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </p>
                      <p
                        className="font-semibold truncate"
                        style={{ color: "#E65100" }}
                      >
                        {currentShop.shopEmail}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border" style={{ borderColor: "#FFB38A" }}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "#FFF0E0" }}
                    >
                      <Phone className="h-5 w-5" style={{ color: "#FF6A00" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Số điện thoại
                      </p>
                      <p className="font-semibold" style={{ color: "#E65100" }}>
                        {currentShop.shopPhone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border md:col-span-2"
                style={{ borderColor: "#FFB38A" }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "#FFF0E0" }}
                    >
                      <MapPin
                        className="h-5 w-5"
                        style={{ color: "#FF6A00" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Địa chỉ
                      </p>
                      <p className="font-semibold" style={{ color: "#E65100" }}>
                        {currentShop.shopAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Information */}
          {currentShop.taxInfo && (
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: "#E65100" }}
              >
                <Building2 className="h-5 w-5" />
                Thông tin doanh nghiệp
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border" style={{ borderColor: "#FFB38A" }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: "#FFF0E0" }}
                      >
                        <FileText
                          className="h-5 w-5"
                          style={{ color: "#FF6A00" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Mã số thuế
                        </p>
                        <p
                          className="font-semibold text-lg"
                          style={{ color: "#E65100" }}
                        >
                          {currentShop.taxInfo.taxCode}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: "#FFB38A" }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: "#FFF0E0" }}
                      >
                        <FileText
                          className="h-5 w-5"
                          style={{ color: "#FF6A00" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          CMND/CCCD
                        </p>
                        <p
                          className="font-semibold text-lg"
                          style={{ color: "#E65100" }}
                        >
                          {currentShop.shopPersonalIdentifyId ||
                            "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {currentShop.taxInfo.taxNationalName && (
                  <Card
                    className="border md:col-span-2"
                    style={{ borderColor: "#FFB38A" }}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ background: "#FFF0E0" }}
                          >
                            <Building2
                              className="h-5 w-5"
                              style={{ color: "#FF6A00" }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Tên doanh nghiệp
                            </p>
                            <p
                              className="font-semibold"
                              style={{ color: "#E65100" }}
                            >
                              {currentShop.taxInfo.taxNationalName}
                            </p>
                          </div>
                        </div>

                        {currentShop.taxInfo.taxBusinessType && (
                          <div
                            className="flex items-center gap-2 pt-2 border-t"
                            style={{ borderColor: "#FFB38A" }}
                          >
                            <Badge
                              variant="outline"
                              className="font-medium"
                              style={{
                                borderColor: "#FF6A00",
                                color: "#FF6A00",
                              }}
                            >
                              {currentShop.taxInfo.taxBusinessType}
                            </Badge>
                            {currentShop.taxInfo.taxActiveStatus && (
                              <Badge className="bg-success text-white">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Đang hoạt động
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
