"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  Tag,
  Layers,
  Store,
  ShoppingCart,
  Weight,
  Shield,
  RotateCcw,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProductDetail } from "@/features/products/hooks/useProducts";
import { transformImageUrl } from "@/features/products/services/productsApi";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductDetailDialogProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (productId: string, approve: boolean) => void;
  isApproving?: boolean;
}

export function ProductDetailDialog({
  productId,
  open,
  onClose,
  onApprove,
  isApproving,
}: ProductDetailDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { data: detail, isLoading } = useProductDetail(productId || "");

  if (!productId) return null;

  const product = detail?.product;
  const brand = detail?.brand;
  const category = detail?.category;
  const options = detail?.option || [];
  const skus = detail?.sku || [];

  // Parse media array
  let mediaImages: string[] = [];
  try {
    if (product?.media) {
      mediaImages = JSON.parse(product.media);
    }
  } catch (e) {
    console.error("Failed to parse media:", e);
  }

  // All images including main image
  const allImages = [
    product?.image,
    ...mediaImages.filter((img) => img !== product?.image),
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Chi tiết Sản phẩm</DialogTitle>
          <DialogDescription>
            Xem đầy đủ thông tin sản phẩm trước khi phê duyệt
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : product ? (
          <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Product Images & Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images Gallery */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                    <img
                      src={transformImageUrl(allImages[activeImageIndex])}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            activeImageIndex === idx
                              ? "border-orange-vivid scale-105 shadow-lg"
                              : "border-gray-200 hover:border-orange-peach"
                          )}
                        >
                          <img
                            src={transformImageUrl(img)}
                            alt={`${product.name} ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-medium">
                              Đã bán
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                              {product.total_sold || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-700" />
                          </div>
                          <div>
                            <p className="text-xs text-yellow-700 font-medium">
                              Đánh giá
                            </p>
                            <p className="text-lg font-bold text-yellow-900">
                              {product.rating?.average_rating.toFixed(1) ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  {/* Title & Price */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {product.name}
                    </h2>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-orange-vivid">
                          {formatCurrency(product.min_price)}
                        </span>
                        {product.min_price !== product.max_price && (
                          <>
                            <span className="text-gray-400">-</span>
                            <span className="text-3xl font-bold text-orange-vivid">
                              {formatCurrency(product.max_price)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    {product.short_description && (
                      <p className="text-gray-600 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Brand & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-0 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Tag className="h-5 w-5 text-purple-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-700 font-medium mb-1">
                              Thương hiệu
                            </p>
                            <p className="text-sm font-semibold text-purple-900 truncate">
                              {brand?.name || "N/A"}
                            </p>
                            <p className="text-xs text-purple-600 truncate">
                              {brand?.code || ""}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Layers className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-700 font-medium mb-1">
                              Danh mục
                            </p>
                            <p className="text-sm font-semibold text-green-900 truncate">
                              {category?.name || "N/A"}
                            </p>
                            <p className="text-xs text-green-600 truncate">
                              {category?.path || ""}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Metadata */}
                  <Card className="border-0 bg-gray-50">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Shop ID</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {product.shop_id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Trạng thái</p>
                            <Badge
                              variant={
                                product.delete_status === "Active"
                                  ? "success"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {product.delete_status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Kiểm tra</p>
                            <p className="text-sm font-semibold">
                              {product.product_is_permission_check ? "✓" : "✗"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Trả hàng</p>
                            <p className="text-sm font-semibold">
                              {product.product_is_permission_return ? "✓" : "✗"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Tạo bởi</p>
                          <p className="font-semibold text-gray-900">
                            {product.create_by}
                          </p>
                          <p className="text-gray-500">
                            {new Date(product.create_date).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>

                        {product.update_by && (
                          <div>
                            <p className="text-gray-500 mb-1">Cập nhật bởi</p>
                            <p className="font-semibold text-gray-900">
                              {product.update_by}
                            </p>
                            <p className="text-gray-500">
                              {new Date(product.update_date).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Mô tả</TabsTrigger>
                  <TabsTrigger value="options">Thuộc tính</TabsTrigger>
                  <TabsTrigger value="skus">
                    Biến thể ({skus.length})
                  </TabsTrigger>
                </TabsList>

                {/* Description Tab */}
                <TabsContent value="description" className="mt-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Options Tab */}
                <TabsContent value="options" className="mt-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {options.map((option, idx) => (
                          <div key={idx}>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              {option.option_name}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {option.values.map((value) => (
                                <div
                                  key={value.option_value_id}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                                >
                                  {value.image && (
                                    <img
                                      src={transformImageUrl(value.image)}
                                      alt={value.value}
                                      className="w-6 h-6 rounded object-cover"
                                    />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">
                                    {value.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {idx < options.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        ))}

                        {options.length === 0 && (
                          <p className="text-center text-gray-500 py-8">
                            Không có thuộc tính nào
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SKUs Tab */}
                <TabsContent value="skus" className="mt-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {skus.map((sku) => (
                          <Card
                            key={sku.id}
                            className="border-2 border-gray-200 hover:border-orange-peach transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 mb-2">
                                    {sku.sku_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-3">
                                    SKU: {sku.sku_code}
                                  </p>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-orange-vivid" />
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Giá
                                        </p>
                                        <p className="text-sm font-bold text-orange-vivid">
                                          {formatCurrency(sku.price)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-blue-600" />
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Tồn kho
                                        </p>
                                        <p className="text-sm font-bold text-blue-900">
                                          {sku.quantity}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <ShoppingCart className="h-4 w-4 text-green-600" />
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Đặt trước
                                        </p>
                                        <p className="text-sm font-bold text-green-900">
                                          {sku.quantity_reserver}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Weight className="h-4 w-4 text-purple-600" />
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Khối lượng
                                        </p>
                                        <p className="text-sm font-bold text-purple-900">
                                          {sku.weight} kg
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Availability Badge */}
                                <Badge
                                  variant={
                                    sku.quantity > 0 ? "success" : "destructive"
                                  }
                                >
                                  {sku.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {skus.length === 0 && (
                          <p className="text-center text-gray-500 py-8">
                            Không có biến thể nào
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">Không tìm thấy thông tin sản phẩm</p>
          </div>
        )}

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isApproving}>
            Đóng
          </Button>
          {product && onApprove && (
            <>
              <Button
                onClick={() => onApprove(productId, false)}
                variant="destructive"
                disabled={isApproving}
                className="shadow-md"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
              <Button
                onClick={() => onApprove(productId, true)}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700 shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Duyệt sản phẩm
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
