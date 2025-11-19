// services/order-service.ts
import axiosInstance from "@/lib/api/axios-instance";
import type { ShopOrder, OrderStatus, OrderSearchParams, ShopOrdersResponse, OrderDetailResponseResult } from "@/types/order";

const ORDER_API = "http://localhost:9002/v1/orders";

export const orderService = {
  // Get all shop orders for seller
  getShopOrders: async (params: OrderSearchParams): Promise<ShopOrdersResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await axiosInstance.get<ShopOrdersResponse>(
      `${ORDER_API}/admin/shop-orders?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<ShopOrder> => {
    // API trả về { result: { order: ..., order_shop: ... } }
    const response = await axiosInstance.get<{ result: OrderDetailResponseResult }>(
      `${ORDER_API}/${orderId}`
    );

    // --- SỬA TẠI ĐÂY ---
    // Chỉ trả về order_shop vì UI đang được build dựa trên ShopOrder
    // Nếu sau này bạn cần hiển thị Địa chỉ (Shipping Address) hoặc Payment Method,
    // bạn sẽ cần merge 2 object này lại hoặc sửa UI để nhận cả 2.

    // Hiện tại để fix lỗi null, ta trả về order_shop:
    return response.data.result.order_shop;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await axiosInstance.put(`${ORDER_API}/callback_payment_online/${orderId}`, {
      status,
    });
  },
};