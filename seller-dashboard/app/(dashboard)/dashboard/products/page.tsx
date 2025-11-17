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
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, ProductFilters } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.auth.shopId);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    shop_id: shopId || undefined,
    sort: "newest",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    enabled: !!shopId,
  });

  // Delete mutation
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

  const parseMediaArray = (media: string): string[] => {
    try {
      return JSON.parse(media);
    } catch {
      return [];
    }
  };

  if (!shopId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Không tìm thấy Shop ID</AlertTitle>
        <AlertDescription>
          Vui lòng đăng ký shop hoặc đăng nhập lại
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
                <p className="mt-1 text-white/90">
                  Tổng: {productData?.totalElements || 0} sản phẩm
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-white text-[#FF6A00] hover:bg-white/90 shadow-lg"
              onClick={() => router.push("/dashboard/products/create")}
            >
              <Plus className="mr-2 h-5 w-5" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#FF6A00]/20 shadow-md">
          <CardHeader className="border-b border-[#FF6A00]/10 bg-linear-to-r from-[#FFF0E0] to-white">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#FF6A00]" />
              <CardTitle className="text-[#FF6A00]">
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="border-[#FF6A00]/30 focus:border-[#FF6A00] focus:ring-[#FF6A00]/20"
                  />
                  <Button
                    onClick={handleSearch}
                    className="bg-[#FF6A00] hover:bg-[#E65100]"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select
                value={filters.sort}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, sort: value, page: 1 }))
                }
              >
                <SelectTrigger className="border-[#FF6A00]/30">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                  <SelectItem value="price_desc">Giá giảm dần</SelectItem>
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
                <SelectTrigger className="border-[#FF6A00]/30">
                  <SelectValue placeholder="Số lượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 sản phẩm</SelectItem>
                  <SelectItem value="20">20 sản phẩm</SelectItem>
                  <SelectItem value="50">50 sản phẩm</SelectItem>
                  <SelectItem value="100">100 sản phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="border-[#FF6A00]/20 shadow-md">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                  Không thể tải danh sách sản phẩm. Vui lòng thử lại.
                </AlertDescription>
              </Alert>
            ) : productData && productData.data.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {productData.data.map((product: Product) => {
                    const mediaArray = parseMediaArray(product.media);
                    const priceRange =
                      product.min_price === product.max_price
                        ? formatPrice(product.min_price)
                        : `${formatPrice(product.min_price)} - ${formatPrice(
                            product.max_price
                          )}`;

                    return (
                      <Card
                        key={product.id}
                        className="group overflow-hidden border-[#FF6A00]/20 transition-all hover:shadow-xl hover:border-[#FF6A00]/40"
                      >
                        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-[#FFF0E0] to-white">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute top-3 right-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/products/${product.id}`
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/products/${product.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteProductMutation.mutate(product.id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="line-clamp-2 font-semibold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.short_description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-bold text-[#FF6A00]">
                                {priceRange}
                              </p>
                              {product.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-sm text-amber-500">
                                    ★
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {product.rating.average_rating.toFixed(1)} (
                                    {product.rating.total_reviews})
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              size="sm"
                              className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00] text-white"
                              onClick={() =>
                                router.push(`/dashboard/products/${product.id}`)
                              }
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {productData.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) - 1,
                        }))
                      }
                      className="border-[#FF6A00]/30"
                    >
                      Trước
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
                                  ? "bg-[#FF6A00] hover:bg-[#E65100]"
                                  : "border-[#FF6A00]/30"
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
                      className="border-[#FF6A00]/30"
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  <Package className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có sản phẩm nào
                </p>
                <p className="text-gray-600 mb-4">
                  Hãy thêm sản phẩm đầu tiên của bạn
                </p>
                <Button
                  className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00]"
                  onClick={() => router.push("/dashboard/products/create")}
                >
                  <Plus className="mr-2 h-4 w-4" />
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
