"use client";

import { useState, useEffect, use } from "react"; // Thêm 'use'
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Package, ArrowLeft, AlertCircle, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UpdateProductPayload } from "@/types/product";

// Định nghĩa Props cho Page
export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // Params là Promise trong Next.js 15
}) {
  // 1. Giải nén params bằng React.use()
  const { id } = use(params);

  const router = useRouter();
  const queryClient = useQueryClient();

  // --- STATE QUẢN LÝ DỮ LIỆU ---
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

  // --- STATE QUẢN LÝ ẢNH ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(""); // URL preview (local hoặc server)

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]); // URL preview cho media mới
  const [existingMedia, setExistingMedia] = useState<string[]>([]); // URL media cũ từ server

  // --- FETCH DATA ---
  const { data: productDetail, isLoading } = useQuery({
    queryKey: ["product", id], // Dùng id đã giải nén
    queryFn: () => productService.getProductDetail(id),
  });

  // --- POPULATE DATA ---
  useEffect(() => {
    if (productDetail) {
      // 1. Điền thông tin text
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

      // 2. Xử lý ảnh bìa cũ
      if (productDetail.product.image) {
        // Sử dụng helper getImageUrl nếu bạn đã thêm vào service, hoặc ghép chuỗi thủ công
        setImagePreview(productService.getImageUrl(productDetail.product.image));
      }

      // 3. Xử lý Media cũ (JSON string -> Array)
      if (productDetail.product.media) {
        try {
          const mediaArr = JSON.parse(productDetail.product.media);
          if (Array.isArray(mediaArr)) {
            setExistingMedia(mediaArr.map((m: string) => productService.getImageUrl(m)));
          }
        } catch (e) {
          console.error("Error parsing media JSON", e);
          setExistingMedia([]);
        }
      }
    }
  }, [productDetail]);

  // --- MUTATION UPDATE ---
  const updateMutation = useMutation({
    mutationFn: (payload: { data: UpdateProductPayload; files: any }) =>
      productService.updateProduct(id, payload.data, payload.files),
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công!");
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

  // --- HANDLERS ---

  // Đổi ảnh bìa
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Thêm media mới
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Xóa media mới upload (chưa lưu)
  const removeNewMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa media cũ (Logic này tùy thuộc API: Nếu API update media ghi đè toàn bộ thì dễ, nếu chỉ append thì khó xóa ảnh cũ qua API update này)
  // Tạm thời chỉ ẩn khỏi UI để user biết. Nếu API yêu cầu gửi danh sách ảnh cũ còn lại, cần update payload.
  // Với API Multipart hiện tại, thường nó sẽ update thêm ảnh mới. Việc xóa ảnh cũ có thể cần API riêng hoặc logic phức tạp hơn.
  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
    toast.info("Lưu ý: Ảnh cũ sẽ bị xóa khi lưu thay đổi (nếu backend hỗ trợ ghi đè)");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate SKUs
    for (const sku of formData.product_sku) {
      if (sku.price <= 0 || sku.quantity < 0) {
        toast.error("Giá và số lượng SKU không hợp lệ");
        return;
      }
    }

    updateMutation.mutate({
      data: formData,
      files: {
        image: imageFile || undefined, // Chỉ gửi nếu có file mới
        media: mediaFiles.length > 0 ? mediaFiles : undefined
      }
    });
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
      <div className="min-h-screen p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>Không tìm thấy sản phẩm.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF0E0] via-white to-[#FFB38A]/10 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 rounded-2xl p-6 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}>
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
          {/* 1. THÔNG TIN CƠ BẢN */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>

              <div className="space-y-2">
                <Label>Product Key (Slug) *</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                  required
                  className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. QUẢN LÝ HÌNH ẢNH (Mới thêm vào) */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Hình ảnh</CardTitle>
              <CardDescription>Cập nhật ảnh bìa và ảnh chi tiết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Ảnh bìa */}
              <div className="flex flex-col gap-2">
                <Label>Ảnh bìa</Label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-[#FF6A00]/30 bg-white">
                      <img src={imagePreview} alt="Main Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Chưa có ảnh</div>
                  )}
                  <div>
                    <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <Label htmlFor="edit-image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[#FF6A00]/50 bg-[#FFF0E0] px-4 py-2 text-sm font-medium text-[#FF6A00] hover:bg-[#FFB38A]/30">
                      <Upload className="h-4 w-4" /> {imageFile ? "Đổi ảnh khác" : "Tải ảnh mới"}
                    </Label>
                    <p className="mt-1 text-xs text-gray-500">Dung lượng &lt; 5MB</p>
                  </div>
                </div>
              </div>

              {/* Media Gallery */}
              <div className="flex flex-col gap-2">
                <Label>Ảnh chi tiết (Media)</Label>
                <div className="flex flex-wrap gap-4">
                  {/* Ảnh cũ từ server */}
                  {existingMedia.map((url, idx) => (
                    <div key={`old-${idx}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 group">
                      <img src={url} alt="Old Media" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs">Ảnh cũ</span>
                      </div>
                      {/* Nút xóa ảnh cũ (nếu cần) */}
                      <button type="button" onClick={() => removeExistingMedia(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Ảnh mới upload */}
                  {mediaPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-green-400 group">
                      <img src={url} alt="New Media" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-green-500/20 pointer-events-none"></div>
                      <button type="button" onClick={() => removeNewMedia(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Nút thêm */}
                  <div
                    onClick={() => document.getElementById('edit-media-upload')?.click()}
                    className="h-24 w-24 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF6A00] cursor-pointer hover:bg-orange-50"
                  >
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Thêm ảnh</span>
                    <Input id="edit-media-upload" type="file" multiple accept="image/*" onChange={handleMediaChange} className="hidden" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. CẬP NHẬT SKU */}
          <Card className="border-[#FF6A00]/20 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#FFF0E0] to-white border-b border-[#FF6A00]/10">
              <CardTitle className="text-[#FF6A00]">Biến thể & Giá bán</CardTitle>
              <CardDescription>Cập nhật kho và giá bán cho từng phân loại</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {formData.product_sku.map((sku, index) => {
                const originalSku = productDetail.sku[index];
                // Lấy tên Option Value để hiển thị (VD: Màu Đỏ, Size S)
                const skuName = originalSku?.sku_name || originalSku?.sku_code;

                return (
                  <Card key={sku.id} className="border-[#FFB38A]/30 bg-linear-to-br from-white to-[#FFF0E0]/30">
                    <CardContent className="space-y-4 pt-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-[#FF6A00] mb-1">SKU #{index + 1}</h4>
                        <p className="text-sm text-gray-700 font-medium">{skuName}</p>
                        <p className="text-xs text-gray-500">Mã: {originalSku.sku_code}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Giá (VNĐ) *</Label>
                          <Input
                            type="number"
                            value={sku.price}
                            onChange={(e) => updateSku(index, "price", parseInt(e.target.value) || 0)}
                            className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                            min={0}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tồn kho *</Label>
                          <Input
                            type="number"
                            value={sku.quantity}
                            onChange={(e) => updateSku(index, "quantity", parseInt(e.target.value) || 0)}
                            className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                            min={0}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Cân nặng (kg) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={sku.weight}
                            onChange={(e) => updateSku(index, "weight", parseFloat(e.target.value) || 0)}
                            className="border-[#FF6A00]/30 focus:border-[#FF6A00]"
                            min={0}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end sticky bottom-4 z-10">
            <Button type="button" variant="outline" onClick={() => router.back()} className="bg-white shadow-sm">Hủy</Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00] px-8 shadow-lg">
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}