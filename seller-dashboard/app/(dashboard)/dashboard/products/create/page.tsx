"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Loader2, Package, Plus, X, Upload, ArrowLeft } from "lucide-react";
import type {
  CreateProductPayload,
  CreateProductSkuPayload,
} from "@/types/product";

export default function CreateProductPage() {
  const router = useRouter();
  const shopId = useAppSelector((state) => state.auth.shopId);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    short_description: "",
    brand_id: "",
    category_id: "",
    product_is_permission_return: true,
    product_is_permission_check: true,
  });

  const [skus, setSkus] = useState<CreateProductSkuPayload[]>([
    {
      sku_code: "",
      price: 0,
      quantity: 0,
      weight: 0,
      option_value: [],
    },
  ]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  // Fetch categories & brands
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => productService.getBrands(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { data: CreateProductPayload; files: any }) =>
      productService.createProduct(payload.data, payload.files),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công!");
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      toast.error("Tạo sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSku = () => {
    setSkus((prev) => [
      ...prev,
      {
        sku_code: "",
        price: 0,
        quantity: 0,
        weight: 0,
        option_value: [],
      },
    ]);
  };

  const removeSku = (index: number) => {
    if (skus.length > 1) {
      setSkus((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateSku = (
    index: number,
    field: keyof CreateProductSkuPayload,
    value: any
  ) => {
    setSkus((prev) =>
      prev.map((sku, i) => (i === index ? { ...sku, [field]: value } : sku))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId) {
      toast.error("Không tìm thấy Shop ID");
      return;
    }

    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh sản phẩm");
      return;
    }

    // Validate SKUs
    for (const sku of skus) {
      if (!sku.sku_code || sku.price <= 0 || sku.quantity < 0) {
        toast.error("Vui lòng điền đầy đủ thông tin SKU");
        return;
      }
    }

    // Generate key from name if not provided
    const productKey =
      formData.key ||
      formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    // Collect all unique option values
    const allOptionValues: Array<{ option_name: string; value: string }> = [];
    skus.forEach((sku) => {
      sku.option_value.forEach((opt) => {
        if (
          !allOptionValues.find(
            (o) => o.option_name === opt.option_name && o.value === opt.value
          )
        ) {
          allOptionValues.push(opt);
        }
      });
    });

    const payload: CreateProductPayload = {
      ...formData,
      key: productKey,
      shop_id: shopId,
      product_sku: skus,
      option_value: allOptionValues,
    };

    createMutation.mutate({
      data: payload,
      files: {
        image: imageFile,
        media: mediaFiles,
      },
    });
  };

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
                <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
                <p className="text-white/90">Điền thông tin để tạo sản phẩm</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Thông tin cơ bản</CardTitle>
              <CardDescription>Tên, mô tả và hình ảnh sản phẩm</CardDescription>
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
                  Product Key (slug)
                </Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, key: e.target.value }))
                  }
                  placeholder="product-key (tự động tạo nếu để trống)"
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description" className="text-base">
                  Mô tả ngắn *
                </Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      short_description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả ngắn gọn sản phẩm"
                  rows={3}
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Mô tả chi tiết *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chi tiết về sản phẩm"
                  rows={6}
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand_id" className="text-base">
                    Thương hiệu *
                  </Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, brand_id: value }))
                    }
                    required
                  >
                    <SelectTrigger className="border-[#FF6A00]/30">
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.brand_id} value={brand.brand_id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id" className="text-base">
                    Danh mục *
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category_id: value }))
                    }
                    required
                  >
                    <SelectTrigger className="border-[#FF6A00]/30">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.category_id}
                          value={cat.category_id}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="permission_return"
                    checked={formData.product_is_permission_return}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_is_permission_return: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="permission_return" className="cursor-pointer">
                    Cho phép đổi trả
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="permission_check"
                    checked={formData.product_is_permission_check}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_is_permission_check: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="permission_check" className="cursor-pointer">
                    Cho phép kiểm tra hàng
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Hình ảnh & Media</CardTitle>
              <CardDescription>
                Ảnh chính và ảnh phụ của sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-base">Ảnh chính *</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-[#FF6A00]/30">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="main-image"
                      required
                    />
                    <Label
                      htmlFor="main-image"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[#FF6A00]/50 bg-[#FFF0E0] px-4 py-2 text-sm font-medium text-[#FF6A00] hover:bg-[#FFB38A]/30"
                    >
                      <Upload className="h-4 w-4" />
                      {imageFile ? "Đổi ảnh" : "Chọn ảnh chính"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Ảnh phụ (tối đa 5)</Label>
                <div className="space-y-4">
                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-4">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg border-2 border-[#FF6A00]/30">
                            <img
                              src={preview}
                              alt={`Media ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
                            onClick={() => removeMedia(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {mediaFiles.length < 5 && (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMediaChange}
                        className="hidden"
                        id="media-images"
                      />
                      <Label
                        htmlFor="media-images"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[#FF6A00]/50 bg-[#FFF0E0] px-4 py-2 text-sm font-medium text-[#FF6A00] hover:bg-[#FFB38A]/30"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm ảnh phụ
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SKU Management */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#FF6A00]">
                    Phân loại hàng (SKU)
                  </CardTitle>
                  <CardDescription>Thêm các biến thể sản phẩm</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addSku}
                  size="sm"
                  className="bg-[#FF6A00] hover:bg-[#E65100]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm SKU
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {skus.map((sku, index) => (
                <Card
                  key={index}
                  className="border-[#FFB38A]/30 bg-linear-to-br from-white to-[#FFF0E0]/30"
                >
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#FF6A00]">
                        SKU #{index + 1}
                      </h4>
                      {skus.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSku(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Mã SKU *</Label>
                        <Input
                          value={sku.sku_code}
                          onChange={(e) =>
                            updateSku(index, "sku_code", e.target.value)
                          }
                          placeholder="SKU-001"
                          required
                          className="border-[#FF6A00]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Giá (VNĐ) *</Label>
                        <Input
                          type="number"
                          value={sku.price}
                          onChange={(e) =>
                            updateSku(index, "price", parseInt(e.target.value))
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
              ))}
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
              disabled={createMutation.isPending}
              className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00] px-8"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Tạo sản phẩm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
