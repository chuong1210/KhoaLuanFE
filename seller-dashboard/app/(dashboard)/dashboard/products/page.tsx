"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Download,
  Upload,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, ProductFilters } from "@/types/product";
import { ImportProductDialog } from "./components/product-import-modal";
import { Pagination } from "@/components/pagination_form";

// Status badge colors
const statusStyles = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "🕐",
  },
  Active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "✓",
  },
  Deleted: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "✕",
  },
};

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    shop_id: shopId || undefined,
    sort: "price_desc",
    status: undefined,
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

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string = "Active") => {
    const style =
      statusStyles[status as keyof typeof statusStyles] || statusStyles.Active;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
      >
        <span>{style.icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  if (!shopId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Alert className="max-w-md border-2 border-red-100 rounded-2xl shadow-2xl bg-white">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <AlertTitle className="text-xl font-bold text-slate-900">
            Không tìm thấy Shop ID
          </AlertTitle>
          <AlertDescription className="text-base mt-2 text-slate-600">
            Vui lòng đăng ký shop hoặc đăng nhập lại
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
        {/* Header with Modern Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-orange-400 via-orange-500 to-orange-700 p-10 text-white shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300/20 rounded-full blur-2xl translate-y-32 -translate-x-32"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl ring-4 ring-white/30">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                  Quản lý Sản phẩm
                  <Sparkles className="h-8 w-8 text-yellow-200 animate-pulse" />
                </h1>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Package className="h-5 w-5" />
                    <span className="text-lg font-semibold">
                      {productData?.totalElements || 0} sản phẩm
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">
                      Trang {filters.page}/{productData?.totalPages || 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white hover:text-indigo-600 backdrop-blur-sm shadow-lg font-semibold px-6 py-6 rounded-xl transition-all"
              >
                <Download className="mr-2 h-5 w-5" />
                Xuất Excel
              </Button>
              <ImportProductDialog />
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-100/60 shadow-xl font-semibold px-8 py-6 rounded-xl transition-all"
                onClick={() => router.push("/dashboard/products/create")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Card */}
        <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b bg-linear-to-r from-slate-50 to-blue-50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-orange-400 to-amber-400 shadow-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Bộ lọc & Tìm kiếm
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    shop_id: shopId,
                    sort: "price_desc",
                  });
                  setSearchTerm("");
                }}
                className="text-slate-600 hover:text-amber-600"
              >
                Đặt lại
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="grid gap-4 md:grid-cols-5">
              {/* Search Box */}
              <div className="md:col-span-2">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 pointer-events-none" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-6 rounded-xl font-semibold shadow-lg bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      value === "all"
                        ? undefined
                        : (value as "Pending" | "Active" | "Deleted"),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-orange-500 rounded-xl font-medium">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">📋 Tất cả trạng thái</SelectItem>
                  <SelectItem value="Pending">🕐 Chờ duyệt</SelectItem>
                  <SelectItem value="Active">✓ Đang hoạt động</SelectItem>
                  <SelectItem value="Deleted">✕ Đã xóa</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select
                value={filters.sort}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, sort: value, page: 1 }))
                }
              >
                <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-indigo-500 rounded-xl font-medium">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="best_sell">🔥 Bán chạy</SelectItem>
                  <SelectItem value="price_desc">💰 Giá cao nhất</SelectItem>
                  <SelectItem value="price_asc">💵 Giá thấp nhất</SelectItem>
                  <SelectItem value="newest">🆕 Mới nhất</SelectItem>
                  <SelectItem value="name_asc">🔤 Tên A-Z</SelectItem>
                  <SelectItem value="name_desc">🔡 Tên Z-A</SelectItem>
                </SelectContent>
              </Select>

              {/* Items Per Page */}
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
                <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-indigo-500 rounded-xl font-medium">
                  <SelectValue placeholder="Hiển thị" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
        <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-2 border-red-100 rounded-2xl bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-900">Lỗi</AlertTitle>
                <AlertDescription className="text-red-700">
                  Không thể tải danh sách sản phẩm. Vui lòng thử lại.
                </AlertDescription>
              </Alert>
            ) : productData && productData.data.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {productData.data.map((product: Product) => {
                    const imageUrl = productService.getImageUrl(product.image);
                    const priceRange =
                      product.min_price === product.max_price
                        ? formatPrice(product.min_price)
                        : `${formatPrice(product.min_price)} - ${formatPrice(
                            product.max_price
                          )}`;
                    const status = product.delete_status || "Active";

                    return (
                      <Card
                        key={product.id}
                        className="group relative overflow-hidden border-2 border-slate-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl rounded-2xl bg-white"
                      >
                        {/* Product Image */}
                        <div className="relative h-44 overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.jpg";
                            }}
                          />

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            {getStatusBadge(status)}
                          </div>

                          {/* Action Menu */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  className="h-9 w-9 rounded-xl bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-indigo-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl"
                              >
                                <DropdownMenuLabel className="text-indigo-600 font-semibold">
                                  Thao tác
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/products/${product.id}`
                                    )
                                  }
                                  className="cursor-pointer"
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
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteProductMutation.mutate(product.id)
                                  }
                                  className="text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        {/* Product Info */}
                        <CardContent className="p-4">
                          <h3
                            className="line-clamp-2 font-semibold text-sm text-slate-800 mb-2 group-hover:text-indigo-600 min-h-10 cursor-pointer transition-colors"
                            onClick={() =>
                              router.push(`/dashboard/products/${product.id}`)
                            }
                          >
                            {product.name}
                          </h3>

                          <p className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {priceRange}
                          </p>

                          {product.rating && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-yellow-400">★</span>
                              <span className="font-semibold text-slate-700">
                                {product.rating.average_rating.toFixed(1)}
                              </span>
                              <span className="text-slate-400">
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
                  <div className="mt-8">
                    <Pagination
                      currentPage={productData.currentPage || filters.page || 1}
                      totalPages={productData.totalPages}
                      onPageChange={handlePageChange}
                      totalElements={productData.totalElements}
                      pageSize={filters.limit || 20}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-100 to-purple-100 shadow-2xl">
                  <Package className="h-16 w-16 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-3">
                  Chưa có sản phẩm nào
                </p>
                <p className="text-slate-600 text-lg mb-6">
                  Hãy thêm sản phẩm đầu tiên của bạn
                </p>
                <Button
                  size="lg"
                  className="px-10 py-6 rounded-xl font-bold text-white shadow-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
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
