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
import { Loader2, Upload, FileSpreadsheet, Check, X, Info, ImageUp } from "lucide-react";
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
    "Phân loại 1: Tên": string; // VD: Màu sắc
    "Phân loại 1: Giá trị": string; // VD: Đỏ
    "Phân loại 2: Tên": string; // VD: Size
    "Phân loại 2: Giá trị": string; // VD: XL
}

// Map dữ liệu từ Excel Row sang payload gửi API
const mapRowToPayload = (row: ExcelRow, shopId: string, image: string, media: string[]): CreateProductPayload => {
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
        // API Create Product không nhận ảnh dạng URL, mà nhận file multipart
        // Logic sẽ là upload trước, lấy tên file mới rồi gán vào đây, nhưng API create của bạn đã là multipart
        // Nên chúng ta sẽ gửi thẳng file vào API create

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

export function ImportProductDialog() {
    const queryClient = useQueryClient();
    const shopId = useAppSelector((state) => state.shop.data?.id);

    const [isOpen, setIsOpen] = useState(false);
    const [excelData, setExcelData] = useState<ExcelRow[]>([]);
    // State để lưu các file ảnh người dùng tải lên, key là tên file gốc
    const [imageFilesMap, setImageFilesMap] = useState<Record<string, File>>({});

    const [isUploading, setIsUploading] = useState(false);
    const [importingIndex, setImportingIndex] = useState<number | null>(null);

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
            toast.info("Đã đọc file Excel. Vui lòng tải lên các file ảnh tương ứng.");
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
                // Lấy tên file từ đường dẫn local (C:\... -> anh.png)
                const mainImageName = row["Ảnh đại diện (URL/Path)"].split(/[\\/]/).pop() || "";
                const mediaImageNames = (row["Ảnh phụ (URL/Path, cách nhau bởi dấu phẩy)"] || "")
                    .split(',')
                    .map(path => path.trim().split(/[\\/]/).pop() || "")
                    .filter(name => name);

                // Tìm File object tương ứng từ map
                const mainImageFile = imageFilesMap[mainImageName];
                if (!mainImageFile) {
                    throw new Error(`Không tìm thấy file ảnh đại diện "${mainImageName}"`);
                }

                const mediaImageFiles = mediaImageNames.map(name => imageFilesMap[name]).filter(Boolean) as File[];

                // Tạo payload JSON, không chứa thông tin ảnh
                const payload = mapRowToPayload(row, shopId, mainImageName, mediaImageNames);

                // Gọi API createProduct với JSON và các file ảnh đã tìm thấy
                await productService.createProduct(payload, {
                    image: mainImageFile,
                    media: mediaImageFiles,
                });

                successCount++;
            } catch (error: any) {
                console.error(`Lỗi dòng ${i + 1}:`, error);
                errorCount++;
                toast.error(`Lỗi dòng ${i + 1}: ${row["Tên sản phẩm"]}`, {
                    description: error.message,
                });
            }
        }

        // Reset state sau khi hoàn tất
        setIsUploading(false);
        setImportingIndex(null);
        setIsOpen(false);
        setExcelData([]);
        setImageFilesMap({});
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(`Import hoàn tất`, {
            description: `Thành công: ${successCount}, Lỗi: ${errorCount}`,
        });
    };

    const updateCell = (index: number, key: keyof ExcelRow, value: string | number) => {
        const newData = [...excelData];
        (newData[index] as any)[key] = value;
        setExcelData(newData);
    };

    const renderImagePreview = (path: string) => {
        const fileName = path ? path.split(/[\\/]/).pop() : null;
        if (!fileName || !imageFilesMap[fileName]) {
            return (
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs text-center p-1">
                    {fileName || "Trống"}
                </div>
            );
        }
        const file = imageFilesMap[fileName];
        return (
            <div className="group relative h-12 w-12">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded border" />
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Import Excel
                </Button>
            </DialogTrigger>
            {/* Tăng chiều rộng dialog */}
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#FF6A00]">Import Sản Phẩm Hàng Loạt</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden space-y-4">
                    {!excelData.length ? (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl bg-gray-50">
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" id="excel-upload" />
                            <Label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center p-8">
                                <Upload className="h-10 w-10 text-[#FF6A00] mb-3" />
                                <span className="font-semibold">Bước 1: Tải lên file Excel</span>
                            </Label>
                            <Button variant="link" onClick={downloadProductImportTemplate} className="text-[#FF6A00]">Tải file mẫu</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 items-start">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-800">Bước 2: Tải lên file ảnh</h4>
                                    <p className="text-sm text-blue-700">
                                        Vui lòng chọn tất cả các file ảnh được liệt kê trong file Excel. Hệ thống sẽ tự động khớp tên file.
                                    </p>
                                    <input type="file" multiple accept="image/*" onChange={handleImageSelection} id="image-upload" className="hidden" />
                                    <Button asChild size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600">
                                        <Label htmlFor="image-upload"><ImageUp className="mr-2 h-4 w-4" /> Chọn file ảnh</Label>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden border rounded-lg">
                                <ScrollArea className="h-full">
                                    <Table>
                                        <TableHeader className="bg-gray-100 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="w-[80px]">Ảnh</TableHead>
                                                <TableHead className="min-w-[250px]">Tên sản phẩm</TableHead>
                                                <TableHead className="min-w-[150px]">Danh mục ID</TableHead>
                                                <TableHead className="min-w-[150px]">SKU</TableHead>
                                                <TableHead className="min-w-[120px]">Giá</TableHead>
                                                <TableHead className="min-w-[100px]">Kho</TableHead>
                                                <TableHead className="min-w-[200px]">Phân loại</TableHead>
                                                <TableHead className="w-[80px]">Trạng thái</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {excelData.map((row, index) => (
                                                <TableRow key={index} className={importingIndex === index ? "bg-blue-50" : ""}>
                                                    <TableCell>{renderImagePreview(row["Ảnh đại diện (URL/Path)"])}</TableCell>
                                                    <TableCell>
                                                        <Input value={row["Tên sản phẩm"]} onChange={(e) => updateCell(index, "Tên sản phẩm", e.target.value)} className="h-9" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input value={row["Danh mục ID"]} onChange={(e) => updateCell(index, "Danh mục ID", e.target.value)} className="h-9" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input value={row["SKU Code"]} onChange={(e) => updateCell(index, "SKU Code", e.target.value)} className="h-9" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" value={row["Giá"]} onChange={(e) => updateCell(index, "Giá", Number(e.target.value))} className="h-9" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" value={row["Kho"]} onChange={(e) => updateCell(index, "Kho", Number(e.target.value))} className="h-9" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {row["Phân loại 1: Giá trị"] && <Badge variant="secondary">{row["Phân loại 1: Giá trị"]}</Badge>}
                                                            {row["Phân loại 2: Giá trị"] && <Badge variant="secondary">{row["Phân loại 2: Giá trị"]}</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {importingIndex === index ? <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" />
                                                            : importingIndex !== null && index < importingIndex ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                                : <div className="h-5 w-5"></div>}
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

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>Đóng</Button>
                    {excelData.length > 0 && (
                        <Button onClick={handleImport} disabled={isUploading || Object.keys(imageFilesMap).length === 0}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý {importingIndex !== null ? `${importingIndex + 1}/${excelData.length}` : ""}
                                </>
                            ) : "Xác nhận & Bắt đầu Import"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}