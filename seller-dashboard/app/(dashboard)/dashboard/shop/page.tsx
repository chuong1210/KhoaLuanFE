"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/services/shop-service";
import { useAppSelector } from "@/store/hooks";
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
  Clock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ShopManagementPage() {
  const router = useRouter();
  // const { user } = useAppSelector((state) => state.auth)

  const {
    data: shops,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shops"],
    queryFn: shopService.getShops,
  });

  const currentShop = shops?.[0];
  console.log(currentShop);

  useEffect(() => {
    if (!isLoading && !currentShop) {
      // No shop found, redirect to registration
      router.push("/dashboard/shop/register");
    }
  }, [currentShop, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể tải thông tin shop. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentShop) {
    return null; // Will redirect to registration
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã duyệt
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Shop</h2>
          <p className="text-muted-foreground">
            Xem và chỉnh sửa thông tin cửa hàng của bạn
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/shop/edit")}>
          Chỉnh sửa thông tin
        </Button>
      </div>

      {/* Status Alert */}
      {currentShop.status === "pending" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Đang chờ duyệt</AlertTitle>
          <AlertDescription>
            Cửa hàng của bạn đang được admin xem xét. Vui lòng chờ thông báo phê
            duyệt.
          </AlertDescription>
        </Alert>
      )}

      {currentShop.status === "rejected" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yêu cầu bị từ chối</AlertTitle>
          <AlertDescription>
            {currentShop.feedback ||
              "Cửa hàng của bạn chưa được phê duyệt. Vui lòng kiểm tra lại thông tin và gửi lại."}
          </AlertDescription>
        </Alert>
      )}

      {/* Shop Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-lg border">
                <img
                  src={
                    currentShop.shopLogo ||
                    "/placeholder.svg?height=64&width=64"
                  }
                  alt={currentShop.shopName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {currentShop.shopName}
                </CardTitle>
                <CardDescription>{currentShop.shopDescription}</CardDescription>
              </div>
            </div>
            {getStatusBadge(currentShop.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Banner cửa hàng
            </h3>
            <div className="h-48 w-full overflow-hidden rounded-lg border">
              <img
                src={
                  currentShop.shopBanner ||
                  "/placeholder.svg?height=192&width=800"
                }
                alt="Shop banner"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="font-medium">{currentShop.shopEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Số điện thoại
                </p>
                <p className="font-medium">{currentShop.shopPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Địa chỉ
                </p>
                <p className="font-medium">{currentShop.shopAddressId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mã số thuế
                </p>
                <p className="font-medium">{currentShop.tax.taxCode}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                CMND/CCCD
              </p>
              <p className="font-medium">
                {currentShop.shopPersonalIdentifyId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ngày tạo
              </p>
              <p className="font-medium">
                {new Date(currentShop.createdDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
