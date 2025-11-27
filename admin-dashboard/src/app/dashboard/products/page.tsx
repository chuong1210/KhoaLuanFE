"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Package,
  Store,
  Filter,
  Search,
  Eye,
  ChevronDown,
  AlertCircle,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShopSelect } from "@/components/ui/shop-select";
import {
  usePendingProductsByShop,
  useApproveProduct,
  useBatchApproveProducts,
} from "@/features/products/hooks/useProductApproval";
import { transformImageUrl } from "@/features/products/services/productsApi";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  image: string;
  min_price: number;
  max_price: number;
  shop_id: string;
  description: string;
  short_description: string;
  create_date: string;
  rating?: {
    average_rating: number;
    total_reviews: number;
  };
}

export default function ProductApprovalPage() {
  const [sortBy, setSortBy] = useState<"shop" | "date" | "price">("shop");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopFilter, setSelectedShopFilter] = useState<
    string | undefined
  >();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const { data, isLoading } = usePendingProductsByShop({ page: 1, limit: 100 });
  const approveProduct = useApproveProduct();
  const batchApprove = useBatchApproveProducts();

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all products in filtered view
  const toggleAllProducts = () => {
    if (!filteredShops) return;

    const allProductIds = filteredShops.flatMap((shop) =>
      shop.products.map((p: Product) => p.id)
    );

    const allSelected = allProductIds.every((id) =>
      selectedProducts.includes(id)
    );

    if (allSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(allProductIds);
    }
  };

  // Approve single product
  const handleApprove = async (productId: string, approve: boolean) => {
    await approveProduct.mutateAsync({ productId, approve });
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  // Batch approve
  const handleBatchApprove = async (approve: boolean) => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    await batchApprove.mutateAsync({
      productIds: selectedProducts,
      approve,
    });
    setSelectedProducts([]);
  };

  // Filter and sort data
  const filteredShops = data?.by_shop
    .filter(
      (shop) => !selectedShopFilter || shop.shop_id === selectedShopFilter
    )
    .map((shop) => ({
      ...shop,
      products: shop.products.filter((p: Product) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((shop) => shop.products.length > 0)
    .sort((a, b) => {
      if (sortBy === "shop") return a.shop_id.localeCompare(b.shop_id);
      if (sortBy === "date") {
        const dateA = new Date(a.products[0]?.create_date || 0).getTime();
        const dateB = new Date(b.products[0]?.create_date || 0).getTime();
        return dateB - dateA;
      }
      return b.pending_count - a.pending_count;
    });

  const totalFilteredProducts =
    filteredShops?.reduce((sum, shop) => sum + shop.products.length, 0) || 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-vivid via-orange-warm to-orange-amber p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Duyệt Sản phẩm</h1>
              <p className="text-white/90 mt-1">
                Quản lý và phê duyệt sản phẩm từ các cửa hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Tổng chờ duyệt
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {isLoading ? "-" : data?.total_pending || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">Sản phẩm</p>
              </div>
              <div className="p-3 bg-blue-200/50 rounded-xl">
                <Package className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Cửa hàng</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {isLoading ? "-" : data?.shops_with_pending || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">Có sản phẩm chờ</p>
              </div>
              <div className="p-3 bg-purple-200/50 rounded-xl">
                <Store className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Đã chọn</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {selectedProducts.length}
                </p>
                <p className="text-xs text-green-600 mt-1">Sản phẩm</p>
              </div>
              <div className="p-3 bg-green-200/50 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Đang hiển thị
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-1">
                  {totalFilteredProducts}
                </p>
                <p className="text-xs text-orange-600 mt-1">Sản phẩm</p>
              </div>
              <div className="p-3 bg-orange-200/50 rounded-xl">
                <Filter className="h-8 w-8 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Top Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Shop Filter */}
              <ShopSelect
                value={selectedShopFilter}
                onValueChange={setSelectedShopFilter}
                placeholder="Lọc theo shop..."
                className="md:w-[300px] h-11"
              />

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="md:w-[180px] h-11">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shop">Theo Shop</SelectItem>
                  <SelectItem value="date">Mới nhất</SelectItem>
                  <SelectItem value="price">Số lượng nhiều</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bottom Row - Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    totalFilteredProducts > 0 &&
                    selectedProducts.length === totalFilteredProducts
                  }
                  onCheckedChange={toggleAllProducts}
                />
                <span className="text-sm text-gray-600">
                  Chọn tất cả ({totalFilteredProducts})
                </span>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              <Button
                onClick={() => handleBatchApprove(true)}
                disabled={
                  selectedProducts.length === 0 || approveProduct.isPending
                }
                className="bg-green-600 hover:bg-green-700 shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Duyệt ({selectedProducts.length})
              </Button>

              <Button
                onClick={() => handleBatchApprove(false)}
                disabled={
                  selectedProducts.length === 0 || approveProduct.isPending
                }
                variant="destructive"
                className="shadow-md"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối ({selectedProducts.length})
              </Button>

              {(searchQuery || selectedShopFilter) && (
                <>
                  <div className="h-6 w-px bg-gray-200" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedShopFilter(undefined);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShops && filteredShops.length > 0 ? (
        <div className="space-y-8">
          {filteredShops.map((shop) => (
            <div key={shop.shop_id}>
              {/* Shop Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-vivid to-orange-warm flex items-center justify-center shadow-lg">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Shop: {shop.shop_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {shop.pending_count} sản phẩm chờ duyệt
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="px-4 py-1.5">
                  <Clock className="h-3 w-3 mr-1" />
                  {shop.pending_count} chờ
                </Badge>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shop.products.map((product: Product) => {
                  const isSelected = selectedProducts.includes(product.id);

                  return (
                    <Card
                      key={product.id}
                      className={cn(
                        "group overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl",
                        isSelected
                          ? "border-orange-vivid shadow-xl scale-[1.02]"
                          : "border-transparent hover:border-orange-peach"
                      )}
                    >
                      {/* Image */}
                      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <img
                          src={transformImageUrl(product.image)}
                          alt={product.name}
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Checkbox */}
                        <div className="absolute top-3 left-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg backdrop-blur-sm transition-all",
                              isSelected
                                ? "bg-orange-vivid shadow-lg"
                                : "bg-white/90"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleProduct(product.id)}
                            />
                          </div>
                        </div>

                        {/* Rating Badge */}
                        {product.rating && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-yellow-400 text-yellow-900 shadow-lg">
                              ⭐ {product.rating.average_rating.toFixed(1)}
                            </Badge>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setViewProduct(product)}
                            className="shadow-lg backdrop-blur-sm bg-white/90"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                            {product.short_description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-orange-vivid">
                            {formatCurrency(product.min_price)}
                          </span>
                          {product.min_price !== product.max_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.max_price)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(product.id, true)}
                            disabled={approveProduct.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprove(product.id, false)}
                            disabled={approveProduct.isPending}
                            className="shadow-md"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-apricot to-orange-peach flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-orange-vivid" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery || selectedShopFilter
                  ? "Không tìm thấy sản phẩm"
                  : "Không có sản phẩm chờ duyệt"}
              </h3>
              <p className="text-gray-500">
                {searchQuery || selectedShopFilter
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Tất cả sản phẩm đã được duyệt"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Product Dialog */}
      <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Xem thông tin đầy đủ trước khi phê duyệt
            </DialogDescription>
          </DialogHeader>

          {viewProduct && (
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Product Image */}
                <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  <img
                    src={transformImageUrl(viewProduct.image)}
                    alt={viewProduct.name}
                    className=" object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                </div>

                {/* Product Info */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl text-gray-800 mb-2">
                        {viewProduct.name}
                      </h3>
                      <p className="text-gray-600">
                        {viewProduct.short_description}
                      </p>
                    </div>
                    {viewProduct.rating && (
                      <Badge className="bg-yellow-400 text-yellow-900">
                        ⭐ {viewProduct.rating.average_rating.toFixed(1)} (
                        {viewProduct.rating.total_reviews})
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-orange-vivid">
                      {formatCurrency(viewProduct.min_price)}
                    </span>
                    {viewProduct.min_price !== viewProduct.max_price && (
                      <>
                        <span className="text-gray-400">-</span>
                        <span className="text-2xl font-bold text-orange-vivid">
                          {formatCurrency(viewProduct.max_price)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Mô tả chi tiết:
                    </p>
                    <div
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: viewProduct.description,
                      }}
                    />
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700 font-medium">
                        Shop ID
                      </p>
                      <p className="text-sm font-semibold text-blue-900 mt-1">
                        {viewProduct.shop_id}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-700 font-medium">
                        Ngày tạo
                      </p>
                      <p className="text-sm font-semibold text-purple-900 mt-1">
                        {new Date(viewProduct.create_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProduct(null)}>
              Đóng
            </Button>
            {viewProduct && (
              <>
                <Button
                  onClick={() => {
                    handleApprove(viewProduct.id, false);
                    setViewProduct(null);
                  }}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(viewProduct.id, true);
                    setViewProduct(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
