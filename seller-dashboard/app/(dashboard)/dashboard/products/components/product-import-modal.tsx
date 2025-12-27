"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import { useAppSelector } from "@/store/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { CreateProductPayload } from "@/types/product";

interface ImportRow {
  rowNumber: number;
  name: string;
  description: string;
  short_description: string;
  category_id: string;
  image_path: string;
  media_paths: string;
  option_group_1_name: string;
  option_group_1_values: string;
  option_group_1_images: string;
  option_group_2_name: string;
  option_group_2_values: string;
  sku_price: string;
  sku_quantity: string;
  sku_weight: string;
  allow_return: string;
  allow_check: string;
}

interface ImportResult {
  row: number;
  status: "success" | "error" | "warning";
  message: string;
  productName?: string;
}

export function ImportProductDialog() {
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [open, setOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFolder, setImageFolder] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const generateSkuCode = (productName: string): string => {
    const prefix = productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, ""); // Chỉ lấy chữ cái

    const randomNumber = Math.floor(Math.random() * 10000);

    return `${prefix.padEnd(3, "X")}-${randomNumber
      .toString()
      .padStart(4, "0")}`;
  };

  // Download template Excel
  const downloadTemplate = () => {
    const template = [
      {
        "Tên sản phẩm *": "Áo thun nam cotton",
        "Mô tả ngắn": "Áo thun chất liệu cotton cao cấp",
        "Mô tả chi tiết *":
          "Áo thun nam chất liệu cotton 100%, thoáng mát, form regular fit",
        "ID Danh mục *": "476e7180-fbde-407a-a618-0f0911d76416",
        "Đường dẫn ảnh bìa *": "C:\\Users\\Admin\\Pictures\\ao-thun-1.jpg",
        "Đường dẫn ảnh phụ":
          "C:\\Users\\Admin\\Pictures\\ao-thun-2.jpg;C:\\Users\\Admin\\Pictures\\ao-thun-3.jpg",
        "Nhóm phân loại 1 - Tên": "Màu sắc",
        "Nhóm phân loại 1 - Giá trị": "Đỏ;Xanh;Vàng",
        "Nhóm phân loại 1 - Ảnh":
          "C:\\Users\\Admin\\Pictures\\mau-do.jpg;C:\\Users\\Admin\\Pictures\\mau-xanh.jpg;C:\\Users\\Admin\\Pictures\\mau-vang.jpg",
        "Nhóm phân loại 2 - Tên": "Size",
        "Nhóm phân loại 2 - Giá trị": "S;M;L;XL",
        "Giá bán (VNĐ) *": "150000",
        "Số lượng kho *": "100",
        "Cân nặng (kg) *": "0.25",
        "Cho phép đổi trả": "Có",
        "Cho phép kiểm tra": "Có",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // Tên sản phẩm
      { wch: 30 }, // Mô tả ngắn
      { wch: 50 }, // Mô tả chi tiết
      { wch: 38 }, // ID Danh mục
      { wch: 45 }, // Đường dẫn ảnh bìa
      { wch: 60 }, // Đường dẫn ảnh phụ
      { wch: 20 }, // Nhóm 1 - Tên
      { wch: 30 }, // Nhóm 1 - Giá trị
      { wch: 60 }, // Nhóm 1 - Ảnh
      { wch: 20 }, // Nhóm 2 - Tên
      { wch: 30 }, // Nhóm 2 - Giá trị
      { wch: 15 }, // Giá bán
      { wch: 15 }, // Số lượng
      { wch: 15 }, // Cân nặng
      { wch: 18 }, // Đổi trả
      { wch: 18 }, // Kiểm tra
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Create instructions sheet
    const instructions = [
      { "Hướng dẫn": "Điền thông tin sản phẩm vào file Excel theo template" },
      { "Hướng dẫn": "(*) Các cột có dấu * là bắt buộc" },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "CHI TIẾT CÁC CỘT:" },
      { "Hướng dẫn": "1. Tên sản phẩm: Tên đầy đủ của sản phẩm" },
      { "Hướng dẫn": "2. Mô tả ngắn: Mô tả tóm tắt (tùy chọn)" },
      { "Hướng dẫn": "3. Mô tả chi tiết: Mô tả đầy đủ về sản phẩm" },
      {
        "Hướng dẫn": "4. ID Danh mục: Lấy từ danh sách danh mục trong hệ thống",
      },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "HÌNH ẢNH:" },
      {
        "Hướng dẫn":
          "5. Đường dẫn ảnh bìa: Đường dẫn đầy đủ đến file ảnh chính",
      },
      { "Hướng dẫn": "   VD: C:\\Users\\Admin\\Pictures\\product.jpg" },
      {
        "Hướng dẫn":
          "6. Đường dẫn ảnh phụ: Nhiều đường dẫn ngăn cách bởi dấu ;",
      },
      { "Hướng dẫn": "   VD: C:\\path\\img1.jpg;C:\\path\\img2.jpg" },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "PHÂN LOẠI HÀNG:" },
      { "Hướng dẫn": "7. Nhóm phân loại 1 - Tên: VD: Màu sắc" },
      {
        "Hướng dẫn":
          "8. Nhóm phân loại 1 - Giá trị: VD: Đỏ;Xanh;Vàng (ngăn cách bởi ;)",
      },
      {
        "Hướng dẫn":
          "9. Nhóm phân loại 1 - Ảnh: Đường dẫn ảnh tương ứng với từng giá trị",
      },
      {
        "Hướng dẫn":
          "10. Nhóm phân loại 2: Tương tự nhóm 1 (VD: Size: S;M;L;XL)",
      },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "GIÁ & KHO:" },
      { "Hướng dẫn": "11. Giá bán: Giá chung cho tất cả biến thể (số nguyên)" },
      { "Hướng dẫn": "12. Số lượng kho: Kho chung cho tất cả biến thể" },
      { "Hướng dẫn": "13. Cân nặng: Khối lượng sản phẩm (kg)" },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "CÀI ĐẶT:" },
      { "Hướng dẫn": "14. Cho phép đổi trả: Có hoặc Không" },
      { "Hướng dẫn": "15. Cho phép kiểm tra: Có hoặc Không" },
      { "Hướng dẫn": "" },
      { "Hướng dẫn": "LƯU Ý QUAN TRỌNG:" },
      { "Hướng dẫn": "- Tất cả ảnh phải được chuẩn bị trong 1 thư mục" },
      { "Hướng dẫn": "- Khi import, bạn sẽ chọn thư mục chứa ảnh" },
      { "Hướng dẫn": "- Hệ thống sẽ tự động tìm và upload ảnh theo tên file" },
      { "Hướng dẫn": "- Định dạng ảnh: JPG, PNG, WEBP (dưới 5MB)" },
      {
        "Hướng dẫn":
          "- Nếu có 2 nhóm phân loại, hệ thống tự động tạo tổ hợp SKU",
      },
      {
        "Hướng dẫn":
          "- SKU code sẽ được tự động tạo theo format: [3 CHỮ CÁI]-[4 SỐ]",
      },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Hướng dẫn");

    // Create categories reference sheet
    const categoriesData = categories.map((cat) => ({
      "ID Danh mục": cat.category_id,
      "Tên danh mục": cat.name,
      "Đường dẫn": cat.path,
    }));

    const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
    wsCategories["!cols"] = [{ wch: 38 }, { wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsCategories, "Danh mục");

    XLSX.writeFile(wb, "Template_Import_San_Pham.xlsx");
    toast.success("Đã tải xuống file template", {
      description: "Vui lòng điền thông tin theo hướng dẫn",
    });
  };

  // Parse Excel file
  const parseExcelFile = async (file: File): Promise<ImportRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Skip header row
          const rows = jsonData.slice(1) as any[][];

          const parsedRows: ImportRow[] = rows
            .filter((row) => row.length > 0 && row[0]) // Skip empty rows
            .map((row, index) => ({
              rowNumber: index + 2, // +2 vì bỏ header và index bắt đầu từ 0
              name: row[0]?.toString().trim() || "",
              short_description: row[1]?.toString().trim() || "",
              description: row[2]?.toString().trim() || "",
              category_id: row[3]?.toString().trim() || "",
              image_path: row[4]?.toString().trim() || "",
              media_paths: row[5]?.toString().trim() || "",
              option_group_1_name: row[6]?.toString().trim() || "",
              option_group_1_values: row[7]?.toString().trim() || "",
              option_group_1_images: row[8]?.toString().trim() || "",
              option_group_2_name: row[9]?.toString().trim() || "",
              option_group_2_values: row[10]?.toString().trim() || "",
              sku_price: row[11]?.toString().trim() || "",
              sku_quantity: row[12]?.toString().trim() || "",
              sku_weight: row[13]?.toString().trim() || "",
              allow_return: row[14]?.toString().trim() || "Có",
              allow_check: row[15]?.toString().trim() || "Có",
            }));

          resolve(parsedRows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Lỗi đọc file Excel"));
      reader.readAsBinaryString(file);
    });
  };

  // Find image file from folder by path
  const findImageFile = (imagePath: string, folder: FileList): File | null => {
    if (!imagePath || !folder) return null;

    // Extract filename from full path (handle both Windows and Unix paths)
    const fileName = imagePath.split(/[\\/]/).pop()?.toLowerCase();
    if (!fileName) return null;

    // Search in folder
    for (let i = 0; i < folder.length; i++) {
      const file = folder[i];
      if (file.name.toLowerCase() === fileName) {
        return file;
      }
    }

    return null;
  };

  // Process single product import
  const importSingleProduct = async (
    row: ImportRow,
    folder: FileList
  ): Promise<ImportResult> => {
    try {
      // Validate required fields
      if (!row.name) {
        return {
          row: row.rowNumber,
          status: "error",
          message: "Thiếu tên sản phẩm",
        };
      }

      if (!row.description) {
        return {
          row: row.rowNumber,
          status: "error",
          message: "Thiếu mô tả chi tiết",
        };
      }

      if (!row.category_id) {
        return {
          row: row.rowNumber,
          status: "error",
          message: "Thiếu ID danh mục",
        };
      }

      if (!row.image_path) {
        return {
          row: row.rowNumber,
          status: "error",
          message: "Thiếu đường dẫn ảnh bìa",
        };
      }

      // Find main image
      const imageFile = findImageFile(row.image_path, folder);
      if (!imageFile) {
        return {
          row: row.rowNumber,
          status: "error",
          message: `Không tìm thấy ảnh bìa: ${row.image_path
            .split(/[\\/]/)
            .pop()}`,
        };
      }

      // Find media images
      const mediaFiles: File[] = [];
      if (row.media_paths) {
        const mediaPaths = row.media_paths.split(";").map((p) => p.trim());
        for (const path of mediaPaths) {
          const file = findImageFile(path, folder);
          if (file) {
            mediaFiles.push(file);
          } else {
            console.warn(
              `Không tìm thấy ảnh phụ: ${path.split(/[\\/]/).pop()}`
            );
          }
        }
      }

      // Process option groups
      const optionGroups: Array<{
        name: string;
        values: string[];
        images: File[];
      }> = [];

      // Option group 1
      if (row.option_group_1_name && row.option_group_1_values) {
        const values = row.option_group_1_values
          .split(";")
          .map((v) => v.trim());
        const images: File[] = [];

        if (row.option_group_1_images) {
          const imagePaths = row.option_group_1_images
            .split(";")
            .map((p) => p.trim());
          for (const path of imagePaths) {
            const file = findImageFile(path, folder);
            if (file) {
              images.push(file);
            }
          }
        }

        optionGroups.push({
          name: row.option_group_1_name,
          values,
          images,
        });
      }

      // Option group 2
      if (row.option_group_2_name && row.option_group_2_values) {
        const values = row.option_group_2_values
          .split(";")
          .map((v) => v.trim());
        optionGroups.push({
          name: row.option_group_2_name,
          values,
          images: [],
        });
      }

      // Generate SKU combinations with SKU code
      const generateSkuCombinations = () => {
        if (optionGroups.length === 0) {
          // Không có phân loại - tạo 1 SKU mặc định
          return [
            {
              sku_code: generateSkuCode(row.name),
              price: parseFloat(row.sku_price) || 0,
              quantity: parseInt(row.sku_quantity) || 0,
              weight: parseFloat(row.sku_weight) || 0,
              option_value: [],
            },
          ];
        }

        const cartesian = (arr: any[][]): any[][] => {
          return arr.reduce(
            (acc, curr) => {
              return acc.flatMap((a) => curr.map((c) => [...a, c]));
            },
            [[]] as any[][]
          );
        };

        const valueArrays = optionGroups.map((group) =>
          group.values.map((value) => ({
            option_name: group.name,
            value,
          }))
        );

        const combinations = cartesian(valueArrays);

        return combinations.map((combo) => ({
          sku_code: generateSkuCode(row.name), // Tạo SKU code riêng cho mỗi biến thể
          price: parseFloat(row.sku_price) || 0,
          quantity: parseInt(row.sku_quantity) || 0,
          weight: parseFloat(row.sku_weight) || 0,
          option_value: combo,
        }));
      };

      // Create option_value list
      const optionValues: Array<{ option_name: string; value: string }> = [];
      optionGroups.forEach((group) => {
        group.values.forEach((value) => {
          optionValues.push({
            option_name: group.name,
            value,
          });
        });
      });

      // Prepare payload
      const payload: CreateProductPayload = {
        name: row.name,
        key:
          row.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-") + `-${Date.now()}`,
        description: row.description,
        short_description: row.short_description,
        category_id: row.category_id,
        shop_id: shopId!,
        brand_id: "00362fbd-bb1c-4075-ad3c-765c560462de",
        product_is_permission_return: row.allow_return === "Có",
        product_is_permission_check: row.allow_check === "Có",
        product_sku: generateSkuCombinations(),
        option_value: optionValues,
      };

      // Collect option value images
      const optionValueImages: File[] = [];
      optionGroups.forEach((group) => {
        optionValueImages.push(...group.images);
      });

      // Call API
      await productService.createProduct(payload, {
        image: imageFile,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
        option_value_images:
          optionValueImages.length > 0 ? optionValueImages : undefined,
      });

      return {
        row: row.rowNumber,
        status: "success",
        message: "Import thành công",
        productName: row.name,
      };
    } catch (error: any) {
      return {
        row: row.rowNumber,
        status: "error",
        message: error.message || "Lỗi không xác định",
        productName: row.name,
      };
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!excelFile) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    if (!imageFolder || imageFolder.length === 0) {
      toast.error("Vui lòng chọn thư mục chứa ảnh");
      return;
    }

    if (!shopId) {
      toast.error("Không tìm thấy Shop ID");
      return;
    }

    try {
      setImporting(true);
      setProgress(0);
      setResults([]);

      // Parse Excel
      const rows = await parseExcelFile(excelFile);

      if (rows.length === 0) {
        toast.error("File Excel không có dữ liệu");
        setImporting(false);
        return;
      }

      toast.info(`Bắt đầu import ${rows.length} sản phẩm...`);

      // Import each row
      const importResults: ImportResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        const result = await importSingleProduct(rows[i], imageFolder);
        importResults.push(result);
        setResults([...importResults]);
        setProgress(((i + 1) / rows.length) * 100);

        // Small delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Show summary
      const successCount = importResults.filter(
        (r) => r.status === "success"
      ).length;
      const errorCount = importResults.filter(
        (r) => r.status === "error"
      ).length;

      if (successCount > 0) {
        toast.success(`Import thành công ${successCount} sản phẩm`, {
          description:
            errorCount > 0 ? `${errorCount} sản phẩm lỗi` : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error("Import thất bại", {
          description: "Không có sản phẩm nào được tạo thành công",
        });
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Lỗi khi import", {
        description: error.message || "Vui lòng thử lại",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setExcelFile(null);
    setImageFolder(null);
    setProgress(0);
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="bg-white border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF0E0] hover:text-[#E65100] shadow-xl font-semibold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <Upload className="mr-2 h-5 w-5" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FF6A00] flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Import sản phẩm từ Excel
          </DialogTitle>
          <DialogDescription className="text-base">
            Tải lên file Excel và thư mục chứa ảnh để import hàng loạt sản phẩm
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Download Template */}
          <div className="bg-linear-to-r from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FF6A00] rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Bước 1: Tải file mẫu
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tải xuống file Excel mẫu và điền thông tin sản phẩm
                </p>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-2 border-[#FF6A00] text-[#FF6A00] font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải file mẫu
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Excel */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FF6A00]" />
              Bước 2: Chọn file Excel đã điền
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#FF6A00] transition-colors">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                disabled={importing}
                className="cursor-pointer"
              />
              {excelFile && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{excelFile.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Image Folder */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#FF6A00]" />
              Bước 3: Chọn thư mục chứa tất cả ảnh sản phẩm
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#FF6A00] transition-colors">
              <Input
                type="file"
                // @ts-ignore - webkitdirectory is not in the type definition
                webkitdirectory=""
                directory=""
                multiple
                onChange={(e) => setImageFolder(e.target.files)}
                disabled={importing}
                className="cursor-pointer"
              />
              {imageFolder && imageFolder.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">
                      Đã chọn {imageFolder.length} file
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                    {Array.from(imageFolder)
                      .slice(0, 10)
                      .map((file, i) => (
                        <div key={i}>• {file.name}</div>
                      ))}
                    {imageFolder.length > 10 && (
                      <div className="text-gray-400 mt-1">
                        ... và {imageFolder.length - 10} file khác
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500" />
              <span>
                Chọn thư mục chứa <strong>tất cả ảnh</strong> sản phẩm. Hệ thống
                sẽ tự động tìm ảnh theo tên file trong Excel.
              </span>
            </p>
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Đang import...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Kết quả import ({results.length} dòng)
                </Label>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    ✓ {results.filter((r) => r.status === "success").length}{" "}
                    thành công
                  </span>
                  <span className="text-red-600 font-medium">
                    ✗ {results.filter((r) => r.status === "error").length} lỗi
                  </span>
                </div>
              </div>
              <ScrollArea className="h-64 border rounded-xl bg-gray-50">
                <div className="p-4 space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        result.status === "success"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {result.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            Dòng {result.row}
                          </span>
                          {result.productName && (
                            <span className="text-sm text-gray-600 truncate">
                              - {result.productName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={importing}
            className="border-2"
          >
            Đặt lại
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={importing}
              className="border-2"
            >
              Đóng
            </Button>
            <Button
              onClick={handleImport}
              disabled={!excelFile || !imageFolder || importing}
              className="bg-linear-to-r from-[#FF6A00] to-[#FFB000] hover:from-[#E65100] hover:to-[#FF6A00] px-8 font-semibold"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Bắt đầu import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
