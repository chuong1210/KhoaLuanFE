"use client";

import { useState, use } from "react";
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
  Star,
  Box,
  Weight,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: productDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductDetail(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productService.deleteProduct(id),
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

  const getImageUrl = (fileName: string | null | undefined): string => {
    if (!fileName) return "/placeholder-image.jpg";
    if (fileName.startsWith("http")) return fileName;
    return `http://localhost:9001/v1/media/${fileName}`;
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,106,0,0.12), rgba(255,179,138,0.04))",
        }}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[600px] w-full rounded-3xl" />
            <Skeleton className="h-[600px] w-full lg:col-span-2 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !productDetail) {
    return (
      <div
        className="min-h-screen p-6 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,106,0,0.12), rgba(255,179,138,0.04))",
        }}
      >
        <Alert
          variant="destructive"
          className="max-w-lg border-2 border-red-200 rounded-2xl shadow-xl"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Không thể tải sản phẩm
          </AlertTitle>
          <AlertDescription className="text-base">
            Sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { product, brand, category, sku, option } = productDetail;
  const mediaArray = parseMediaArray(product.media);
  const allImages = [product.image, ...mediaArray];
  const totalStock = sku.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,106,0,0.12), rgba(255,179,138,0.04))",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
          style={{
            background:
              "linear-gradient(120deg, #E65100 0%, #FF6A00 60%, #FFD3A3 100%)",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-12 w-12 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-4 ring-white/30">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    Chi tiết sản phẩm
                    <Sparkles className="h-7 w-7 text-[#FFD3A3]" />
                  </h1>
                  <p className="text-white/90 text-sm mt-1 font-medium">
                    Mã: #{product.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => router.push(`/dashboard/products/${id}/edit`)}
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 font-semibold px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Edit className="mr-2 h-5 w-5" />
                Chỉnh sửa
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm font-semibold px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-2 border-red-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      Xác nhận xóa sản phẩm
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      Hành động này không thể hoàn tác. Sản phẩm{" "}
                      <span className="font-bold text-gray-900">
                        {product.name}
                      </span>{" "}
                      sẽ bị xóa vĩnh viễn khỏi hệ thống.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Hủy bỏ
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-500 hover:bg-red-600 rounded-xl"
                    >
                      Xóa ngay
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Images Gallery */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div
                    className="relative aspect-square overflow-hidden rounded-2xl group"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFF0E0 0%, #FFB38A 50%, #FF8A33 100%)",
                    }}
                  >
                    <img
                      src={getImageUrl(allImages[selectedImageIndex])}
                      alt={product.name}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.jpg";
                      }}
                    />
                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square overflow-hidden rounded-xl transition-all duration-300 ${
                            selectedImageIndex === index
                              ? "ring-4 ring-[#FF6A00] scale-105 shadow-lg"
                              : "ring-2 ring-[#FFB38A]/30 hover:ring-[#FF6A00] hover:scale-105 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.jpg";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header & Price */}
            <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader
                className="pb-4"
                style={{
                  background:
                    "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-[#111111] leading-tight mb-3">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-700 leading-relaxed">
                      {product.short_description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      product.delete_status === "Active"
                        ? "default"
                        : "destructive"
                    }
                    className={`text-base px-4 py-2 rounded-xl font-bold ${
                      product.delete_status === "Active"
                        ? "bg-linear-to-r from-green-500 to-green-600 shadow-lg"
                        : "bg-linear-to-r from-red-500 to-red-600 shadow-lg"
                    }`}
                  >
                    {product.delete_status === "Active" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Đang bán
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" /> Ngừng bán
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Price & Rating Row */}
                <div
                  className="flex items-center justify-between p-6 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFF0E0 0%, #FFB38A 20%)",
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#D35400] mb-1 uppercase tracking-wider">
                      Giá bán
                    </p>
                    <p
                      className="text-4xl font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {product.min_price === product.max_price
                        ? formatPrice(product.min_price)
                        : `${formatPrice(product.min_price)} - ${formatPrice(
                            product.max_price
                          )}`}
                    </p>
                  </div>

                  {product.rating && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#D35400] mb-1 uppercase tracking-wider">
                        Đánh giá
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-6 w-6 ${
                                i <
                                Math.round(product.rating?.average_rating || 0)
                                  ? "fill-[#FFB000] text-[#FFB000]"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-bold text-[#FFB000]">
                            {product.rating.average_rating.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {product.rating.total_reviews} đánh giá
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#FFB38A]/30" />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF0E0] to-white border-2 border-[#FFB38A]/30 transition-all hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                        }}
                      >
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                      Thương hiệu
                    </p>
                    <p className="text-base font-bold text-[#111111]">
                      {brand?.name || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF0E0] to-white border-2 border-[#FFB38A]/30 transition-all hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF8A33 0%, #FFB38A 100%)",
                        }}
                      >
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                      Danh mục
                    </p>
                    <p className="text-base font-bold text-[#111111] line-clamp-1">
                      {category?.name || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF0E0] to-white border-2 border-[#FFB38A]/30 transition-all hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-linear-to-r from-green-500 to-green-600">
                        <Box className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                      Tồn kho
                    </p>
                    <p className="text-base font-bold text-green-600">
                      {totalStock} sản phẩm
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF0E0] to-white border-2 border-[#FFB38A]/30 transition-all hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                      SKU
                    </p>
                    <p className="text-base font-bold text-purple-600">
                      {sku.length} biến thể
                    </p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="flex flex-wrap gap-3">
                  {product.product_is_permission_return && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border-2 border-green-200">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700">
                        Hỗ trợ đổi trả
                      </span>
                    </div>
                  )}
                  {product.product_is_permission_check && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-200">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-700">
                        Kiểm tra hàng
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader
                style={{
                  background:
                    "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
                }}
              >
                <CardTitle className="text-xl font-bold text-[#FF6A00] flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Mô tả sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "Chưa có mô tả chi tiết",
                  }}
                />
              </CardContent>
            </Card>

            {/* SKU Variants */}
            <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader
                style={{
                  background:
                    "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-[#FF6A00] flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Danh sách phân loại hàng
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 border-2 border-[#FF6A00] text-[#FF6A00] font-bold"
                  >
                    {sku.length} SKU
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {sku.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border-2 border-[#FFB38A]/40 bg-linear-to-r from-white to-[#FFF0E0]/30 transition-all hover:shadow-lg hover:border-[#FF6A00]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white text-lg"
                            style={{
                              background:
                                "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#111111] text-lg mb-1">
                              {item.sku_name || `SKU #${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600 font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg">
                              {item.sku_code}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className="text-2xl font-bold mb-2"
                            style={{
                              background:
                                "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {formatPrice(item.price)}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                              <Box className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-700">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                              <Weight className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-700">
                                {item.weight}kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options/Attributes */}
            {option && option.length > 0 && (
              <Card className="border-none shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader
                  style={{
                    background:
                      "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
                  }}
                >
                  <CardTitle className="text-xl font-bold text-[#FF6A00] flex items-center gap-2">
                    <Layers className="h-6 w-6" />
                    Thuộc tính & Phân loại
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    {option.map((opt, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl bg-linear-to-r from-[#FFF0E0] to-white border-2 border-[#FFB38A]/30"
                      >
                        <p className="font-bold text-[#FF6A00] text-base mb-3 flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          {opt.option_name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {opt.values.map((val, vIndex) => (
                            <Badge
                              key={vIndex}
                              variant="outline"
                              className="text-sm px-4 py-2 border-2 border-[#FF8A33] bg-white text-[#111111] font-semibold hover:bg-[#FFF0E0] transition-all"
                            >
                              {val.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
