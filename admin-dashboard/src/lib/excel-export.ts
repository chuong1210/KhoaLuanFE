// lib/excel-export.ts
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './utils';

interface Transaction {
  id: string;
  transaction_code: string;
  order_id: { String: string; Valid: boolean };
  amount: string;
  currency: string;
  type: string;
  status: string;
  notes: { String: string; Valid: boolean };
  created_at: string;
  processed_at: { Time: string; Valid: boolean };
}

interface Settlement {
  id: string;
  shop_order_id: string;
  order_subtotal: string;
  commission_fee: string;
  net_settled_amount: string;
  status: string;
}

interface Ledger {
  id: string;
  owner_id: string;
  owner_type: string;
  balance: string;
  pending_balance: string;
  updated_at: string;
}

export const exportTransactionsToExcel = (transactions: Transaction[], filename?: string) => {
  const data = transactions.map((tx) => ({
    'Mã giao dịch': tx.transaction_code,
    'Mã đơn hàng': tx.order_id.Valid ? tx.order_id.String : '-',
    'Loại giao dịch': tx.type === 'PAYMENT' ? 'Thanh toán' : tx.type === 'REFUND' ? 'Hoàn tiền' : tx.type,
    'Số tiền (VND)': parseFloat(tx.amount),
    'Trạng thái': tx.status === 'SUCCESS' ? 'Thành công' : tx.status === 'PENDING' ? 'Chờ xử lý' : 'Thất bại',
    'Ghi chú': tx.notes.Valid ? tx.notes.String : '-',
    'Ngày tạo': formatDate(tx.created_at),
    'Ngày xử lý': tx.processed_at.Valid ? formatDate(tx.processed_at.Time) : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Mã giao dịch
    { wch: 20 }, // Mã đơn hàng
    { wch: 15 }, // Loại giao dịch
    { wch: 15 }, // Số tiền
    { wch: 12 }, // Trạng thái
    { wch: 30 }, // Ghi chú
    { wch: 18 }, // Ngày tạo
    { wch: 18 }, // Ngày xử lý
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Giao dịch');

  const fileName = filename || `Giao_dich_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportSettlementsToExcel = (settlements: Settlement[], filename?: string) => {
  const data = settlements.map((settle) => ({
    'Mã đơn Shop': settle.shop_order_id,
    'Tổng đơn (VND)': parseFloat(settle.order_subtotal),
    'Phí hoa hồng (VND)': parseFloat(settle.commission_fee),
    'Số tiền quyết toán (VND)': parseFloat(settle.net_settled_amount),
    'Trạng thái': settle.status === 'PENDING_SETTLEMENT' ? 'Chờ thanh toán' : settle.status === 'SETTLED' ? 'Đã thanh toán' : settle.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  worksheet['!cols'] = [
    { wch: 30 }, // Mã đơn Shop
    { wch: 15 }, // Tổng đơn
    { wch: 15 }, // Phí hoa hồng
    { wch: 20 }, // Số tiền quyết toán
    { wch: 15 }, // Trạng thái
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quyết toán');

  const fileName = filename || `Quyet_toan_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportLedgersToExcel = (ledgers: Ledger[], filename?: string) => {
  const data = ledgers.map((ledger) => ({
    'Loại chủ sở hữu': ledger.owner_type === 'PLATFORM' ? 'Sàn' : 'Shop',
    'ID chủ sở hữu': ledger.owner_id,
    'Số dư (VND)': parseFloat(ledger.balance),
    'Số dư chờ (VND)': parseFloat(ledger.pending_balance),
    'Cập nhật lúc': formatDate(ledger.updated_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  worksheet['!cols'] = [
    { wch: 18 }, // Loại chủ sở hữu
    { wch: 35 }, // ID chủ sở hữu
    { wch: 15 }, // Số dư
    { wch: 15 }, // Số dư chờ
    { wch: 18 }, // Cập nhật
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sổ cái');

  const fileName = filename || `So_cai_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportFinanceComprehensive = (
  transactions: Transaction[],
  settlements: Settlement[],
  ledgers: Ledger[],
  filename?: string
) => {
  const workbook = XLSX.utils.book_new();

  // Transactions sheet
  if (transactions && transactions.length > 0) {
    const txData = transactions.map((tx) => ({
      'Mã giao dịch': tx.transaction_code,
      'Mã đơn hàng': tx.order_id.Valid ? tx.order_id.String : '-',
      'Loại': tx.type === 'PAYMENT' ? 'Thanh toán' : tx.type === 'REFUND' ? 'Hoàn tiền' : tx.type,
      'Số tiền': parseFloat(tx.amount),
      'Trạng thái': tx.status === 'SUCCESS' ? 'Thành công' : tx.status === 'PENDING' ? 'Chờ xử lý' : 'Thất bại',
      'Ghi chú': tx.notes.Valid ? tx.notes.String : '-',
      'Ngày tạo': formatDate(tx.created_at),
    }));
    const txSheet = XLSX.utils.json_to_sheet(txData);
    txSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, txSheet, 'Giao dịch');
  }

  // Settlements sheet
  if (settlements && settlements.length > 0) {
    const settleData = settlements.map((settle) => ({
      'Mã đơn Shop': settle.shop_order_id,
      'Tổng đơn': parseFloat(settle.order_subtotal),
      'Phí hoa hồng': parseFloat(settle.commission_fee),
      'Quyết toán': parseFloat(settle.net_settled_amount),
      'Trạng thái': settle.status === 'PENDING_SETTLEMENT' ? 'Chờ thanh toán' : 'Đã thanh toán',
    }));
    const settleSheet = XLSX.utils.json_to_sheet(settleData);
    settleSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, settleSheet, 'Quyết toán');
  }

  // Ledgers sheet
  if (ledgers && ledgers.length > 0) {
    const ledgerData = ledgers.map((ledger) => ({
      'Loại': ledger.owner_type === 'PLATFORM' ? 'Sàn' : 'Shop',
      'Số dư': parseFloat(ledger.balance),
      'Số dư chờ': parseFloat(ledger.pending_balance),
      'Cập nhật': formatDate(ledger.updated_at),
    }));
    const ledgerSheet = XLSX.utils.json_to_sheet(ledgerData);
    ledgerSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Sổ cái');
  }

  const fileName = filename || `Bao_cao_tai_chinh_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// ===== ANALYTICS EXPORT FUNCTIONS =====

interface PlatformOverview {
  total_gmv: number;
  total_platform_revenue: number;
  total_platform_cost: number;
  platform_profit: number;
  total_orders: number;
  total_shops: number;
}

interface RevenueTimeseries {
  date: string;
  total_gmv: number;
  platform_revenue: number;
  platform_cost: number;
  platform_profit: number;
}

interface ShopAnalytics {
  shop_id: string;
  total_gmv: number;
  total_orders: number;
}

interface VoucherPerformance {
  usage_history_stats: {
    total_usage_count: number;
    total_discount_value: number;
  };
  platform_cost_stats: {
    total_order_voucher_cost: number;
    total_promotion_cost: number;
    total_shipping_discount_cost: number;
    total_product_subsidy_cost: number;
  };
  total_voucher_cost: number;
}

export const exportAnalyticsOverview = (overview: PlatformOverview, dateRange: string, filename?: string) => {
  const data = [{
    'Khoảng thời gian': dateRange === '7days' ? '7 ngày qua' : dateRange === '30days' ? '30 ngày qua' : '90 ngày qua',
    'Tổng GMV (VND)': overview.total_gmv,
    'Doanh thu Sàn (VND)': overview.total_platform_revenue,
    'Chi phí Sàn (VND)': overview.total_platform_cost,
    'Lợi nhuận Sàn (VND)': overview.platform_profit,
    'Tổng đơn hàng': overview.total_orders,
    'Tổng cửa hàng': overview.total_shops,
  }];

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tổng quan');

  const fileName = filename || `Tong_quan_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportRevenueTimeseries = (data: RevenueTimeseries[], dateRange: string, filename?: string) => {
  const excelData = data.map((item) => ({
    'Ngày': formatDate(item.date).split(' ')[0],
    'Tổng GMV (VND)': item.total_gmv,
    'Doanh thu Sàn (VND)': item.platform_revenue,
    'Chi phí Sàn (VND)': item.platform_cost,
    'Lợi nhuận (VND)': item.platform_profit,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Doanh thu');

  const fileName = filename || `Doanh_thu_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportTopShops = (shops: ShopAnalytics[], filename?: string) => {
  const data = shops.map((shop, index) => ({
    'Thứ hạng': index + 1,
    'Shop ID': shop.shop_id,
    'Tổng GMV (VND)': shop.total_gmv,
    'Tổng đơn hàng': shop.total_orders,
    'GMV trung bình/đơn (VND)': shop.total_orders > 0 ? Math.round(shop.total_gmv / shop.total_orders) : 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Shops');

  const fileName = filename || `Top_Shops_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportVoucherPerformance = (voucher: VoucherPerformance, dateRange: string, filename?: string) => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [{
    'Khoảng thời gian': dateRange === '7days' ? '7 ngày qua' : dateRange === '30days' ? '30 ngày qua' : '90 ngày qua',
    'Tổng lượt sử dụng': voucher.usage_history_stats.total_usage_count,
    'Tổng giá trị giảm (VND)': voucher.usage_history_stats.total_discount_value,
    'Tổng chi phí (VND)': voucher.total_voucher_cost,
  }];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Cost breakdown sheet
  const costData = [
    {
      'Loại chi phí': 'Voucher đơn hàng',
      'Số tiền (VND)': voucher.platform_cost_stats.total_order_voucher_cost,
    },
    {
      'Loại chi phí': 'Chi phí khuyến mãi',
      'Số tiền (VND)': voucher.platform_cost_stats.total_promotion_cost,
    },
    {
      'Loại chi phí': 'Giảm giá vận chuyển',
      'Số tiền (VND)': voucher.platform_cost_stats.total_shipping_discount_cost,
    },
    {
      'Loại chi phí': 'Trợ giá sản phẩm',
      'Số tiền (VND)': voucher.platform_cost_stats.total_product_subsidy_cost,
    },
    {
      'Loại chi phí': 'TỔNG CỘNG',
      'Số tiền (VND)': voucher.total_voucher_cost,
    },
  ];

  const costSheet = XLSX.utils.json_to_sheet(costData);
  costSheet['!cols'] = [{ wch: 25 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, costSheet, 'Chi tiết chi phí');

  const fileName = filename || `Voucher_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportAnalyticsComprehensive = (
  overview: PlatformOverview | null,
  revenueData: RevenueTimeseries[],
  shops: ShopAnalytics[],
  voucherPerf: VoucherPerformance | null,
  dateRange: string,
  filename?: string
) => {
  const workbook = XLSX.utils.book_new();

  // Overview sheet
  if (overview) {
    const overviewData = [{
      'Khoảng thời gian': dateRange === '7days' ? '7 ngày qua' : dateRange === '30days' ? '30 ngày qua' : '90 ngày qua',
      'Tổng GMV': overview.total_gmv,
      'Doanh thu Sàn': overview.total_platform_revenue,
      'Chi phí Sàn': overview.total_platform_cost,
      'Lợi nhuận': overview.platform_profit,
      'Tổng đơn hàng': overview.total_orders,
      'Tổng cửa hàng': overview.total_shops,
    }];
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    overviewSheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng quan');
  }

  // Revenue sheet
  if (revenueData && revenueData.length > 0) {
    const revenueExcelData = revenueData.map((item) => ({
      'Ngày': formatDate(item.date).split(' ')[0],
      'GMV': item.total_gmv,
      'Doanh thu': item.platform_revenue,
      'Chi phí': item.platform_cost,
      'Lợi nhuận': item.platform_profit,
    }));
    const revenueSheet = XLSX.utils.json_to_sheet(revenueExcelData);
    revenueSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');
  }

  // Shops sheet
  if (shops && shops.length > 0) {
    const shopsData = shops.map((shop, index) => ({
      'Hạng': index + 1,
      'Shop ID': shop.shop_id,
      'GMV': shop.total_gmv,
      'Đơn hàng': shop.total_orders,
      'TB/đơn': shop.total_orders > 0 ? Math.round(shop.total_gmv / shop.total_orders) : 0,
    }));
    const shopsSheet = XLSX.utils.json_to_sheet(shopsData);
    shopsSheet['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, shopsSheet, 'Top Shops');
  }

  // Voucher sheet
  if (voucherPerf) {
    const voucherData = [{
      'Lượt dùng': voucherPerf.usage_history_stats.total_usage_count,
      'Giảm giá': voucherPerf.usage_history_stats.total_discount_value,
      'Chi phí': voucherPerf.total_voucher_cost,
    }];
    const voucherSheet = XLSX.utils.json_to_sheet(voucherData);
    voucherSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, voucherSheet, 'Voucher');
  }

  const fileName = filename || `Bao_cao_Analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};