// utils/excel-template-generator.ts
import * as XLSX from "xlsx";

export const downloadProductImportTemplate = () => {
    // 1. Định nghĩa Header và Dữ liệu mẫu
    const headers = [
        "STT",
        "Tên sản phẩm",
        "Mô tả ngắn",
        "Mô tả chi tiết",
        "Danh mục ID",
        "Tên ảnh đại diện",
        "Danh sách ảnh phụ",
        "SKU Code",
        "Giá",
        "Kho",
        "Cân nặng",
        "Màu sắc",
        "Size"
    ];

    const sampleData = [
        {
            "STT": 1,
            "Tên sản phẩm": "Áo Thun Nam Basic",
            "Mô tả ngắn": "Áo thun cotton thoáng mát",
            "Mô tả chi tiết": "<p>Chất liệu 100% Cotton, thấm hút mồ hôi tốt...</p>",
            "Danh mục ID": "CAT-001", // Thay bằng ID thật của bạn
            "Tên ảnh đại diện": "shirt_main.jpg", // Tên file phải tồn tại trên Media Server
            "Danh sách ảnh phụ": "shirt_back.jpg,shirt_side.jpg",
            "SKU Code": "TSHIRT-001-RED-L",
            "Giá": 150000,
            "Kho": 100,
            "Cân nặng": 0.2,
            "Màu sắc": "Đỏ",
            "Size": "L"
        },
        {
            "STT": 2,
            "Tên sản phẩm": "Quần Jean Nữ Ống Rộng",
            "Mô tả ngắn": "Quần jean hack dáng",
            "Mô tả chi tiết": "Vải denim cao cấp, không co rút...",
            "Danh mục ID": "CAT-002",
            "Tên ảnh đại diện": "jean_main.jpg",
            "Danh sách ảnh phụ": "",
            "SKU Code": "JEAN-WOMEN-BLUE-M",
            "Giá": 350000,
            "Kho": 50,
            "Cân nặng": 0.5,
            "Màu sắc": "Xanh Nhạt",
            "Size": "M"
        }
    ];

    // 2. Tạo Worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });

    // 3. Tinh chỉnh độ rộng cột (Optional)
    ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 30 }, // Tên
        { wch: 25 }, // Mô tả ngắn
        { wch: 30 }, // Mô tả chi tiết
        { wch: 15 }, // Danh mục
        { wch: 20 }, // Ảnh chính
        { wch: 30 }, // Ảnh phụ
        { wch: 20 }, // SKU
        { wch: 10 }, // Giá
        { wch: 10 }, // Kho
        { wch: 10 }, // Cân nặng
        { wch: 10 }, // Màu
        { wch: 10 }  // Size
    ];

    // 4. Tạo Workbook và ghi file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Import");

    // 5. Xuất file
    XLSX.writeFile(wb, "Mau_Import_SanPham.xlsx");
};