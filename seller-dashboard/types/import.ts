// types/import.ts - Types for Excel import functionality

export interface ExcelProductRow {
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

export interface ImportResult {
  row: number;
  status: "success" | "error" | "warning";
  message: string;
  productName?: string;
}

export interface OptionGroup {
  name: string;
  values: string[];
  images: File[];
}

export interface ImportConfig {
  batchSize: number;
  delayBetweenRequests: number;
  maxFileSize: number;
  allowedImageFormats: string[];
}

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  batchSize: 1, // Import từng sản phẩm
  delayBetweenRequests: 500, // 500ms delay
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageFormats: [".jpg", ".jpeg", ".png", ".webp"],
};

// Excel column mapping
export const EXCEL_COLUMNS = {
  NAME: 0,
  SHORT_DESC: 1,
  DESCRIPTION: 2,
  CATEGORY_ID: 3,
  IMAGE_PATH: 4,
  MEDIA_PATHS: 5,
  OPTION_1_NAME: 6,
  OPTION_1_VALUES: 7,
  OPTION_1_IMAGES: 8,
  OPTION_2_NAME: 9,
  OPTION_2_VALUES: 10,
  SKU_PRICE: 11,
  SKU_QUANTITY: 12,
  SKU_WEIGHT: 13,
  ALLOW_RETURN: 14,
  ALLOW_CHECK: 15,
} as const;

// Validation rules
export const VALIDATION_RULES = {
  REQUIRED_FIELDS: ["name", "description", "category_id", "image_path"],
  MIN_PRICE: 0,
  MIN_QUANTITY: 0,
  MIN_WEIGHT: 0,
  MAX_OPTIONS: 2,
  BOOLEAN_VALUES: ["Có", "Không", "Yes", "No", "1", "0"],
} as const;