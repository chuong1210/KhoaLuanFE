"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import type { CreateProductPayload } from "@/types/product";

// Helper types cho local state
interface OptionValueInput {
  id: string; // temp id for UI
  value: string;
  imageFile?: File | null; // Ảnh local của option value (VD: Ảnh màu đỏ)
  imagePreview?: string;
}

interface OptionGroup {
  id: string;
  name: string; // VD: Màu sắc
  values: OptionValueInput[]; // VD: [Đỏ, Xanh]
}

interface SkuVariant {
  id: string;
  sku_code: string;
  price: number;
  quantity: number;
  weight: number;
  option_combinations: { option_name: string; value: string }[]; // Để hiển thị tên (VD: Màu: Đỏ, Size: S)
}

export default function CreateProductPage() {
  const router = useRouter();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // --- 1. BASIC INFO STATE ---
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    short_description: "",
    category_id: "",
    product_is_permission_return: true,
    product_is_permission_check: true,
  });

  // --- 2. MEDIA STATE ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  // --- 3. VARIANTS / OPTIONS STATE ---
  // Danh sách nhóm phân loại (VD: Nhóm Màu sắc, Nhóm Size)
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);

  // Danh sách SKU được sinh ra từ các nhóm phân loại
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

  // --- QUERIES ---
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  // --- MUTATION ---
  const createMutation = useMutation({
    mutationFn: (payload: {
      data: CreateProductPayload;
      files: { image: File; media?: File[]; option_value_images?: File[] };
    }) => productService.createProduct(payload.data, payload.files),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công!");
      router.push("/dashboard/products");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Tạo sản phẩm thất bại", {
        description: error.message || "Vui lòng kiểm tra lại thông tin",
      });
    },
  });

  // --- LOGIC XỬ LÝ MEDIA ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        setMediaPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- LOGIC XỬ LÝ OPTIONS (PHÂN LOẠI) ---
  const addOptionGroup = () => {
    if (optionGroups.length >= 2) {
      toast.error("Chỉ hỗ trợ tối đa 2 nhóm phân loại (VD: Màu sắc, Size)");
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
    const newGroups = [...optionGroups];
    newGroups.splice(index, 1);
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
    newGroups[groupIndex].values.splice(valueIndex, 1);
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

  // Xử lý ảnh cho từng option value (chỉ hỗ trợ nhóm đầu tiên, thường là Màu sắc)
  const handleOptionValueImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    groupIndex: number,
    valueIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newGroups = [...optionGroups];
      newGroups[groupIndex].values[valueIndex].imageFile = file;
      newGroups[groupIndex].values[valueIndex].imagePreview = URL.createObjectURL(file);
      setOptionGroups(newGroups);
    }
  };

  // --- LOGIC SINH SKU TỰ ĐỘNG (CARTESIAN PRODUCT) ---
  useEffect(() => {
    // Nếu không có option group nào hợp lệ, reset về 1 SKU mặc định
    if (
      optionGroups.length === 0 ||
      optionGroups.every((g) => !g.name || g.values.length === 0)
    ) {
      if (skuVariants.length !== 1 || skuVariants[0].option_combinations.length > 0) {
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
      }
      return;
    }

    // Hàm đệ quy để tạo tổ hợp
    const generateCombinations = (
      groupIndex: number,
      currentCombination: { option_name: string; value: string }[]
    ): { option_name: string; value: string }[][] => {
      if (groupIndex === optionGroups.length) {
        return [currentCombination];
      }

      const group = optionGroups[groupIndex];
      // Nếu group chưa có tên hoặc chưa có value nào có chữ, bỏ qua
      if (!group.name || group.values.filter((v) => v.value).length === 0) {
        return generateCombinations(groupIndex + 1, currentCombination);
      }

      let combinations: { option_name: string; value: string }[][] = [];
      group.values.forEach((valObj) => {
        if (valObj.value) {
          combinations = combinations.concat(
            generateCombinations(groupIndex + 1, [
              ...currentCombination,
              { option_name: group.name, value: valObj.value },
            ])
          );
        }
      });
      return combinations;
    };

    const combinations = generateCombinations(0, []);

    // Map tổ hợp thành danh sách SKU, giữ lại data cũ nếu trùng khớp
    const newSkuVariants: SkuVariant[] = combinations.map((combo) => {
      // Tạo ID đại diện cho combo này để check xem đã có chưa
      const comboId = combo.map((c) => `${c.option_name}:${c.value}`).join("|");

      // Tìm xem SKU cũ có cái nào khớp combo này không để giữ lại giá/kho
      const existingSku = skuVariants.find(
        (s) =>
          s.option_combinations.map((c) => `${c.option_name}:${c.value}`).join("|") ===
          comboId
      );

      return {
        id: comboId, // dùng làm key
        sku_code: existingSku?.sku_code || "",
        price: existingSku?.price || 0,
        quantity: existingSku?.quantity || 0,
        weight: existingSku?.weight || 0,
        option_combinations: combo,
      };
    });

    if (newSkuVariants.length > 0) {
      setSkuVariants(newSkuVariants);
    }
  }, [optionGroups]); // Chạy lại khi optionGroups thay đổi

  const updateSkuField = (
    index: number,
    field: keyof SkuVariant,
    value: any
  ) => {
    const newSkus = [...skuVariants];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setSkuVariants(newSkus);
  };

  // --- XỬ LÝ SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId) {
      toast.error("Lỗi: Không tìm thấy Shop ID. Vui lòng đăng nhập lại.");
      return;
    }

    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh đại diện sản phẩm.");
      return;
    }

    // Validate SKU
    for (const sku of skuVariants) {
      if (sku.price <= 0) {
        toast.error("Giá sản phẩm phải lớn hơn 0.");
        return;
      }
      if (sku.quantity < 0) {
        toast.error("Số lượng kho không hợp lệ.");
        return;
      }
    }

    // Chuẩn bị dữ liệu Option Value & Images
    // API yêu cầu:
    // 1. option_value: List tất cả option unique (Màu: Đỏ, Màu: Xanh, Size: S...)
    // 2. option_value_images: List file ảnh tương ứng

    const finalOptionValues: { option_name: string; value: string }[] = [];
    const optionValueImages: File[] = [];

    optionGroups.forEach(group => {
      group.values.forEach(val => {
        if (val.value) {
          finalOptionValues.push({
            option_name: group.name,
            value: val.value
          });
          // Nếu có ảnh thì push vào mảng file (Backend sẽ map theo thứ tự hoặc logic riêng,
          // nhưng ở đây ta cứ gửi lên, nếu backend cần logic map ID thì cần update thêm)
          if (val.imageFile) {
            optionValueImages.push(val.imageFile);
          }
        }
      })
    });

    // Chuẩn bị Payload JSON
    const payload: CreateProductPayload = {
      ...formData,
      key: formData.key || formData.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
      shop_id: shopId,
      brand_id: "00362fbd-bb1c-4075-ad3c-765c560462de", // Bỏ qua hoặc để rỗng theo yêu cầu
      // Map SKU variants sang format API
      product_sku: skuVariants.map(sku => ({
        sku_code: sku.sku_code || `${formData.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        price: sku.price,
        quantity: sku.quantity,
        weight: sku.weight,
        // option_value của từng SKU
        option_value: sku.option_combinations
      })),
      // Danh sách tổng hợp các option values
      option_value: finalOptionValues
    };

    // Gọi API
    createMutation.mutate({
      data: payload,
      files: {
        image: imageFile,
        media: mediaFiles,
        option_value_images: optionValueImages
      }
    });
  };

  // Áp dụng hàng loạt cho bảng SKU
  const applyBulkInfo = (price: number, stock: number, weight: number) => {
    const newSkus = skuVariants.map(s => ({
      ...s,
      price: price > 0 ? price : s.price,
      quantity: stock > 0 ? stock : s.quantity,
      weight: weight > 0 ? weight : s.weight
    }));
    setSkuVariants(newSkus);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#FF6A00]">Thêm sản phẩm mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. THÔNG TIN CƠ BẢN */}
          <Card className="border-t-4 border-t-[#FF6A00] shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm + thương hiệu + đặc tính..."
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Danh mục *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngành hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand ID Removed as requested */}
              </div>

              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <Textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Mô tả chi tiết *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. HÌNH ẢNH & VIDEO */}
          <Card className="border-t-4 border-t-[#FF6A00] shadow-sm">
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
              <CardDescription>Đăng tải 1 ảnh bìa và các ảnh chi tiết (tối đa 5)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-6">
                {/* Ảnh bìa */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Ảnh bìa *</Label>
                  <div
                    onClick={() => document.getElementById('main-image-input')?.click()}
                    className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#FF6A00]/50 bg-[#FFF0E0] hover:bg-[#FF6A00]/10"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Cover" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <div className="text-center text-[#FF6A00]">
                        <Upload className="mx-auto h-6 w-6" />
                        <span className="text-xs">Thêm ảnh</span>
                      </div>
                    )}
                    <input id="main-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="space-y-2 flex-1">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Hình ảnh chi tiết</Label>
                  <div className="flex flex-wrap gap-4">
                    {mediaPreviews.map((src, idx) => (
                      <div key={idx} className="relative h-32 w-32 group">
                        <img src={src} alt={`Media ${idx}`} className="h-full w-full rounded-lg object-cover border" />
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow-md group-hover:block"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {mediaPreviews.length < 5 && (
                      <div
                        onClick={() => document.getElementById('media-input')?.click()}
                        className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF6A00] hover:bg-gray-50"
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500">Thêm ({mediaFiles.length}/5)</span>
                        <input id="media-input" type="file" multiple accept="image/*" className="hidden" onChange={handleMediaChange} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. PHÂN LOẠI HÀNG (VARIANTS) */}
          <Card className="border-t-4 border-t-[#FF6A00] shadow-sm">
            <CardHeader>
              <CardTitle>Phân loại hàng</CardTitle>
              <CardDescription>Thêm biến thể nếu sản phẩm có nhiều lựa chọn (VD: Màu sắc, Kích thước)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Danh sách nhóm phân loại */}
              <div className="space-y-4">
                {optionGroups.map((group, gIndex) => (
                  <div key={group.id} className="rounded-lg bg-gray-50 p-4 relative border">
                    <div className="mb-3 flex gap-4">
                      <div className="w-1/3">
                        <Label>Tên nhóm phân loại {gIndex + 1}</Label>
                        <Input
                          placeholder="VD: Màu sắc, Size"
                          value={group.name}
                          onChange={(e) => updateOptionGroupName(gIndex, e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Giá trị phân loại (Nhấn Enter để thêm)</Label>
                        <div className="mt-1 flex flex-wrap gap-3">
                          {group.values.map((val, vIndex) => (
                            <div key={val.id} className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  className="w-32 bg-white"
                                  value={val.value}
                                  onChange={(e) => updateOptionValue(gIndex, vIndex, e.target.value)}
                                  placeholder="VD: Đỏ"
                                />
                                <button type="button" onClick={() => removeOptionValue(gIndex, vIndex)} className="text-gray-400 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Chỉ cho phép upload ảnh ở nhóm phân loại đầu tiên (VD: Màu sắc) */}
                              {gIndex === 0 && (
                                <div className="relative h-16 w-16 border-dashed border-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                  {val.imagePreview ? (
                                    <img src={val.imagePreview} className="h-full w-full object-cover rounded" />
                                  ) : (
                                    <ImagePlus className="h-5 w-5 text-gray-400" />
                                  )}
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleOptionValueImage(e, gIndex, vIndex)} />
                                </div>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => addOptionValue(gIndex)} className="h-10 border-dashed">
                            <Plus className="mr-1 h-3 w-3" /> Thêm
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOptionGroup(gIndex)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {optionGroups.length < 2 && (
                  <Button type="button" variant="outline" onClick={addOptionGroup} className="border-dashed border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00]/10">
                    <Plus className="mr-2 h-4 w-4" /> Thêm nhóm phân loại
                  </Button>
                )}
              </div>

              {/* Bảng chi tiết SKU */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Danh sách phân loại hàng</h3>
                  {/* Bulk Edit Tool */}
                  {skuVariants.length > 1 && (
                    <div className="flex gap-2 items-end bg-orange-50 p-2 rounded border border-orange-100">
                      <div className="w-24">
                        <Label className="text-xs">Giá</Label>
                        <Input id="bulk-price" type="number" className="h-8 text-xs bg-white" placeholder="0" />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Kho</Label>
                        <Input id="bulk-stock" type="number" className="h-8 text-xs bg-white" placeholder="0" />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Nặng(kg)</Label>
                        <Input id="bulk-weight" type="number" className="h-8 text-xs bg-white" placeholder="0" />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 bg-[#FF6A00]"
                        onClick={() => {
                          const p = parseFloat((document.getElementById('bulk-price') as HTMLInputElement).value);
                          const s = parseInt((document.getElementById('bulk-stock') as HTMLInputElement).value);
                          const w = parseFloat((document.getElementById('bulk-weight') as HTMLInputElement).value);
                          applyBulkInfo(p, s, w);
                        }}
                      >
                        Áp dụng
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-medium">
                      <tr>
                        <th className="p-3">Phân loại</th>
                        <th className="p-3">Mã SKU</th>
                        <th className="p-3">Giá bán (₫) *</th>
                        <th className="p-3">Kho hàng *</th>
                        <th className="p-3">Cân nặng (kg) *</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {skuVariants.map((sku, index) => (
                        <tr key={sku.id} className="bg-white hover:bg-gray-50">
                          <td className="p-3">
                            {sku.option_combinations.length > 0
                              ? sku.option_combinations.map(c => c.value).join(" - ")
                              : "Mặc định"
                            }
                          </td>
                          <td className="p-3">
                            <Input
                              value={sku.sku_code}
                              onChange={(e) => updateSkuField(index, "sku_code", e.target.value)}
                              placeholder="SKU tự động"
                              className="h-9"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={sku.price}
                              onChange={(e) => updateSkuField(index, "price", parseInt(e.target.value) || 0)}
                              className="h-9 border-[#FF6A00]/30 focus:border-[#FF6A00]"
                              min={0}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={sku.quantity}
                              onChange={(e) => updateSkuField(index, "quantity", parseInt(e.target.value) || 0)}
                              className="h-9 border-[#FF6A00]/30 focus:border-[#FF6A00]"
                              min={0}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              value={sku.weight}
                              onChange={(e) => updateSkuField(index, "weight", parseFloat(e.target.value) || 0)}
                              className="h-9"
                              min={0}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 4. VẬN CHUYỂN & CÀI ĐẶT KHÁC */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Vận chuyển & Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="return"
                    checked={formData.product_is_permission_return}
                    onCheckedChange={(c) => setFormData({ ...formData, product_is_permission_return: !!c })}
                  />
                  <Label htmlFor="return" className="font-normal">Cho phép đổi trả</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="check"
                    checked={formData.product_is_permission_check}
                    onCheckedChange={(c) => setFormData({ ...formData, product_is_permission_check: !!c })}
                  />
                  <Label htmlFor="check" className="font-normal">Cho phép kiểm tra hàng</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white/80 backdrop-blur p-4 border-t shadow-lg z-10">
            <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
            <Button
              type="submit"
              className="bg-[#FF6A00] hover:bg-[#E65100] px-8"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu & Hiển thị
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}