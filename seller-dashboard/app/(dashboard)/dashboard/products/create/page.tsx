"use client";

import type React from "react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Package } from "lucide-react";
import type { ProductFormData } from "@/types/product";
import { ImageUploader } from "@/components/ui/image-uploader";

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    productTempName: "",
    productTempDescription: "",
    productTempDetails: "",
    productTempImage: [""], // ít nhất 1 ảnh bìa
    productTempMedia: [],
    productTempBrandId: "",
    productTempCategoryId: "",
    productTempSkuId: "",
    productTempIsPermissionReturn: false,
  });

  // Fetch categories & brands
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => productService.getBrands(),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      productService.createProductTemp(data),
    onSuccess: () => {
      toast.success("Đã tạo sản phẩm draft", {
        description: "Sản phẩm đã được gửi để admin duyệt",
      });
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      toast.error("Tạo sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ít nhất 1 ảnh
    const validImages = formData.productTempImage.filter(
      (img) => img.trim() !== ""
    );
    if (validImages.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 hình ảnh sản phẩm");
      return;
    }

    createProductMutation.mutate({
      ...formData,
      productTempImage: validImages,
      productTempMedia:
        formData.productTempMedia?.filter((v) => v.trim() !== "") || [],
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Đăng sản phẩm mới
          </h2>
          <p className="text-muted-foreground">
            Tạo sản phẩm draft và gửi cho admin duyệt
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin sản phẩm. Sản phẩm sẽ được gửi đến admin để
            phê duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productTempName">Tên sản phẩm *</Label>
              <Input
                id="productTempName"
                name="productTempName"
                value={formData.productTempName}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="productTempDescription">Mô tả ngắn gọn *</Label>
              <Textarea
                id="productTempDescription"
                name="productTempDescription"
                value={formData.productTempDescription}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn về sản phẩm"
                rows={3}
                required
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="productTempDetails">
                Chi tiết sản phẩm (tùy chọn)
              </Label>
              <Textarea
                id="productTempDetails"
                name="productTempDetails"
                value={formData.productTempDetails}
                onChange={handleChange}
                placeholder="Thông số kỹ thuật, tính năng nổi bật..."
                rows={5}
              />
            </div>

            {/* Images Upload */}
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm * (ít nhất 1 ảnh bìa)</Label>
              <ImageUploader
                images={formData.productTempImage}
                onChange={(images) =>
                  setFormData((prev) => ({ ...prev, productTempImage: images }))
                }
                maxImages={10}
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="productTempSkuId">Mã SKU *</Label>
              <Input
                id="productTempSkuId"
                name="productTempSkuId"
                value={formData.productTempSkuId}
                onChange={handleChange}
                placeholder="SKU-001"
                required
              />
            </div>

            {/* Category & Brand */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productTempCategoryId">Danh mục *</Label>
                <Select
                  value={formData.productTempCategoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      productTempCategoryId: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productTempBrandId">Thương hiệu *</Label>
                <Select
                  value={formData.productTempBrandId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      productTempBrandId: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Return Permission */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="productTempIsPermissionReturn"
                checked={formData.productTempIsPermissionReturn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    productTempIsPermissionReturn: checked as boolean,
                  }))
                }
              />
              <Label
                htmlFor="productTempIsPermissionReturn"
                className="cursor-pointer"
              >
                Cho phép đổi trả
              </Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="flex-1"
              >
                {createProductMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Tạo sản phẩm và gửi duyệt
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
