"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useProducts,
  useDeleteProduct,
} from "@/features/products/hooks/useProducts";
import type { Product, ProductSearchParams } from "@/features/products/types";
import { formatCurrency, truncateText, cn, getImageUrl } from "@/lib/utils";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    page: 1,
    limit: 10,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useProducts(searchParams);
  const deleteProduct = useDeleteProduct();

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      keywords: searchKeyword,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sort: string) => {
    setSearchParams((prev) => ({ ...prev, sort, page: 1 }));
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteProduct.mutate(productId);
    }
  };

  const parseMedia = (media: string): string[] => {
    try {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 mt-1">
            Quản lý tất cả sản phẩm trên sàn thương mại điện tử
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <Select
              value={searchParams.sort || "newest"}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                <SelectItem value="name_asc">Tên A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Giá từ"
                className="w-28"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    price_min: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Giá đến"
                className="w-28"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    price_max: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-vivid" />
            Danh sách sản phẩm
            {data && (
              <Badge variant="processing" className="ml-2">
                {data.totalElements} sản phẩm
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead className="w-16">Hình ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((product) => (
                  <TableRow key={product.id} className="table-row-hover">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-orange-apricot">
                        {product.image ? (
                          <Image
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-orange-peach" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800">
                          {truncateText(product.name, 40)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {truncateText(product.short_description || "", 50)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {product.shop_id}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium text-orange-vivid">
                          {formatCurrency(product.min_price)}
                        </p>
                        {product.min_price !== product.max_price && (
                          <p className="text-sm text-gray-500">
                            - {formatCurrency(product.max_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.delete_status === "Active"
                            ? "success"
                            : "error"
                        }
                      >
                        {product.delete_status === "Active"
                          ? "Hoạt động"
                          : "Đã xóa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-orange-deep hover:text-orange-deep"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                      <p>Không có sản phẩm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sản phẩm
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Product Image */}
              <div className="flex gap-4">
                <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-orange-apricot flex-shrink-0">
                  {selectedProduct.image ? (
                    <Image
                      src={getImageUrl(selectedProduct.image)}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-orange-peach" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedProduct.short_description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <span className="text-sm text-gray-500">Giá:</span>
                      <span className="ml-2 font-bold text-orange-vivid">
                        {formatCurrency(selectedProduct.min_price)}
                        {selectedProduct.min_price !==
                          selectedProduct.max_price && (
                          <span>
                            {" "}
                            - {formatCurrency(selectedProduct.max_price)}
                          </span>
                        )}
                      </span>
                    </div>
                    <Badge
                      variant={
                        selectedProduct.delete_status === "Active"
                          ? "success"
                          : "error"
                      }
                    >
                      {selectedProduct.delete_status === "Active"
                        ? "Hoạt động"
                        : "Đã xóa"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Shop ID:</span>
                  <span className="ml-2 font-medium">
                    {selectedProduct.shop_id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category ID:</span>
                  <span className="ml-2 font-medium">
                    {selectedProduct.category_id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Brand ID:</span>
                  <span className="ml-2 font-medium">
                    {selectedProduct.brand_id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Tạo bởi:</span>
                  <span className="ml-2 font-medium">
                    {selectedProduct.create_by}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <span className="text-sm text-gray-500">Mô tả:</span>
                  <div
                    className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.description,
                    }}
                  />
                </div>
              )}

              {/* Media Gallery */}
              {selectedProduct.media && (
                <div>
                  <span className="text-sm text-gray-500">Hình ảnh khác:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {parseMedia(selectedProduct.media).map((url, index) => (
                      <div
                        key={index}
                        className="relative h-16 w-16 rounded overflow-hidden bg-orange-apricot"
                      >
                        <Image
                          src={getImageUrl(url)}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
