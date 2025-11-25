"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import { useAppSelector } from "@/store/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Package,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, ProductFilters } from "@/types/product";
import { ImportProductDialog } from "./components/product-import-modal";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    shop_id: shopId || undefined,
    sort: "price_desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    enabled: !!shopId,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã xóa sản phẩm thành công");
    },
    onError: (error: any) => {
      toast.error("Không thể xóa sản phẩm", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      keywords: searchTerm,
      page: 1,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!shopId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,106,0,0.08), rgba(255,179,138,0.03))",
        }}
      >
        <Alert
          variant="destructive"
          className="max-w-md border-2 border-red-200 rounded-2xl shadow-xl"
        >
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold">
            Không tìm thấy Shop ID
          </AlertTitle>
          <AlertDescription className="text-base mt-2">
            Vui lòng đăng ký shop hoặc đăng nhập lại
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,106,0,0.08), rgba(255,179,138,0.03))",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        {/* Header với gradient động */}
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-white shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
          style={{
            background:
              "linear-gradient(120deg, #E65100 0%, #FF6A00 60%, #FFD3A3 100%)",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-4 ring-white/30 transform transition-transform hover:scale-110">
                <Package className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                  Quản lý Sản phẩm
                  <Sparkles className="h-8 w-8 text-[#FFD3A3]" />
                </h1>
                <p className="mt-2 text-lg text-white/95 font-medium">
                  Tổng:{" "}
                  <span className="text-[#FFF0E0] font-bold">
                    {productData?.totalElements || 0}
                  </span>{" "}
                  sản phẩm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Nút Import Excel - Gọn gàng hơn */}
              <ImportProductDialog />

              {/* Nút chính */}
              <Button
                size="lg"
                className="bg-white text-[#ffffff] hover:bg-[#FFF0E0] hover:text-[#E65100] shadow-xl font-semibold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => router.push("/dashboard/products/create")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Thêm thủ công
              </Button>
            </div>
          </div>
        </div>

        {/* Filters với thiết kế hiện đại */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <CardHeader
            className="border-b-0 pb-4"
            style={{
              background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <Filter className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#E65100]">
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF8A33] pointer-events-none" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 h-12 border-2 border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 rounded-xl transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                    }}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Select
                value={filters.sort}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, sort: value, page: 1 }))
                }
              >
                <SelectTrigger className="h-12 border-2 border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 rounded-xl font-medium">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="price_desc" className="rounded-lg py-3">
                    💰 Giá giảm dần
                  </SelectItem>
                  <SelectItem value="price_asc" className="rounded-lg py-3">
                    💵 Giá tăng dần
                  </SelectItem>
                  <SelectItem value="name_asc" className="rounded-lg py-3">
                    🔤 Tên (A-Z)
                  </SelectItem>
                  <SelectItem value="name_desc" className="rounded-lg py-3">
                    🔡 Tên (Z-A)
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.limit?.toString()}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: parseInt(value),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="h-12 border-2 border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 rounded-xl font-medium">
                  <SelectValue placeholder="Số lượng" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="10" className="rounded-lg py-3">
                    📦 10 sản phẩm
                  </SelectItem>
                  <SelectItem value="20" className="rounded-lg py-3">
                    📦 20 sản phẩm
                  </SelectItem>
                  <SelectItem value="50" className="rounded-lg py-3">
                    📦 50 sản phẩm
                  </SelectItem>
                  <SelectItem value="100" className="rounded-lg py-3">
                    📦 100 sản phẩm
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert
                variant="destructive"
                className="border-2 border-red-200 rounded-2xl"
              >
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">Lỗi</AlertTitle>
                <AlertDescription className="text-base">
                  Không thể tải danh sách sản phẩm. Vui lòng thử lại.
                </AlertDescription>
              </Alert>
            ) : productData && productData.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {productData.data.map((product: Product) => {
                    const imageUrl = productService.getImageUrl(product.image);

                    const priceRange =
                      product.min_price === product.max_price
                        ? formatPrice(product.min_price)
                        : `${formatPrice(product.min_price)} - ${formatPrice(
                            product.max_price
                          )}`;

                    return (
                      <Card
                        key={product.id}
                        className="group relative overflow-hidden border border-[#FFB38A]/30 hover:border-[#FF6A00] transition-all duration-200 hover:shadow-lg rounded-xl bg-white"
                      >
                        {/* Image container - compact */}
                        <div className="relative h-36 overflow-hidden bg-[#FFF0E0]">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.jpg";
                            }}
                          />

                          {/* Action button */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  className="h-8 w-8 rounded-lg bg-white/90 hover:bg-white shadow-md border border-[#FFB38A]/30"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-[#FF6A00]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-44 rounded-lg shadow-xl border border-[#FFB38A]/20"
                              >
                                <DropdownMenuLabel className="text-sm font-bold text-[#E65100]">
                                  Thao tác
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#FFB38A]/20" />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/products/${product.id}`
                                    )
                                  }
                                  className="rounded cursor-pointer hover:bg-[#FFF0E0] text-sm"
                                >
                                  <Eye className="mr-2 h-4 w-4 text-[#FF8A33]" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/products/${product.id}/edit`
                                    )
                                  }
                                  className="rounded cursor-pointer hover:bg-[#FFF0E0] text-sm"
                                >
                                  <Edit className="mr-2 h-4 w-4 text-[#FFB000]" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteProductMutation.mutate(product.id)
                                  }
                                  className="text-red-600 hover:bg-red-50 rounded cursor-pointer text-sm"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Content - compact */}
                        <CardContent className="p-3">
                          <h3
                            className="line-clamp-2 font-semibold text-sm text-[#1C1917] mb-1 group-hover:text-[#FF6A00] transition-colors cursor-pointer min-h-10"
                            onClick={() =>
                              router.push(`/dashboard/products/${product.id}`)
                            }
                          >
                            {product.name}
                          </h3>

                          <p className="text-base font-bold text-[#FF6A00] mb-2">
                            {priceRange}
                          </p>

                          {product.rating && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[#FFB000]">★</span>
                              <span className="font-medium text-gray-700">
                                {product.rating.average_rating.toFixed(1)}
                              </span>
                              <span className="text-gray-400">
                                ({product.rating.total_reviews})
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {productData.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) - 1,
                        }))
                      }
                      className="h-11 px-6 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(5, productData.totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                filters.page === page ? "default" : "outline"
                              }
                              className={
                                filters.page === page
                                  ? "h-11 w-11 rounded-xl font-bold text-white shadow-lg transition-all"
                                  : "h-11 w-11 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all"
                              }
                              style={
                                filters.page === page
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                                    }
                                  : {}
                              }
                              onClick={() =>
                                setFilters((prev) => ({ ...prev, page }))
                              }
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      disabled={filters.page === productData.totalPages}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }))
                      }
                      className="h-11 px-6 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div
                  className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl shadow-2xl animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  <Package className="h-14 w-14 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#111111] mb-3">
                  Chưa có sản phẩm nào
                </p>
                <p className="text-gray-600 text-lg mb-6">
                  Hãy thêm sản phẩm đầu tiên của bạn
                </p>
                <Button
                  size="lg"
                  className="px-8 py-6 rounded-xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                  onClick={() => router.push("/dashboard/products/create")}
                >
                  <Plus className="mr-2 h-6 w-6" />
                  Thêm sản phẩm ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
