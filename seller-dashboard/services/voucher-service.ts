
// services/voucher-service.ts
import axiosInstance, { apiClient } from "@/lib/api/axios-instance";
import type { GetVoucherParams, Voucher, VoucherFormData, VoucherUsageDetail } from "@/types/voucher";

const VOUCHER_API = "http://localhost:9002/v1/vouchers";
const VOUCHER_STATS_API = "http://localhost:9004/v1/shop/vouchers";
const DEFAULT_SHOP_ID = "1"
export const voucherService = {
  getVouchers: async (params: GetVoucherParams) => {
    // Xây dựng query string từ params
    // Lưu ý: API của bạn hỗ trợ search voucher_code HOẶC name. 
    // Ở đây ta giả lập search term sẽ gán vào 'name' (hoặc bạn cần sửa API để hỗ trợ search keyword chung)
    const response = await apiClient.get(`${VOUCHER_API}/management`, {
      params: {
        ...params,
        // Nếu API yêu cầu riêng lẻ name/code, ta có thể hack nhẹ bằng cách gửi cả 2 hoặc ưu tiên name
        // Tùy vào BE xử lý, ở đây mình gửi 'name' đại diện cho từ khóa tìm kiếm
        name: params.name || undefined,
      },
    });
    return response.data;
  },

  getVoucherById: async (id: string): Promise<Voucher> => {
    const response = await axiosInstance.get(`${VOUCHER_API} / ${id}`);
    return response.data.result || response.data;
  },

  getVoucherUsageDetails: async (
    voucherId: string,
    limit = 20,
    offset = 0
  ): Promise<VoucherUsageDetail[]> => {
    const response = await axiosInstance.get(
      `${VOUCHER_STATS_API} / ${voucherId} / details ? limit = ${limit} & offset=${offset}`
    );
    return response.data.result || [];
  },

  createVoucher: async (data: VoucherFormData, shopId?: string): Promise<void> => {
    const payload: any = {
      name: data.name,
      voucher_code: data.voucher_code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount_amount: data.max_discount_amount || 0,
      applies_to_type: data.applies_to_type,
      min_purchase_amount: data.min_purchase_amount,
      audience_type: data.audience_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_quantity: data.total_quantity,
      max_usage_per_user: data.max_usage_per_user,
    };

    if (data.audience_type === "ASSIGNED" && data.user_use && data.user_use.length > 0) {
      payload.user_use = data.user_use;
    }
    const response = await axiosInstance.post(
      VOUCHER_API,
      payload, // body
      {
        params: { shop_id: shopId }, // query
      }
    );

    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to create voucher");
    }
  },

  updateVoucher: async (id: string, data: Partial<VoucherFormData>, shopId: string): Promise<void> => {
    // Chỉ lấy những trường có giá trị (không gửi null/undefined nếu không cần thiết)
    // Hoặc gửi toàn bộ data form tùy logic BE, ở đây ta gửi theo form state

    // Format lại dữ liệu cho đúng chuẩn backend yêu cầu
    const payload = {
      name: data.name,
      // voucher_code: data.voucher_code, // Thường code không cho sửa, nếu cho sửa thì bỏ comment
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      max_discount_amount: Number(data.max_discount_amount),
      applies_to_type: data.applies_to_type,
      min_purchase_amount: Number(data.min_purchase_amount),
      audience_type: data.audience_type,
      start_date: data.start_date, // Đảm bảo định dạng ISO
      end_date: data.end_date,     // Đảm bảo định dạng ISO
      total_quantity: Number(data.total_quantity),
      max_usage_per_user: Number(data.max_usage_per_user),
      is_active: data.is_active,
      // Xử lý user_use nếu là ASSIGNED
      ...(data.audience_type === 'ASSIGNED' && { user_use: data.user_use })
    };

    const response = await axiosInstance.put(
      `${VOUCHER_API}/${id}?shop_id=${shopId}`,
      payload
    );

    if (response.data.status !== "success" && response.data.code !== 200) {
      throw new Error(response.data.message || "Failed to update voucher");
    }
  },

  deleteVoucher: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete(`${VOUCHER_API} / ${id}`);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to delete voucher");
    }
  },
};