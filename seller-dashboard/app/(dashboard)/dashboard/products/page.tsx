"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import { useAppSelector } from "@/store/hooks";
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
  MoreVertical, // Dùng icon dọc nhìn sang hơn
  Edit,
  Trash2,
  Eye,
  Search,
  Package,
  AlertCircle,
  ShoppingBag,
  ArrowUpDown,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product, ProductFilters } from "@/types/product";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility này từ shadcn

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12, // Số lượng mặc định đẹp cho lưới 3 hoặc 4 cột
    shop_id: shopId || undefined,
    sort: "price_desc",
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

  const formatPrice = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });

    if (min === max) return formatter.format(min);
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  if (!shopId) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-700 font-bold ml-2">Cần đăng nhập</AlertTitle>
          <AlertDescription className="text-red-600 mt-1">
            Không tìm thấy thông tin cửa hàng. Vui lòng đăng nhập lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8 space-y-8">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Danh sách sản phẩm
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            Quản lý kho hàng và hiển thị của bạn.
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
              {productData?.totalElements || 0} sản phẩm
            </span>
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-orange-500/30 font-semibold"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
          }}
          onClick={() => router.push("/dashboard/products/create")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* --- TOOLBAR SECTION --- */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-[#F8F9FA]/80 backdrop-blur-md md:static md:bg-transparent md:p-0 md:mx-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, mã sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-lg"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-9"
              onClick={handleSearch}
            >
              Tìm
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              value={filters.sort}
              onValueChange={(value: any) =>
                setFilters((prev) => ({ ...prev, sort: value, page: 1 }))
              }
            >
              <SelectTrigger className="w-full md:w-[180px] h-11 border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sắp xếp" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="name_asc">Tên: A - Z</SelectItem>
                <SelectItem value="name_desc">Tên: Z - A</SelectItem>
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
              <SelectTrigger className="w-[100px] md:w-[120px] h-11 border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <LayoutGrid className="h-4 w-4" />
                  <SelectValue placeholder="Hiển thị" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 / trang</SelectItem>
                <SelectItem value="24">24 / trang</SelectItem>
                <SelectItem value="48">48 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[280px] w-full rounded-2xl" />
              <div className="space-y-2 px-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-red-100 shadow-sm">
          <AlertCircle className="h-16 w-16 text-red-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Đã xảy ra lỗi</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc thử lại sau.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      ) : productData && productData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productData.data.map((product: Product) => {
              const imageUrl = productService.getImageUrl(product.image);

              return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"; // Đảm bảo có ảnh placeholder
                      }}
                    />

                    {/* Overlay Gradient on Hover (Optional enhancement) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Actions Menu Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600 shadow-sm backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-orange-100">
                          <DropdownMenuLabel className="text-xs font-normal text-gray-500 uppercase tracking-wider">Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-orange-500" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa sản phẩm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Category/Rating Row */}
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                        <span>★</span>
                        <span>
                          {product.rating?.average_rating.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-400 font-normal ml-0.5">
                          ({product.rating?.total_reviews || 0})
                        </span>
                      </div>
                      {/* Nếu có trường category, hiển thị ở đây */}
                    </div>

                    {/* Title */}
                    <h3
                      className="font-bold text-gray-800 leading-tight line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {product.short_description || "Chưa có mô tả ngắn cho sản phẩm này."}
                    </p>

                    {/* Price & Action Footer */}
                    <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Giá bán</span>
                        <span className="text-lg font-bold text-[#E65100]">
                          {formatPrice(product.min_price, product.max_price)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-9 w-9 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {productData.totalPages > 1 && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  className="text-gray-500 hover:text-orange-600"
                >
                  Trước
                </Button>

                <div className="flex items-center px-2 gap-1">
                  {Array.from({ length: Math.min(5, productData.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = filters.page === pageNum;
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg font-medium transition-all",
                          isActive
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {productData.totalPages > 5 && <span className="text-gray-400 px-1">...</span>}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={filters.page === productData.totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  className="text-gray-500 hover:text-orange-600"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-orange-50 p-6 rounded-full mb-6 animate-pulse">
            <ShoppingBag className="h-12 w-12 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Kho hàng của bạn đang trống. Hãy bắt đầu bằng việc thêm sản phẩm đầu tiên để tiếp cận khách hàng.
          </p>
          <Button
            size="lg"
            className="font-semibold shadow-lg shadow-orange-500/20"
            style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}
            onClick={() => router.push("/dashboard/products/create")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Tạo sản phẩm đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
}