"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import { useAppSelector } from "@/store/hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Upload, FileSpreadsheet, Check, X, Info, ImageUp, AlertCircle } from "lucide-react";
import type { CreateProductPayload } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { downloadProductImportTemplate } from "@/lib/utils/excel-template-generator";

// Định nghĩa cấu trúc cột trong file Excel
interface ExcelRow {
    "Tên sản phẩm": string;
    "Mô tả ngắn": string;
    "Mô tả chi tiết": string;
    "Danh mục ID": string;
    "Ảnh đại diện (URL/Path)": string;
    "Ảnh phụ (URL/Path, cách nhau bởi dấu phẩy)": string;
    "SKU Code": string;
    "Giá": number;
    "Kho": number;
    "Cân nặng": number;
    "Phân loại 1: Tên": string;
    "Phân loại 1: Giá trị": string;
    "Phân loại 2: Tên": string;
    "Phân loại 2: Giá trị": string;
}

// Map dữ liệu từ Excel Row sang payload với tên ảnh đã upload
const mapRowToPayload = (
    row: ExcelRow,
    shopId: string,
    uploadedImageName: string,
    uploadedMediaNames: string[]
): CreateProductPayload => {
    const optionValues = [];
    if (row["Phân loại 1: Tên"] && row["Phân loại 1: Giá trị"]) {
        optionValues.push({ option_name: row["Phân loại 1: Tên"], value: row["Phân loại 1: Giá trị"] });
    }
    if (row["Phân loại 2: Tên"] && row["Phân loại 2: Giá trị"]) {
        optionValues.push({ option_name: row["Phân loại 2: Tên"], value: row["Phân loại 2: Giá trị"] });
    }

    return {
        name: row["Tên sản phẩm"],
        key: row["Tên sản phẩm"].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
        description: row["Mô tả chi tiết"],
        short_description: row["Mô tả ngắn"],
        category_id: row["Danh mục ID"],
        shop_id: shopId,
        product_is_permission_return: true,
        product_is_permission_check: true,
        // Tên ảnh đã được upload lên server media
        image: uploadedImageName,
        media: uploadedMediaNames,
        product_sku: [
            {
                sku_code: row["SKU Code"] || `SKU-${Date.now()}`,
                price: Number(row["Giá"]) || 0,
                quantity: Number(row["Kho"]) || 0,
                weight: Number(row["Cân nặng"]) || 0,
                option_value: optionValues,
            },
        ],
        option_value: optionValues,
    };
};

// Extract filename from local path (c:\admin\anh.png -> anh.png)
const extractFileName = (path: string): string => {
    if (!path) return "";
    // Handle both Windows and Unix paths
    return path.split(/[\\/]/).pop() || path;
};

