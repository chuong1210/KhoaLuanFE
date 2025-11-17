"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Package, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UpdateProductPayload } from "@/types/product";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    product_sku: [] as Array<{
      id: string;
      quantity: number;
      price: number;
      weight: number;
    }>,
  });

  const { data: productDetail, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => productService.getProductDetail(params.id),
  });

  useEffect(() => {
    if (productDetail) {
      setFormData({
        name: productDetail.product.name,
        key: productDetail.product.key,
        product_sku: productDetail.sku.map((sku) => ({
          id: sku.id,
          quantity: sku.quantity,
          price: sku.price,
          weight: sku.weight,
        })),
      });
    }
  }, [productDetail]);

  const updateMutation = useMutation({
    mutationFn: (payload: { data: UpdateProductPayload }) =>
      productService.updateProduct(params.id, payload.data),
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công!");
      router.push(`/dashboard/products/${params.id}`);
    },
    onError: (error: any) => {
      toast.error("Cập nhật thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate SKUs
    for (const sku of formData.product_sku) {
      if (sku.price <= 0 || sku.quantity < 0) {
        toast.error("Vui lòng kiểm tra lại thông tin SKU");
        return;
      }
    }

    updateMutation.mutate({ data: formData });
  };

  const updateSku = (
    index: number,
    field: "quantity" | "price" | "weight",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      product_sku: prev.product_sku.map((sku, i) =>
        i === index ? { ...sku, [field]: value } : sku
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
        <div className="mx-auto max-w-5xl">
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

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className="flex-1 rounded-2xl p-6 text-white shadow-xl"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
                <p className="text-white/90">{productDetail.product.name}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Thông tin cơ bản</CardTitle>
              <CardDescription>
                Cập nhật tên và key của sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Tên sản phẩm *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nhập tên sản phẩm"
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key" className="text-base">
                  Product Key *
                </Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, key: e.target.value }))
                  }
                  placeholder="product-key"
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>
            </CardContent>
          </Card>

          {/* SKU Management */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Cập nhật SKU</CardTitle>
              <CardDescription>
                Chỉnh sửa giá, số lượng và cân nặng của các phân loại hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {formData.product_sku.map((sku, index) => {
                const originalSku = productDetail.sku[index];
                return (
                  <Card
                    key={sku.id}
                    className="border-[#FFB38A]/30 bg-linear-to-br from-white to-[#FFF0E0]/30"
                  >
                    <CardContent className="space-y-4 pt-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-[#FF6A00] mb-1">
                          SKU #{index + 1}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mã: {originalSku.sku_code}
                        </p>
                        {originalSku.sku_name && (
                          <p className="text-sm text-gray-700 mt-1">
                            {originalSku.sku_name}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Giá (VNĐ) *</Label>
                          <Input
                            type="number"
                            value={sku.price}
                            onChange={(e) =>
                              updateSku(
                                index,
                                "price",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="0"
                            min="0"
                            required
                            className="border-[#FF6A00]/30"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Số lượng *</Label>
                          <Input
                            type="number"
                            value={sku.quantity}
                            onChange={(e) =>
                              updateSku(
                                index,
                                "quantity",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="0"
                            min="0"
                            required
                            className="border-[#FF6A00]/30"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Cân nặng (kg) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={sku.weight}
                            onChange={(e) =>
                              updateSku(
                                index,
                                "weight",
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder="0"
                            min="0"
                            required
                            className="border-[#FF6A00]/30"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-[#FF6A00]/30"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00] px-8"
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
