"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  ArrowLeft,
  AlertCircle,
  Upload,
  X,
  ImagePlus,
  Check,
  Save,
  Info,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UpdateProductPayload } from "@/types/product";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // ============= STATE =============
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    short_description: "",
    category_id: "",
    product_is_permission_return: true,
    product_is_permission_check: true,
    product_sku: [] as Array<{
      id: string;
      quantity: number;
      price: number;
      weight: number;
    }>,
  });

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  // Media states
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  // Bulk edit state
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [bulkWeight, setBulkWeight] = useState<string>("");

  // ============= QUERIES =============
  const { data: productDetail, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductDetail(id),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  // ============= POPULATE DATA =============
  useEffect(() => {
    if (productDetail) {
      const product = productDetail.product;

      setFormData({
        name: product.name,
        key: product.key,
        description: product.description || "",
        short_description: product.short_description || "",
        category_id: product.category_id,
        product_is_permission_return: product.product_is_permission_return,
        product_is_permission_check: product.product_is_permission_check,
        product_sku: productDetail.sku.map((sku) => ({
          id: sku.id,
          quantity: sku.quantity,
          price: sku.price,
          weight: sku.weight,
        })),
      });

      // Image
      if (product.image) {
        const imageUrl = productService.getImageUrl(product.image);
        setOriginalImageUrl(imageUrl);
        setImagePreview(imageUrl);
      }

      // Media
      if (product.media) {
        try {
          const mediaArr = JSON.parse(product.media);
          if (Array.isArray(mediaArr)) {
            setExistingMedia(
              mediaArr.map((m: string) => productService.getImageUrl(m))
            );
          }
        } catch (e) {
          console.error("Error parsing media JSON", e);
          setExistingMedia([]);
        }
      }
    }
  }, [productDetail]);

  // ============= MUTATION =============
  const updateMutation = useMutation({
    mutationFn: (payload: { data: UpdateProductPayload; files: any }) =>
      productService.updateProduct(id, payload.data, payload.files),
    onSuccess: () => {
      toast.success("Cập nhật thành công!", {
        description: "Thông tin sản phẩm đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push(`/dashboard/products`);
    },
    onError: (error: any) => {
      toast.error("Cập nhật thất bại", {
        description: error.message || "Vui lòng thử lại",
      });
    },
  });

  // ============= HANDLERS =============
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", { description: "Vui lòng chọn ảnh dưới 5MB" });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalMedia = existingMedia.length + mediaFiles.length + files.length;
    if (totalMedia > 8) {
      toast.error("Tối đa 8 ảnh", {
        description: "Bạn chỉ có thể có tối đa 8 ảnh phụ",
      });
      return;
    }

    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} quá lớn`, {
          description: "Vui lòng chọn ảnh dưới 5MB",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
    toast.info("Ảnh sẽ bị xóa khi lưu thay đổi");
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

  const applyBulkInfo = () => {
    const price = parseFloat(bulkPrice);
    const stock = parseInt(bulkStock);
    const weight = parseFloat(bulkWeight);

    if (isNaN(price) && isNaN(stock) && isNaN(weight)) {
      toast.error("Vui lòng nhập ít nhất một giá trị");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      product_sku: prev.product_sku.map((sku) => ({
        ...sku,
        price: !isNaN(price) && price > 0 ? price : sku.price,
        quantity: !isNaN(stock) && stock >= 0 ? stock : sku.quantity,
        weight: !isNaN(weight) && weight > 0 ? weight : sku.weight,
      })),
    }));

    toast.success("Áp dụng thành công", {
      description: `Đã cập nhật ${formData.product_sku.length} phân loại`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả sản phẩm");
      return;
    }

    const invalidSku = formData.product_sku.find(
      (s) => s.price <= 0 || s.quantity < 0
    );
    if (invalidSku) {
      toast.error("Thông tin SKU không hợp lệ", {
        description: "Giá phải > 0 và số lượng phải ≥ 0",
      });
      return;
    }

    updateMutation.mutate({
      data: formData,
      files: {
        image: imageFile || undefined,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      },
    });
  };

  // ============= CLEANUP =============
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview !== originalImageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ============= LOADING STATE =============
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50/30 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // ============= ERROR STATE =============
  if (!productDetail) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không tìm thấy sản phẩm hoặc bạn không có quyền truy cập.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50/30 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ============= HEADER ============= */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-orange-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#FF6A00]">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {productDetail.product.name}
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
            ID: {id.substring(0, 8)}...
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          id="edit-product-form"
          className="space-y-6"
        >
          {/* ============= 1. THÔNG TIN CƠ BẢN ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#FF6A00]" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Tên, mô tả và danh mục sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Áo thun cotton nam cổ tròn basic"
                  className="border-gray-300 focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Danh mục <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category_id: val })
                    }
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#FF6A00] focus:ring-[#FF6A00]">
                      <SelectValue placeholder="Chọn ngành hàng" />
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

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Slug / Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                    placeholder="slug-san-pham"
                    className="border-gray-300 focus:border-[#FF6A00]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Mô tả ngắn</Label>
                <Textarea
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  placeholder="Mô tả ngắn gọn về sản phẩm (hiển thị trên danh sách)"
                  rows={2}
                  className="border-gray-300 focus:border-[#FF6A00] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết về sản phẩm: chất liệu, đặc điểm, hướng dẫn sử dụng..."
                  rows={6}
                  className="border-gray-300 focus:border-[#FF6A00] resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* ============= 2. HÌNH ẢNH ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-[#FF6A00]" />
                Hình ảnh sản phẩm
              </CardTitle>
              <CardDescription>
                Cập nhật ảnh bìa và ảnh chi tiết (tối đa 8 ảnh phụ)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                {/* Ảnh bìa */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-600">
                    Ảnh bìa <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onClick={() =>
                      document.getElementById("edit-image-input")?.click()
                    }
                    className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-linear-to-br from-orange-50 to-orange-100/50 hover:border-[#FF6A00] hover:bg-orange-100 transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white">
                            <Upload className="mx-auto h-8 w-8 mb-1" />
                            <span className="text-sm">Đổi ảnh</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-[#FF6A00]">
                        <Upload className="mx-auto h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">
                          Thêm ảnh bìa
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP
                        </p>
                      </div>
                    )}
                    <input
                      id="edit-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  {imageFile && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Ảnh mới đã chọn
                    </p>
                  )}
                </div>

                {/* Ảnh chi tiết */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-600 flex items-center gap-2">
                    Hình ảnh chi tiết (
                    {existingMedia.length + mediaFiles.length}/8)
                    <Info className="h-3 w-3 text-gray-400" />
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Ảnh cũ */}
                    {existingMedia.map((url, idx) => (
                      <div
                        key={`old-${idx}`}
                        className="relative h-32 w-full group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-300 transition-all"
                      >
                        <img
                          src={url}
                          alt={`Media ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-gray-800/70 text-white text-xs px-2 py-0.5 rounded">
                          Hiện tại
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(idx)}
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Ảnh mới */}
                    {mediaPreviews.map((url, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="relative h-32 w-full group rounded-lg overflow-hidden border-2 border-green-400 hover:border-green-500 transition-all"
                      >
                        <img
                          src={url}
                          alt={`New ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                          Mới
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewMedia(idx)}
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Nút thêm */}
                    {existingMedia.length + mediaFiles.length < 8 && (
                      <div
                        onClick={() =>
                          document.getElementById("edit-media-input")?.click()
                        }
                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF6A00] hover:bg-gray-50 transition-all"
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">
                          Thêm ảnh
                        </span>
                        <input
                          id="edit-media-input"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleMediaChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============= 3. BIẾN THỂ & GIÁ ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#FF6A00]" />
                Biến thể & Giá bán
              </CardTitle>
              <CardDescription>
                Cập nhật giá, kho và cân nặng cho từng phân loại
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Bulk Edit */}
              {formData.product_sku.length > 1 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">
                      Cập nhật hàng loạt
                    </h3>
                  </div>
                  <div className="flex gap-3 items-end bg-linear-to-r from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold mb-1 block">
                        Giá bán (₫)
                      </Label>
                      <Input
                        type="number"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="h-10 bg-white border-orange-300"
                        placeholder="Nhập giá chung"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs font-semibold mb-1 block">
                        Số lượng kho
                      </Label>
                      <Input
                        type="number"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        className="h-10 bg-white border-orange-300"
                        placeholder="Nhập kho chung"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs font-semibold mb-1 block">
                        Cân nặng (kg)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bulkWeight}
                        onChange={(e) => setBulkWeight(e.target.value)}
                        className="h-10 bg-white border-orange-300"
                        placeholder="Nhập khối lượng"
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-10 bg-[#FF6A00] hover:bg-[#E65100] font-semibold px-6"
                      onClick={applyBulkInfo}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Áp dụng
                    </Button>
                  </div>
                </div>
              )}

              {/* SKU Table */}
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-linear-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">
                    <tr>
                      <th className="p-4 text-left">Phân loại</th>
                      <th className="p-4 text-left">Mã SKU</th>
                      <th className="p-4 text-left">
                        Giá (₫) <span className="text-red-500">*</span>
                      </th>
                      <th className="p-4 text-left">
                        Kho <span className="text-red-500">*</span>
                      </th>
                      <th className="p-4 text-left">
                        Cân nặng (kg) <span className="text-red-500">*</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.product_sku.map((sku, index) => {
                      const originalSku = productDetail.sku[index];
                      const skuName =
                        originalSku?.sku_name || originalSku?.sku_code;

                      // Get option values for display
                      const optionValues = productDetail.option
                        ?.flatMap((opt) =>
                          opt.values
                            .filter((v) =>
                              originalSku.option_value_ids.includes(
                                v.option_value_id
                              )
                            )
                            .map((v) => v.value)
                        )
                        .filter(Boolean);

                      return (
                        <tr
                          key={sku.id}
                          className="bg-white hover:bg-orange-50/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              {optionValues && optionValues.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {optionValues.map((val, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                                    >
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm italic">
                                  {skuName || "Mặc định"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {originalSku.sku_code}
                            </code>
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              value={sku.price || ""}
                              onChange={(e) =>
                                updateSku(
                                  index,
                                  "price",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-9 border-orange-300 focus:border-[#FF6A00] w-32"
                              min={0}
                              placeholder="0"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              value={sku.quantity || ""}
                              onChange={(e) =>
                                updateSku(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-9 border-orange-300 focus:border-[#FF6A00] w-28"
                              min={0}
                              placeholder="0"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              step="0.01"
                              value={sku.weight || ""}
                              onChange={(e) =>
                                updateSku(
                                  index,
                                  "weight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-9 border-gray-300 w-28"
                              min={0}
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ============= 4. CÀI ĐẶT KHÁC ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle>Cài đặt vận chuyển</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id="return"
                    checked={formData.product_is_permission_return}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        product_is_permission_return: !!c,
                      })
                    }
                    className="border-gray-400"
                  />
                  <Label
                    htmlFor="return"
                    className="font-medium cursor-pointer"
                  >
                    Cho phép đổi trả hàng
                  </Label>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id="check"
                    checked={formData.product_is_permission_check}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        product_is_permission_check: !!c,
                      })
                    }
                    className="border-gray-400"
                  />
                  <Label htmlFor="check" className="font-medium cursor-pointer">
                    Cho phép kiểm tra hàng trước khi nhận
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============= ACTION BUTTONS ============= */}
          {/* Add padding at bottom to prevent content being hidden */}
          <div className="h-24"></div>
        </form>

        {/* Sticky footer outside form */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-5 border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="mx-auto max-w-6xl flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <Info className="h-4 w-4 inline mr-1" />
              Thay đổi sẽ được áp dụng ngay khi lưu
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8 h-12 text-base border-2"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                form="edit-product-form"
                className="bg-linear-to-r from-[#FF6A00] to-[#FF8533] hover:from-[#E65100] hover:to-[#FF6A00] px-10 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
