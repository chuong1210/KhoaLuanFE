"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { policyService } from "@/features/policy/services/policy-service";
import {
  Policy,
  POLICY_TYPES,
  PolicyType,
} from "@/features/policy/types/policy";

// UI imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Import Quill dynamically để tránh lỗi SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface PolicyFormProps {
  initialData?: Policy;
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
  defaultType?: string;
}

export function PolicyForm({
  initialData,
  isSubmitting,
  onSubmit,
  defaultType,
}: PolicyFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    policyName: "",
    policyType: (defaultType as PolicyType) || "TERMS",
    policyContent: "",
    effectiveDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        policyName: initialData.policyName,
        policyType: initialData.policyType,
        policyContent: initialData.policyContent,
        effectiveDate: initialData.effectiveDate
          ? initialData.effectiveDate.split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Quill Modules Configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode
              ? `Chỉnh sửa: ${initialData?.policyName}`
              : "Soạn thảo Chính sách Mới"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditMode ? "Cập nhật" : "Lưu Nháp"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên chính sách <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.policyName}
                  onChange={(e) => handleChange("policyName", e.target.value)}
                  placeholder="VD: Điều khoản sử dụng 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại chính sách <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(val) => handleChange("policyType", val)}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Ngày hiệu lực dự kiến</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) =>
                    handleChange("effectiveDate", e.target.value)
                  }
                />
                <p className="text-xs text-slate-500">
                  Có thể để trống và cập nhật khi xuất bản.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col min-h-[600px]">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-base">Nội dung chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <ReactQuill
                theme="snow"
                value={formData.policyContent}
                onChange={(content) => handleChange("policyContent", content)}
                modules={modules}
                placeholder="Soạn thảo nội dung chính sách tại đây..."
                className="flex-1 flex flex-col h-full"
                // Tùy chỉnh CSS cho Quill để nó full height
                style={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