export function ImportProductDialog() {
    const queryClient = useQueryClient();
    const shopId = useAppSelector((state) => state.shop.data?.id);

    const [isOpen, setIsOpen] = useState(false);
    const [excelData, setExcelData] = useState<ExcelRow[]>([]);
    // State để lưu các file ảnh người dùng tải lên, key là tên file gốc
    const [imageFilesMap, setImageFilesMap] = useState<Record<string, File>>({});

    const [isUploading, setIsUploading] = useState(false);
    const [importingIndex, setImportingIndex] = useState<number | null>(null);
    const [importStatus, setImportStatus] = useState<Record<number, "success" | "error" | "pending">>({});

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json<ExcelRow>(ws);
            setExcelData(data);
            // Initialize status
            const initialStatus: Record<number, "pending"> = {};
            data.forEach((_, i) => { initialStatus[i] = "pending"; });
            setImportStatus(initialStatus);
            toast.info(`Đã đọc ${data.length} sản phẩm từ file Excel. Vui lòng tải lên các file ảnh.`);
        };
        reader.readAsBinaryString(file);
    };

    // Xử lý khi người dùng chọn các file ảnh
    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFileMap: Record<string, File> = {};
        files.forEach(file => {
            // Key là tên file gốc (VD: "anh.png")
            newFileMap[file.name] = file;
        });
        setImageFilesMap(prev => ({ ...prev, ...newFileMap }));
        toast.success(`Đã tải lên ${files.length} file ảnh.`);
    };

    const handleImport = async () => {
        if (!shopId) {
            toast.error("Không tìm thấy Shop ID");
            return;
        }

        setIsUploading(true);
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < excelData.length; i++) {
            setImportingIndex(i);
            const row = excelData[i];

            try {
                // 1. Extract file names from paths
                const mainImageFileName = extractFileName(row["Ảnh đại diện (URL/Path)"]);
                const mediaImageFileNames = (row["Ảnh phụ (URL/Path, cách nhau bởi dấu phẩy)"] || "")
                    .split(',')
                    .map(path => extractFileName(path.trim()))
                    .filter(name => name);

                // 2. Find corresponding File objects
                const mainImageFile = imageFilesMap[mainImageFileName];
                if (!mainImageFile) {
                    throw new Error(`Không tìm thấy file ảnh đại diện "${mainImageFileName}". Vui lòng upload file này.`);
                }

                const mediaImageFiles = mediaImageFileNames
                    .map(name => imageFilesMap[name])
                    .filter(Boolean) as File[];

                // 3. Upload images to media server first
                // Upload main image
                const uploadedMainImageName = await productService.uploadMedia(mainImageFile);

                // Upload media images (batch)
                let uploadedMediaNames: string[] = [];
                if (mediaImageFiles.length > 0) {
                    uploadedMediaNames = await productService.uploadMediaBatch(mediaImageFiles);
                }

                // 4. Create product payload with uploaded image names
                const payload = mapRowToPayload(row, shopId, uploadedMainImageName, uploadedMediaNames);

                // 5. Create product using payload (without files since images are already uploaded)
                // We need to use a different endpoint or modify the existing one
                // For now, let's use the createProduct with files
                await productService.createProduct(payload, {
                    image: mainImageFile,
                    media: mediaImageFiles,
                });

                successCount++;
                setImportStatus(prev => ({ ...prev, [i]: "success" }));
            } catch (error: any) {
                console.error(`Lỗi dòng ${i + 1}:`, error);
                errorCount++;
                setImportStatus(prev => ({ ...prev, [i]: "error" }));
                toast.error(`Lỗi dòng ${i + 1}: ${row["Tên sản phẩm"]}`, {
                    description: error.message,
                });
            }
        }

        // Reset state sau khi hoàn tất
        setIsUploading(false);
        setImportingIndex(null);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(`Import hoàn tất`, {
            description: `Thành công: ${successCount}, Lỗi: ${errorCount}`,
        });

        if (errorCount === 0) {
            setIsOpen(false);
            setExcelData([]);
            setImageFilesMap({});
            setImportStatus({});
        }
    };

    const updateCell = (index: number, key: keyof ExcelRow, value: string | number) => {
        const newData = [...excelData];
        (newData[index] as any)[key] = value;
        setExcelData(newData);
    };

    const renderImagePreview = (path: string) => {
        const fileName = extractFileName(path);
        if (!fileName) {
            return (
                <div className="h-10 w-10 bg-[#FFF0E0] rounded-lg flex items-center justify-center text-[#78716C] text-[10px] text-center">
                    Trống
                </div>
            );
        }

        const file = imageFilesMap[fileName];
        if (!file) {
            return (
                <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-200" title={`Chưa upload: ${fileName}`}>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
            );
        }

        return (
            <div className="group relative h-10 w-10">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded-lg border border-[#FFB38A]" />
            </div>
        );
    };

    // Count required images
    const getRequiredImages = () => {
        const required = new Set<string>();
        excelData.forEach(row => {
            const main = extractFileName(row["Ảnh đại diện (URL/Path)"]);
            if (main) required.add(main);

            const media = (row["Ảnh phụ (URL/Path, cách nhau bởi dấu phẩy)"] || "")
                .split(',')
                .map(p => extractFileName(p.trim()))
                .filter(n => n);
            media.forEach(m => required.add(m));
        });
        return required;
    };

    const requiredImages = excelData.length > 0 ? getRequiredImages() : new Set<string>();
    const uploadedCount = [...requiredImages].filter(name => imageFilesMap[name]).length;
    const missingCount = requiredImages.size - uploadedCount;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="text-white shadow-lg font-semibold px-6 py-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{ background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)" }}
                >
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#FF6A00]">Import Sản Phẩm Hàng Loạt</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden space-y-4">
                    {!excelData.length ? (
                        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-[#FFB38A] rounded-2xl bg-[#FFF0E0]/30">
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" id="excel-upload" />
                            <Label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center p-8 hover:opacity-80 transition-opacity">
                                <div className="p-4 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}>
                                    <Upload className="h-10 w-10 text-white" />
                                </div>
                                <span className="font-bold text-lg text-[#1C1917]">Bước 1: Tải lên file Excel</span>
                                <span className="text-sm text-[#78716C] mt-2">Hỗ trợ định dạng .xlsx, .xls</span>
                            </Label>
                            <Button variant="link" onClick={downloadProductImportTemplate} className="text-[#FF6A00] font-semibold">
                                Tải file mẫu Excel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full space-y-4">
                            {/* Step 2: Upload images */}
                            <div className="p-4 bg-[#FFF0E0] border border-[#FFB38A]/30 rounded-xl flex gap-3 items-start">
                                <Info className="h-5 w-5 text-[#FF6A00] mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#E65100]">Bước 2: Tải lên file ảnh</h4>
                                    <p className="text-sm text-[#78716C] mt-1">
                                        Chọn tất cả file ảnh được liệt kê trong Excel. Hệ thống sẽ tự động khớp tên file.
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <input type="file" multiple accept="image/*" onChange={handleImageSelection} id="image-upload" className="hidden" />
                                        <Button asChild className="text-white" style={{ background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)" }}>
                                            <Label htmlFor="image-upload" className="cursor-pointer">
                                                <ImageUp className="mr-2 h-4 w-4" /> Chọn file ảnh
                                            </Label>
                                        </Button>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant={missingCount === 0 ? "success" : "warning"}>
                                                {uploadedCount}/{requiredImages.size} ảnh
                                            </Badge>
                                            {missingCount > 0 && (
                                                <span className="text-red-500 font-medium">Còn thiếu {missingCount} ảnh</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data table */}
                            <div className="flex-1 overflow-hidden border border-[#FFB38A]/30 rounded-xl">
                                <ScrollArea className="h-[350px]">
                                    <Table>
                                        <TableHeader className="bg-[#FFF0E0] sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="w-[60px] text-[#E65100]">Ảnh</TableHead>
                                                <TableHead className="min-w-[200px] text-[#E65100]">Tên sản phẩm</TableHead>
                                                <TableHead className="min-w-[120px] text-[#E65100]">Danh mục ID</TableHead>
                                                <TableHead className="min-w-[100px] text-[#E65100]">SKU</TableHead>
                                                <TableHead className="min-w-[100px] text-[#E65100]">Giá</TableHead>
                                                <TableHead className="min-w-[80px] text-[#E65100]">Kho</TableHead>
                                                <TableHead className="min-w-[150px] text-[#E65100]">Phân loại</TableHead>
                                                <TableHead className="w-[60px] text-[#E65100]">TT</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {excelData.map((row, index) => (
                                                <TableRow
                                                    key={index}
                                                    className={
                                                        importingIndex === index
                                                            ? "bg-blue-50"
                                                            : importStatus[index] === "success"
                                                                ? "bg-green-50"
                                                                : importStatus[index] === "error"
                                                                    ? "bg-red-50"
                                                                    : ""
                                                    }
                                                >
                                                    <TableCell className="p-2">{renderImagePreview(row["Ảnh đại diện (URL/Path)"])}</TableCell>
                                                    <TableCell className="p-2">
                                                        <Input
                                                            value={row["Tên sản phẩm"]}
                                                            onChange={(e) => updateCell(index, "Tên sản phẩm", e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <Input
                                                            value={row["Danh mục ID"]}
                                                            onChange={(e) => updateCell(index, "Danh mục ID", e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <Input
                                                            value={row["SKU Code"]}
                                                            onChange={(e) => updateCell(index, "SKU Code", e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <Input
                                                            type="number"
                                                            value={row["Giá"]}
                                                            onChange={(e) => updateCell(index, "Giá", Number(e.target.value))}
                                                            className="h-8 text-sm"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <Input
                                                            type="number"
                                                            value={row["Kho"]}
                                                            onChange={(e) => updateCell(index, "Kho", Number(e.target.value))}
                                                            className="h-8 text-sm"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {row["Phân loại 1: Giá trị"] && (
                                                                <Badge variant="secondary" className="text-xs">{row["Phân loại 1: Giá trị"]}</Badge>
                                                            )}
                                                            {row["Phân loại 2: Giá trị"] && (
                                                                <Badge variant="secondary" className="text-xs">{row["Phân loại 2: Giá trị"]}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="p-2 text-center">
                                                        {importingIndex === index ? (
                                                            <Loader2 className="h-5 w-5 animate-spin text-[#FF6A00] mx-auto" />
                                                        ) : importStatus[index] === "success" ? (
                                                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                        ) : importStatus[index] === "error" ? (
                                                            <X className="h-5 w-5 text-red-500 mx-auto" />
                                                        ) : (
                                                            <div className="h-5 w-5 rounded-full border-2 border-[#FFB38A]/50 mx-auto" />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false);
                            setExcelData([]);
                            setImageFilesMap({});
                            setImportStatus({});
                        }}
                        disabled={isUploading}
                    >
                        Đóng
                    </Button>
                    {excelData.length > 0 && (
                        <Button
                            onClick={handleImport}
                            disabled={isUploading || missingCount > 0}
                            className="text-white min-w-[200px]"
                            style={{
                                background: isUploading || missingCount > 0
                                    ? "#ccc"
                                    : "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)"
                            }}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý {importingIndex !== null ? `${importingIndex + 1}/${excelData.length}` : ""}
                                </>
                            ) : missingCount > 0 ? (
                                `Còn thiếu ${missingCount} ảnh`
                            ) : (
                                `Bắt đầu Import (${excelData.length} sản phẩm)`
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
