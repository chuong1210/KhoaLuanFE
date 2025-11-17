"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
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
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  Layers,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: productDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => productService.getProductDetail(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productService.deleteProduct(params.id),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm");
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      toast.error("Không thể xóa sản phẩm", {
        description: error.message,
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const parseMediaArray = (media: string): string[] => {
    try {
      return JSON.parse(media);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !productDetail) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Không thể tải thông tin sản phẩm. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { product, brand, category, sku, option } = productDetail;
  const mediaArray = parseMediaArray(product.media);
  const allImages = [product.image, ...mediaArray];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white shadow-xl"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
                  <p className="text-white/90">#{product.id}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/products/${params.id}/edit`)
                }
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-red-500/20 text-white hover:bg-red-500/30 backdrop-blur-sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh
                      viễn khỏi hệ thống.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Images */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-xl bg-linear-to-br from-[#FFF0E0] to-white">
                  <img
                    src={allImages[selectedImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {allImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-[#FF6A00] ring-2 ring-[#FF6A00]/30"
                            : "border-gray-200 hover:border-[#FF6A00]/50"
                        }`}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            <Card className="border-[#FF6A00]/20 shadow-lg">
              <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
                <CardTitle className="text-2xl text-[#FF6A00]">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {product.short_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-baseline gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Giá bán</p>
                    <p className="text-3xl font-bold text-[#FF6A00]">
                      {product.min_price === product.max_price
                        ? formatPrice(product.min_price)
                        : `${formatPrice(product.min_price)} - ${formatPrice(
                            product.max_price
                          )}`}
                    </p>
                  </div>

                  {product.rating && (
                    <div>
                      <p className="text-sm text-gray-600">Đánh giá</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-500">
                          {product.rating.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({product.rating.total_reviews} đánh giá)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0E0]">
                      <Tag className="h-5 w-5 text-[#FF6A00]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thương hiệu</p>
                      <p className="font-semibold">{brand.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0E0]">
                      <Layers className="h-5 w-5 text-[#FF6A00]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Danh mục</p>
                      <p className="font-semibold">{category.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0E0]">
                      <BarChart3 className="h-5 w-5 text-[#FF6A00]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng tồn kho</p>
                      <p className="font-semibold">
                        {sku.reduce((sum, s) => sum + s.quantity, 0)} sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0E0]">
                      {product.delete_status === "Active" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <Badge
                        variant={
                          product.delete_status === "Active"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          product.delete_status === "Active"
                            ? "bg-green-500"
                            : ""
                        }
                      >
                        {product.delete_status === "Active"
                          ? "Đang bán"
                          : "Ngừng bán"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex gap-2">
                    {product.product_is_permission_return && (
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-700"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Đổi trả được
                      </Badge>
                    )}
                    {product.product_is_permission_check && (
                      <Badge
                        variant="outline"
                        className="border-blue-500 text-blue-700"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Kiểm tra được
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        <Card className="border-[#FF6A00]/20 shadow-lg">
          <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
            <CardTitle className="text-[#FF6A00]">Mô tả sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </CardContent>
        </Card>

        {/* SKU List */}
        <Card className="border-[#FF6A00]/20 shadow-lg">
          <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
            <CardTitle className="text-[#FF6A00]">
              Phân loại hàng ({sku.length} SKU)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {sku.map((item, index) => (
                <Card
                  key={item.id}
                  className="border-[#FFB38A]/30 bg-linear-to-br from-white to-[#FFF0E0]/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-[#FF6A00]">
                          SKU #{index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          Mã: {item.sku_code}
                        </p>
                        {item.sku_name && (
                          <p className="text-sm text-gray-700">
                            {item.sku_name}
                          </p>
                        )}
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold text-[#FF6A00]">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600">
                            Tồn:{" "}
                            <span className="font-semibold">
                              {item.quantity}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            KL:{" "}
                            <span className="font-semibold">
                              {item.weight}kg
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        {option && option.length > 0 && (
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">
                Thuộc tính sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {option.map((opt, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-4">
                    <div className="font-semibold text-[#FF6A00]">
                      {opt.option_name}
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val, vIndex) => (
                          <Badge
                            key={vIndex}
                            variant="outline"
                            className="border-[#FF6A00]/30 bg-[#FFF0E0]/50"
                          >
                            {val.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
