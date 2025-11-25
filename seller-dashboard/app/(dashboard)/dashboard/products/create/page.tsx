"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Loader2,
  Package,
  Plus,
  X,
  Upload,
  ArrowLeft,
  Trash2,
  ImagePlus,
  AlertCircle,
  Check,
} from "lucide-react";
import type { CreateProductPayload } from "@/types/product";

// ============= HELPER TYPES =============
interface OptionValueInput {
  id: string;
  value: string;
  imageFile?: File | null;
  imagePreview?: string;
}

interface OptionGroup {
  id: string;
  name: string;
  values: OptionValueInput[];
}

interface SkuVariant {
  id: string;
  sku_code: string;
  price: number;
  quantity: number;
  weight: number;
  option_combinations: { option_name: string; value: string }[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // ============= BASIC INFO STATE =============
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    short_description: "",
    category_id: "",
    product_is_permission_return: true,
    product_is_permission_check: true,
  });

  // ============= MEDIA STATE =============
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  // ============= VARIANTS STATE =============
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [skuVariants, setSkuVariants] = useState<SkuVariant[]>([
    {
      id: "default",
      sku_code: "",
      price: 0,
      quantity: 0,
      weight: 0,
      option_combinations: [],
    },
  ]);

  // ============= BULK EDIT STATE =============
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [bulkWeight, setBulkWeight] = useState<string>("");

  // ============= QUERIES =============
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  // ============= MUTATION =============
  const createMutation = useMutation({
    mutationFn: (payload: {
      data: CreateProductPayload;
      files: { image: File; media?: File[]; option_value_images?: File[] };
    }) => productService.createProduct(payload.data, payload.files),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công!", {
        description: "Sản phẩm đã được thêm vào danh sách",
      });
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Tạo sản phẩm thất bại", {
        description: error.message || "Vui lòng kiểm tra lại thông tin",
      });
    },
  });

  // ============= MEDIA HANDLERS =============
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh quá lớn", {
          description: "Vui lòng chọn ảnh dưới 5MB",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (mediaFiles.length + files.length > 8) {
      toast.error("Tối đa 8 ảnh", {
        description: "Bạn chỉ có thể tải lên tối đa 8 ảnh phụ",
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
      validFiles.forEach((file) => {
        setMediaPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    }
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ============= OPTION GROUP HANDLERS =============
  const addOptionGroup = () => {
    if (optionGroups.length >= 2) {
      toast.error("Đã đạt giới hạn", {
        description: "Chỉ hỗ trợ tối đa 2 nhóm phân loại (VD: Màu sắc + Size)",
      });
      return;
    }
    setOptionGroups([
      ...optionGroups,
      {
        id: crypto.randomUUID(),
        name: "",
        values: [{ id: crypto.randomUUID(), value: "" }],
      },
    ]);
  };

  const removeOptionGroup = (index: number) => {
    const group = optionGroups[index];
    // Clean up image previews
    group.values.forEach((v) => {
      if (v.imagePreview) URL.revokeObjectURL(v.imagePreview);
    });

    const newGroups = optionGroups.filter((_, i) => i !== index);
    setOptionGroups(newGroups);
  };

  const updateOptionGroupName = (index: number, name: string) => {
    const newGroups = [...optionGroups];
    newGroups[index].name = name;
    setOptionGroups(newGroups);
  };

  const addOptionValue = (groupIndex: number) => {
    const newGroups = [...optionGroups];
    newGroups[groupIndex].values.push({ id: crypto.randomUUID(), value: "" });
    setOptionGroups(newGroups);
  };

  const removeOptionValue = (groupIndex: number, valueIndex: number) => {
    const newGroups = [...optionGroups];
    const value = newGroups[groupIndex].values[valueIndex];

    // Clean up image preview
    if (value.imagePreview) {
      URL.revokeObjectURL(value.imagePreview);
    }

    newGroups[groupIndex].values = newGroups[groupIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setOptionGroups(newGroups);
  };

  const updateOptionValue = (
    groupIndex: number,
    valueIndex: number,
    val: string
  ) => {
    const newGroups = [...optionGroups];
    newGroups[groupIndex].values[valueIndex].value = val;
    setOptionGroups(newGroups);
  };

  const handleOptionValueImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    groupIndex: number,
    valueIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", { description: "Vui lòng chọn ảnh dưới 5MB" });
      return;
    }

    const newGroups = [...optionGroups];
    const oldPreview = newGroups[groupIndex].values[valueIndex].imagePreview;

    // Clean up old preview
    if (oldPreview) {
      URL.revokeObjectURL(oldPreview);
    }

    newGroups[groupIndex].values[valueIndex].imageFile = file;
    newGroups[groupIndex].values[valueIndex].imagePreview =
      URL.createObjectURL(file);
    setOptionGroups(newGroups);
  };

  const removeOptionValueImage = (groupIndex: number, valueIndex: number) => {
    const newGroups = [...optionGroups];
    const value = newGroups[groupIndex].values[valueIndex];

    if (value.imagePreview) {
      URL.revokeObjectURL(value.imagePreview);
    }

    newGroups[groupIndex].values[valueIndex].imageFile = null;
    newGroups[groupIndex].values[valueIndex].imagePreview = undefined;
    setOptionGroups(newGroups);
  };

  // ============= SKU GENERATION LOGIC (FIXED) =============
  useEffect(() => {
    // Lọc các nhóm hợp lệ (có tên và có ít nhất 1 giá trị)
    const validGroups = optionGroups.filter(
      (g) => g.name.trim() && g.values.some((v) => v.value.trim())
    );

    // Nếu không có nhóm hợp lệ, reset về SKU mặc định
    if (validGroups.length === 0) {
      setSkuVariants([
        {
          id: "default",
          sku_code: "",
          price: 0,
          quantity: 0,
          weight: 0,
          option_combinations: [],
        },
      ]);
      return;
    }

    // Hàm normalize để tạo key unique
    const normalizeForKey = (str: string): string => {
      return str.trim().toLowerCase().replace(/\s+/g, "-");
    };

    // Hàm sinh tổ hợp Cartesian Product (ĐÃ FIX)
    const generateCombinations = (): {
      option_name: string;
      value: string;
    }[][] => {
      // Lọc giá trị hợp lệ cho từng nhóm
      const validValuesByGroup = validGroups.map((group) => ({
        name: group.name,
        values: group.values.filter((v) => v.value.trim()),
      }));

      // Nếu có nhóm nào không có giá trị hợp lệ, return empty
      if (validValuesByGroup.some((g) => g.values.length === 0)) {
        return [];
      }

      // Cartesian product
      const cartesian = (arr: any[][]): any[][] => {
        return arr.reduce(
          (acc, curr) => {
            return acc.flatMap((a) => curr.map((c) => [...a, c]));
          },
          [[]] as any[][]
        );
      };

      const valuesArrays = validValuesByGroup.map((group) =>
        group.values.map((v) => ({
          option_name: group.name,
          value: v.value,
        }))
      );

      return cartesian(valuesArrays);
    };

    const combinations = generateCombinations();

    if (combinations.length === 0) {
      setSkuVariants([
        {
          id: "default",
          sku_code: "",
          price: 0,
          quantity: 0,
          weight: 0,
          option_combinations: [],
        },
      ]);
      return;
    }

    // Map tổ hợp thành SKU, giữ lại data cũ nếu trùng
    const newSkuVariants: SkuVariant[] = combinations.map((combo, index) => {
      // Tạo comboId unique bằng cách normalize và thêm index
      const normalizedCombo = combo
        .map(
          (c) => `${normalizeForKey(c.option_name)}:${normalizeForKey(c.value)}`
        )
        .sort()
        .join("|");

      const comboId = `${normalizedCombo}_${index}`;

      // Tìm SKU cũ có cùng combo (dùng normalized key để so sánh)
      const existingSku = skuVariants.find((s) => {
        const existingNormalized = s.option_combinations
          .map(
            (c) =>
              `${normalizeForKey(c.option_name)}:${normalizeForKey(c.value)}`
          )
          .sort()
          .join("|");
        return existingNormalized === normalizedCombo;
      });

      return {
        id: comboId,
        sku_code: existingSku?.sku_code || "",
        price: existingSku?.price || 0,
        quantity: existingSku?.quantity || 0,
        weight: existingSku?.weight || 0,
        option_combinations: combo,
      };
    });

    setSkuVariants(newSkuVariants);
  }, [optionGroups]);

  const updateSkuField = (
    index: number,
    field: keyof SkuVariant,
    value: any
  ) => {
    const newSkus = [...skuVariants];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setSkuVariants(newSkus);
  };

  // ============= BULK APPLY (FIXED) =============
  const applyBulkInfo = () => {
    const price = parseFloat(bulkPrice);
    const stock = parseInt(bulkStock);
    const weight = parseFloat(bulkWeight);

    if (isNaN(price) && isNaN(stock) && isNaN(weight)) {
      toast.error("Vui lòng nhập ít nhất một giá trị");
      return;
    }

    const newSkus = skuVariants.map((s) => ({
      ...s,
      price: !isNaN(price) && price > 0 ? price : s.price,
      quantity: !isNaN(stock) && stock >= 0 ? stock : s.quantity,
      weight: !isNaN(weight) && weight > 0 ? weight : s.weight,
    }));

    setSkuVariants(newSkus);
    toast.success("Áp dụng thành công", {
      description: `Đã cập nhật ${skuVariants.length} phân loại`,
    });
  };

  // ============= SUBMIT HANDLER =============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId) {
      toast.error("Lỗi hệ thống", {
        description: "Không tìm thấy Shop ID. Vui lòng đăng nhập lại.",
      });
      return;
    }

    if (!imageFile) {
      toast.error("Thiếu ảnh đại diện", {
        description: "Vui lòng chọn ảnh bìa cho sản phẩm",
      });
      return;
    }

    // Validate SKU
    const invalidSku = skuVariants.find((s) => s.price <= 0 || s.quantity < 0);
    if (invalidSku) {
      toast.error("Thông tin SKU không hợp lệ", {
        description: "Giá phải > 0 và số lượng phải ≥ 0",
      });
      return;
    }

    // Chuẩn bị option values và images
    const finalOptionValues: { option_name: string; value: string }[] = [];
    const optionValueImages: File[] = [];

    optionGroups.forEach((group) => {
      group.values.forEach((val) => {
        if (val.value.trim()) {
          finalOptionValues.push({
            option_name: group.name,
            value: val.value,
          });
          if (val.imageFile) {
            optionValueImages.push(val.imageFile);
          }
        }
      });
    });

    // Chuẩn bị payload
    const payload: CreateProductPayload = {
      ...formData,
      key:
        formData.key ||
        formData.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      shop_id: shopId,
      brand_id: "00362fbd-bb1c-4075-ad3c-765c560462de",
      product_sku: skuVariants.map((sku) => ({
        sku_code:
          sku.sku_code ||
          `${formData.name.substring(0, 3).toUpperCase()}-${Math.floor(
            Math.random() * 10000
          )}`,
        price: sku.price,
        quantity: sku.quantity,
        weight: sku.weight,
        option_value: sku.option_combinations,
      })),
      option_value: finalOptionValues,
    };

    createMutation.mutate({
      data: payload,
      files: {
        image: imageFile,
        media: mediaFiles,
        option_value_images: optionValueImages,
      },
    });
  };

  // ============= CLEANUP =============
  useEffect(() => {
    return () => {
      // Clean up all object URLs on unmount
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
      optionGroups.forEach((group) => {
        group.values.forEach((v) => {
          if (v.imagePreview) URL.revokeObjectURL(v.imagePreview);
        });
      });
    };
  }, []);

  return (
    <div className="min-h-full bg-linear-to-br from-orange-50 via-white to-orange-50/30 p-4 md:p-6">
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
          <div>
            <h1 className="text-3xl font-bold text-[#FF6A00]">
              Thêm sản phẩm mới
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Điền đầy đủ thông tin để tạo sản phẩm
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          id="create-product-form"
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
                    Slug / Key (Tùy chọn)
                  </Label>
                  <Input
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                    placeholder="Tự động sinh từ tên sản phẩm"
                    className="border-gray-300 focus:border-[#FF6A00]"
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
                Tải lên ảnh bìa và ảnh chi tiết (tối đa 8 ảnh phụ)
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
                      document.getElementById("main-image-input")?.click()
                    }
                    className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-linear-to-br from-orange-50 to-orange-100/50 hover:border-[#FF6A00] hover:bg-orange-100 transition-all"
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Cover"
                          className="h-full w-full rounded-xl object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white" />
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
                      id="main-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {/* Ảnh chi tiết */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-600">
                    Hình ảnh chi tiết ({mediaFiles.length}/8)
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {mediaPreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-32 w-full group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#FF6A00] transition-all"
                      >
                        <img
                          src={src}
                          alt={`Media ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {mediaFiles.length < 8 && (
                      <div
                        onClick={() =>
                          document.getElementById("media-input")?.click()
                        }
                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF6A00] hover:bg-gray-50 transition-all"
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">
                          Thêm ảnh
                        </span>
                        <input
                          id="media-input"
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

          {/* ============= 3. PHÂN LOẠI HÀNG ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#FF6A00]" />
                Phân loại hàng
              </CardTitle>
              <CardDescription>
                Thêm các biến thể sản phẩm (màu sắc, kích thước, v.v.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Danh sách nhóm phân loại */}
              <div className="space-y-4">
                {optionGroups.map((group, gIndex) => (
                  <div
                    key={group.id}
                    className="rounded-xl bg-linear-to-br from-gray-50 to-gray-100/50 p-5 relative border-2 border-gray-200 hover:border-orange-200 transition-all"
                  >
                    <div className="mb-4 flex gap-4">
                      <div className="w-1/3">
                        <Label className="text-sm font-semibold mb-2 block">
                          Nhóm phân loại {gIndex + 1}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="VD: Màu sắc, Size, Kiểu dáng"
                          value={group.name}
                          onChange={(e) =>
                            updateOptionGroupName(gIndex, e.target.value)
                          }
                          className="bg-white border-gray-300 focus:border-[#FF6A00]"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-semibold mb-2 block">
                          Giá trị phân loại{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {group.values.map((val, vIndex) => (
                            <div
                              key={val.id}
                              className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-32 h-9 text-sm"
                                  value={val.value}
                                  onChange={(e) =>
                                    updateOptionValue(
                                      gIndex,
                                      vIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="VD: Đỏ, XL"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOptionValue(gIndex, vIndex)
                                  }
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Ảnh cho option (chỉ nhóm đầu tiên) */}
                              {gIndex === 0 && (
                                <div className="relative">
                                  {val.imagePreview ? (
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-orange-300 group">
                                      <img
                                        src={val.imagePreview}
                                        className="h-full w-full object-cover"
                                        alt={val.value}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeOptionValueImage(gIndex, vIndex)
                                        }
                                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="relative h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#FF6A00] hover:bg-orange-50 transition-all">
                                      <ImagePlus className="h-6 w-6 text-gray-400" />
                                      <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleOptionValueImage(
                                            e,
                                            gIndex,
                                            vIndex
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOptionValue(gIndex)}
                            className="h-auto py-8 border-dashed border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOptionGroup(gIndex)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {optionGroups.length < 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOptionGroup}
                    className="w-full border-2 border-dashed border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 h-14 text-base"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Thêm nhóm phân loại mới
                  </Button>
                )}
              </div>

              {/* Bảng SKU */}
              {skuVariants.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Danh sách phân loại hàng
                      </h3>
                      <p className="text-sm text-gray-600">
                        {skuVariants.length} phân loại được tạo
                      </p>
                    </div>

                    {/* Bulk Edit */}
                    {skuVariants.length > 1 && (
                      <div className="flex gap-2 items-end bg-linear-to-r from-orange-50 to-orange-100 p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                        <div className="w-28">
                          <Label className="text-xs font-semibold mb-1 block">
                            Giá (₫)
                          </Label>
                          <Input
                            type="number"
                            value={bulkPrice}
                            onChange={(e) => setBulkPrice(e.target.value)}
                            className="h-9 text-sm bg-white border-orange-300"
                            placeholder="0"
                          />
                        </div>
                        <div className="w-28">
                          <Label className="text-xs font-semibold mb-1 block">
                            Kho hàng
                          </Label>
                          <Input
                            type="number"
                            value={bulkStock}
                            onChange={(e) => setBulkStock(e.target.value)}
                            className="h-9 text-sm bg-white border-orange-300"
                            placeholder="0"
                          />
                        </div>
                        <div className="w-28">
                          <Label className="text-xs font-semibold mb-1 block">
                            Cân nặng (kg)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={bulkWeight}
                            onChange={(e) => setBulkWeight(e.target.value)}
                            className="h-9 text-sm bg-white border-orange-300"
                            placeholder="0"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 bg-[#FF6A00] hover:bg-[#E65100] font-semibold"
                          onClick={applyBulkInfo}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Áp dụng
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-linear-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">
                        <tr>
                          <th className="p-4 text-left">Phân loại</th>
                          <th className="p-4 text-left">Mã SKU</th>
                          <th className="p-4 text-left">
                            Giá bán (₫) <span className="text-red-500">*</span>
                          </th>
                          <th className="p-4 text-left">
                            Kho hàng <span className="text-red-500">*</span>
                          </th>
                          <th className="p-4 text-left">
                            Cân nặng (kg){" "}
                            <span className="text-red-500">*</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {skuVariants.map((sku, index) => (
                          <tr
                            key={sku.id}
                            className="bg-white hover:bg-orange-50/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex gap-2">
                                {sku.option_combinations.length > 0 ? (
                                  sku.option_combinations.map((c, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                                    >
                                      {c.value}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm italic">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <Input
                                value={sku.sku_code}
                                onChange={(e) =>
                                  updateSkuField(
                                    index,
                                    "sku_code",
                                    e.target.value
                                  )
                                }
                                placeholder="Tự động"
                                className="h-9 border-gray-300"
                              />
                            </td>
                            <td className="p-4">
                              <Input
                                type="number"
                                value={sku.price || ""}
                                onChange={(e) =>
                                  updateSkuField(
                                    index,
                                    "price",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-9 border-orange-300 focus:border-[#FF6A00]"
                                min={0}
                                placeholder="0"
                              />
                            </td>
                            <td className="p-4">
                              <Input
                                type="number"
                                value={sku.quantity || ""}
                                onChange={(e) =>
                                  updateSkuField(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-9 border-orange-300 focus:border-[#FF6A00]"
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
                                  updateSkuField(
                                    index,
                                    "weight",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-9 border-gray-300"
                                min={0}
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ============= 4. CÀI ĐẶT KHÁC ============= */}
          <Card className="border-l-4 border-l-[#FF6A00] shadow-md">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent">
              <CardTitle>Cài đặt vận chuyển</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg">
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
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg">
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
          <div className="h-44"></div>
        </form>

        {/* Sticky footer outside form to prevent clipping */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-5 border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="mx-auto max-w-6xl flex justify-end gap-4">
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
              form="create-product-form"
              className="bg-linear-to-r from-[#FF6A00] to-[#FF8533] hover:from-[#E65100] hover:to-[#FF6A00] px-10 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Lưu & Hiển thị
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
