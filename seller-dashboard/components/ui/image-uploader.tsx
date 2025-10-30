"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<number | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    setUploading(index);
    try {
      const imageUrl = await uploadToCloudinary(file);
      const newImages = [...images];
      newImages[index] = imageUrl;
      onChange(newImages);
      toast.success("Upload ảnh thành công");
    } catch (error) {
      toast.error("Upload ảnh thất bại");
    } finally {
      setUploading(null);
    }
  };

  const addImageField = () => {
    if (images.length < maxImages) {
      onChange([...images, ""]);
    } else {
      toast.error(`Chỉ được upload tối đa ${maxImages} ảnh`);
    }
  };

  const removeImage = (index: number) => {
    if (images.length > 1) {
      onChange(images.filter((_, i) => i !== index));
    } else {
      toast.error("Phải có ít nhất 1 hình ảnh");
    }
  };

  return (
    <div className="space-y-3">
      {images.map((image, index) => (
        <div key={index} className="space-y-2">
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, index)}
                  disabled={uploading === index}
                  className="hidden"
                  id={`file-upload-${index}`}
                />
                <label
                  htmlFor={`file-upload-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    {uploading === index ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>
                          {image ? "Thay đổi ảnh" : "Chọn ảnh từ máy"}
                        </span>
                      </>
                    )}
                  </div>
                </label>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  disabled={images.length === 1 || uploading === index}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {image && (
                <div className="mt-2 relative h-32 w-32 overflow-hidden rounded border">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addImageField}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Thêm ảnh khác
        </Button>
      )}
    </div>
  );
}
