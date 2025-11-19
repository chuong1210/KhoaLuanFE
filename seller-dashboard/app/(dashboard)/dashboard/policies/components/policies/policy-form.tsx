"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Policy, POLICY_TYPES, PolicyType } from "@/types/policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Save, ArrowLeft, FileText, Calendar, Tag, Eye, PenTool, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface cho props
interface PolicyFormProps {
    initialData?: Policy; // Có dữ liệu -> Edit Mode, Không có -> Create Mode
    isSubmitting: boolean;
    onSubmit: (data: any) => void;
    defaultType?: string; // Dùng khi bấm "Tạo phiên bản mới" từ list
}

export function PolicyForm({ initialData, isSubmitting, onSubmit, defaultType }: PolicyFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    // Form State
    const [formData, setFormData] = useState({
        policyName: "",
        policyType: (defaultType as PolicyType) || "TERMS",
        policyContent: "",
        effectiveDate: "",
        shopId: "", // Mặc định rỗng (System policy) hoặc lấy từ Context nếu là Seller
    });

    // Load data khi edit
    useEffect(() => {
        if (initialData) {
            setFormData({
                policyName: initialData.policyName,
                policyType: initialData.policyType,
                policyContent: initialData.policyContent,
                effectiveDate: initialData.effectiveDate ? initialData.effectiveDate.split('T')[0] : "",
                shopId: initialData.shopId || "",
            });
        }
    }, [initialData]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Helper render màu badge loại policy
    const getTypeColor = (type: string) =>
        POLICY_TYPES.find(t => t.value === type)?.color.replace("bg-", "text-") || "text-gray-600";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-10">

            {/* --- Action Header --- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-orange-50 text-[#E65100]"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#E65100]">
                            {isEditMode ? "Chỉnh sửa Chính sách" : "Tạo Chính sách Mới"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditMode
                                ? `Cập nhật thông tin cho phiên bản v${initialData?.version}`
                                : "Thiết lập phiên bản nháp đầu tiên"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-[#FFB38A] text-[#E65100] hover:bg-[#FFF0E0]"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="shadow-lg hover:shadow-xl transition-all text-white min-w-[140px]"
                        style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Đang lưu...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {isEditMode ? "Cập nhật" : "Lưu bản nháp"}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Meta Data */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-2 shadow-md" style={{ borderColor: "#FFB38A" }}>
                        <CardHeader className="bg-[#FFF0E0] border-b border-[#FFB38A] pb-4">
                            <CardTitle className="text-[#E65100] flex items-center gap-2 text-lg">
                                <Tag className="h-5 w-5" />
                                Thông tin chung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">

                            {/* Policy Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-semibold">
                                    Tên chính sách <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="VD: Chính sách đổi trả 2024"
                                    value={formData.policyName}
                                    onChange={(e) => handleChange("policyName", e.target.value)}
                                    required
                                    className="border-[#FFB38A] focus-visible:ring-[#FF6A00] h-11"
                                />
                            </div>

                            {/* Policy Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-gray-700 font-semibold">
                                    Loại chính sách <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.policyType}
                                    onValueChange={(val) => handleChange("policyType", val)}
                                    disabled={isEditMode} // Không cho sửa loại khi đang edit
                                >
                                    <SelectTrigger className="h-11 border-[#FFB38A] focus:ring-[#FF6A00]">
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
                                {isEditMode && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Loại chính sách không thể thay đổi sau khi tạo.
                                    </p>
                                )}
                            </div>

                            {/* Effective Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-gray-700 font-semibold">
                                    Ngày dự kiến hiệu lực
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => handleChange("effectiveDate", e.target.value)}
                                        className="pl-10 border-[#FFB38A] focus-visible:ring-[#FF6A00] h-11"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Bạn có thể để trống và thiết lập lại khi Xuất bản.
                                </p>
                            </div>

                            {/* Status Badge (Visual only) */}
                            <div className="pt-2">
                                <Label className="text-gray-700 font-semibold mb-2 block">Trạng thái hiện tại</Label>
                                {initialData?.isActive ? (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm">
                                        Đang hoạt động
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 px-3 py-1 text-sm">
                                        Bản nháp (Draft)
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Content Editor */}
                <div className="lg:col-span-2">
                    <Card className="border-2 shadow-md h-full flex flex-col" style={{ borderColor: "#FFB38A" }}>
                        <CardHeader className="bg-[#FFF0E0] border-b border-[#FFB38A] py-3 px-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[#E65100] flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Nội dung chính sách
                                </CardTitle>
                                {/* Badge hiển thị loại đang chọn ở header editor */}
                                <Badge variant="outline" className={`border-0 bg-white ${getTypeColor(formData.policyType)}`}>
                                    {POLICY_TYPES.find(t => t.value === formData.policyType)?.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 flex-1">
                            <Tabs defaultValue="write" className="w-full h-full flex flex-col">
                                <div className="px-6 pt-4 border-b border-gray-100 bg-white">
                                    <TabsList className="grid w-[300px] grid-cols-2 bg-orange-50">
                                        <TabsTrigger
                                            value="write"
                                            className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white"
                                        >
                                            <PenTool className="h-4 w-4 mr-2" /> Soạn thảo
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="preview"
                                            className="data-[state=active]:bg-[#FF8A33] data-[state=active]:text-white"
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> Xem trước
                                        </TabsTrigger>
                                    </TabsList>
                                    <p className="text-xs text-gray-400 mt-2 mb-2">
                                        Hỗ trợ định dạng <b>HTML</b> cơ bản hoặc văn bản thuần.
                                    </p>
                                </div>

                                {/* Tab Write */}
                                <TabsContent value="write" className="flex-1 p-0 m-0 h-full min-h-[500px]">
                                    <Textarea
                                        placeholder="Nhập nội dung chính sách tại đây..."
                                        className="w-full h-full min-h-[500px] resize-none border-0 rounded-none p-6 focus-visible:ring-0 text-base leading-relaxed"
                                        value={formData.policyContent}
                                        onChange={(e) => handleChange("policyContent", e.target.value)}
                                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                                    />
                                </TabsContent>

                                {/* Tab Preview */}
                                <TabsContent value="preview" className="flex-1 p-6 m-0 h-full min-h-[500px] bg-gray-50/50 overflow-auto">
                                    {formData.policyContent ? (
                                        <div
                                            className="prose max-w-none p-6 bg-white shadow-sm rounded-lg border border-gray-200"
                                            // Lưu ý: Trong thực tế nên dùng DOMPurify để sanitize HTML
                                            dangerouslySetInnerHTML={{ __html: formData.policyContent.replace(/\n/g, '<br/>') }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                            <Eye className="h-12 w-12 mb-2 opacity-50" />
                                            <p>Chưa có nội dung để xem trước</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>

                        <CardFooter className="bg-gray-50 border-t border-gray-100 text-xs text-gray-500 py-2 px-6">
                            Ký tự: {formData.policyContent.length}
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </form>
    );
}