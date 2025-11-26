"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Wallet,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  CreditCard,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Activity,
  Download,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Modern Orange Palette - Friendly & Professional
const COLOR_PALETTE = {
  // Primary oranges
  primary: "#FF6B35",
  primaryLight: "#FF8C61",
  primaryDark: "#E5542A",

  // Accent colors
  accent: "#FFB347",
  accentLight: "#FFC875",

  // Background gradients
  bgGradient: "from-orange-50 via-white to-amber-50",
  cardGradient: "from-white to-orange-50/30",

  // Status colors
  status: {
    AWAITING_PAYMENT: "#FFA726", // Warm orange
    PROCESSING: "#42A5F5", // Friendly blue
    SHIPPED: "#7E57C2", // Purple
    COMPLETED: "#66BB6A", // Success green
    CANCELLED: "#EF5350", // Soft red
    REFUNDED: "#FFA726", // Amber
  },

  // Chart colors
  charts: ["#FF6B35", "#66BB6A", "#42A5F5", "#FFA726", "#7E57C2", "#EF5350"],
};

export default function AnalyticsDashboardPage() {
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Quick date filters
  const quickFilters = [
    { label: "7 ngày", days: 7 },
    { label: "30 ngày", days: 30 },
    { label: "90 ngày", days: 90 },
  ];

  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
    toast.success(`Đã chọn ${days} ngày gần đây`);
  };

  // --- DATA FETCHING ---
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["shopOverview", dateRange, shopId],
    queryFn: () =>
      analyticsService.getShopOverview(shopId!, dateRange.start, dateRange.end),
    enabled: !!shopId,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["walletSummary", shopId],
    queryFn: () => analyticsService.getWalletSummary(shopId!),
    enabled: !!shopId,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueTimeseries", dateRange, shopId],
    queryFn: () =>
      analyticsService.getRevenueTimeseries(
        shopId!,
        dateRange.start,
        dateRange.end
      ),
    enabled: !!shopId,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shopOrders", dateRange, shopId],
    queryFn: () =>
      analyticsService.getShopOrders(
        shopId!,
        undefined,
        dateRange.start,
        dateRange.end,
        100,
        0
      ),
    enabled: !!shopId,
  });

  // --- HELPER FUNCTIONS ---
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const getOrderStatusData = () => {
    if (!orders) return [];
    const statusCount: Record<string, number> = {};
    orders.forEach((order) => {
      const status = order.ShopOrder.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, value]) => ({
      name: getStatusLabel(status),
      value,
      status,
      color:
        COLOR_PALETTE.status[status as keyof typeof COLOR_PALETTE.status] ||
        COLOR_PALETTE.primary,
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AWAITING_PAYMENT: "Chờ thanh toán",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      REFUNDED: "Hoàn tiền",
    };
    return labels[status] || status;
  };

  const handleRefresh = () => {
    refetchOverview();
    toast.success("Đã làm mới dữ liệu");
  };

  const handleExport = () => {
    if (!overview || !wallet || !revenueData || !orders) {
      toast.error("Chưa có dữ liệu để xuất");
      return;
    }

    try {
      // Import XLSX dynamically
      import("xlsx").then((XLSX) => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Tổng quan
        const overviewData = [
          ["BÁO CÁO THỐNG KÊ KINH DOANH"],
          [`Từ ngày: ${dateRange.start} đến ${dateRange.end}`],
          [],
          ["CHỈ SỐ TỔNG QUAN"],
          ["Chỉ số", "Giá trị"],
          ["Tổng doanh thu (GMV)", formatPrice(overview.total_gmv)],
          ["Doanh thu thực nhận", formatPrice(overview.total_net_revenue)],
          ["Tổng đơn hàng", overview.total_orders],
          ["Đơn đang xử lý", overview.processing_orders],
          [],
          ["VÍ & TÀI CHÍNH"],
          ["Số dư khả dụng", formatPrice(wallet.balance)],
          ["Chờ quyết toán", formatPrice(wallet.pending_balance)],
          ["Đang giữ", formatPrice(wallet.total_funds_held)],
          ["Tổng đã quyết toán", formatPrice(wallet.total_settled_revenue)],
          ["Đã rút về ngân hàng", formatPrice(wallet.total_withdrawn)],
        ];

        const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
        wsOverview["!cols"] = [{ wch: 30 }, { wch: 20 }];

        // Style header
        wsOverview["A1"] = {
          v: "BÁO CÁO THỐNG KÊ KINH DOANH",
          s: { font: { bold: true, sz: 16 } },
        };

        XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");

        // Sheet 2: Doanh thu theo ngày
        if (revenueData && revenueData.length > 0) {
          const revenueSheet = [
            ["DOANH THU THEO NGÀY"],
            [],
            [
              "Ngày",
              "Tổng doanh thu (GMV)",
              "Doanh thu thực nhận",
              "Số đơn hàng",
            ],
            ...revenueData.map((item) => [
              item.date,
              item.gmv,
              item.net_revenue,
              item.orders || 0,
            ]),
            [],
            [
              "Tổng cộng",
              revenueData.reduce((sum, item) => sum + item.gmv, 0),
              revenueData.reduce((sum, item) => sum + item.net_revenue, 0),
              revenueData.reduce((sum, item) => sum + (item.orders || 0), 0),
            ],
          ];

          const wsRevenue = XLSX.utils.aoa_to_sheet(revenueSheet);
          wsRevenue["!cols"] = [
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
          ];
          XLSX.utils.book_append_sheet(wb, wsRevenue, "Doanh thu theo ngày");
        }

        // Sheet 3: Chi tiết đơn hàng
        if (orders && orders.length > 0) {
          const orderStatusData = getOrderStatusData();
          const ordersSheet = [
            ["THỐNG KÊ ĐỜN HÀNG"],
            [],
            ["Trạng thái", "Số lượng", "Tỷ lệ"],
            ...orderStatusData.map((item) => [
              item.name,
              item.value,
              `${((item.value / orders.length) * 100).toFixed(1)}%`,
            ]),
            [],
            ["Tổng đơn hàng", orders.length],
          ];

          const wsOrders = XLSX.utils.aoa_to_sheet(ordersSheet);
          wsOrders["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsOrders, "Thống kê đơn hàng");

          // Chi tiết đơn hàng
          const orderDetailsSheet = [
            ["CHI TIẾT ĐƠN HÀNG"],
            [],
            [
              "Mã đơn",
              "Trạng thái",
              "Tổng tiền",
              "Giảm giá",
              "Phí ship",
              "Ngày tạo",
            ],
            ...orders
              .slice(0, 100)
              .map((order) => [
                order.ShopOrder.shop_order_code,
                getStatusLabel(order.ShopOrder.status),
                parseFloat(order.ShopOrder.total_amount),
                parseFloat(order.ShopOrder.total_discount),
                parseFloat(order.ShopOrder.shipping_fee),
                new Date(order.ShopOrder.created_at).toLocaleString("vi-VN"),
              ]),
          ];

          const wsOrderDetails = XLSX.utils.aoa_to_sheet(orderDetailsSheet);
          wsOrderDetails["!cols"] = [
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
          ];
          XLSX.utils.book_append_sheet(wb, wsOrderDetails, "Chi tiết đơn hàng");
        }

        // Generate filename with date
        const today = new Date().toISOString().split("T")[0];
        const filename = `Bao_Cao_Thong_Ke_${today}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);

        toast.success("Xuất báo cáo thành công!", {
          description: `File ${filename} đã được tải xuống`,
        });
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất báo cáo", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  // Calculate growth percentage (mock)
  const calculateGrowth = () => {
    return Math.floor(Math.random() * 30) + 5; // Mock data
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/50 via-white to-orange-50/30 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Modern Friendly Header */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35] via-[#FF8C61] to-[#FFB347]" />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-900/20 rounded-full blur-2xl -ml-20 -mb-20" />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-yellow-300/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left side - Title */}
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-xl">
                  <Activity className="h-9 w-9 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Dashboard Analytics
                  </h1>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <Sparkles className="h-5 w-5 text-yellow-200 animate-pulse" />
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg font-medium">
                  Theo dõi hiệu suất kinh doanh một cách dễ dàng 📊
                </p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRefresh}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Làm mới</span>
              </Button>
              <Button
                onClick={handleExport}
                size="lg"
                className="bg-white hover:bg-white/95 text-[#FF6B35] font-bold rounded-2xl px-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tải báo cáo</span>
                <span className="sm:hidden">Tải về</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Date Range Selector */}
      <Card className="border-0 shadow-lg bg-linear-to-br from-white to-orange-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Left - Title with icon */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-100 rounded-xl blur-md" />
                <div className="relative p-3 bg-linear-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Khoảng thời gian
                </h3>
                <p className="text-sm text-gray-500">
                  Chọn để xem báo cáo chi tiết
                </p>
              </div>
            </div>

            {/* Right - Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Quick filters */}
              <div className="flex gap-2 p-1.5 bg-white rounded-xl border-2 border-orange-100 shadow-sm">
                {quickFilters.map((filter) => (
                  <Button
                    key={filter.days}
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickFilter(filter.days)}
                    className="rounded-lg hover:bg-linear-to-r hover:from-orange-400 hover:to-orange-500 hover:text-white font-semibold transition-all duration-300"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden md:block h-8 w-px bg-linear-to-b from-transparent via-gray-300 to-transparent" />

              {/* Custom date inputs */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border-2 border-orange-100 shadow-sm hover:border-orange-300 transition-colors">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-gray-700 font-medium w-32 cursor-pointer"
                />
                <div className="flex items-center gap-1 text-orange-400">
                  <div className="w-2 h-0.5 bg-orange-400 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-orange-400 rounded-full" />
                  <div className="w-1 h-0.5 bg-orange-400 rounded-full" />
                </div>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-gray-700 font-medium w-32 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Beautiful Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng doanh thu"
          value={formatPrice(overview?.total_gmv || 0)}
          subtitle="GMV - Tổng giá trị đơn hàng"
          icon={TrendingUp}
          gradient="from-orange-400 to-orange-600"
          loading={overviewLoading}
          growth={calculateGrowth()}
        />
        <MetricCard
          title="Doanh thu thực nhận"
          value={formatPrice(overview?.total_net_revenue || 0)}
          subtitle="Sau khi trừ chiết khấu"
          icon={DollarSign}
          gradient="from-emerald-400 to-emerald-600"
          loading={overviewLoading}
          growth={calculateGrowth()}
        />
        <MetricCard
          title="Đơn hàng"
          value={overview?.total_orders || 0}
          subtitle="Tổng số đơn đã tạo"
          icon={ShoppingCart}
          gradient="from-blue-400 to-blue-600"
          loading={overviewLoading}
          trend="up"
        />
        <MetricCard
          title="Cần xử lý"
          value={overview?.processing_orders || 0}
          subtitle="Đơn đang chờ xử lý"
          icon={Package}
          gradient="from-amber-400 to-amber-600"
          loading={overviewLoading}
          highlight
        />
      </div>

      {/* Wallet Section - Premium Feel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Wallet Card */}
        <Card className="lg:col-span-1 overflow-hidden border-0 shadow-2xl">
          <div className="bg-linear-to-br from-[#FF6A00] via-[#FF8533] to-[#FFB000] p-6 md:p-8 text-white relative">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <p className="text-white/90 font-medium">Ví của tôi</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              {walletLoading ? (
                <Skeleton className="h-12 w-40 bg-white/20" />
              ) : (
                <>
                  <p className="text-sm text-white/70 mb-2">Số dư khả dụng</p>
                  <h2 className="text-4xl font-bold mb-8">
                    {formatCompactPrice(wallet?.balance || 0)}đ
                  </h2>
                </>
              )}

              <div className="space-y-3 border-t border-white/20 pt-4">
                <WalletRow
                  icon={Clock}
                  label="Chờ quyết toán"
                  value={formatCompactPrice(wallet?.pending_balance || 0)}
                />
                <WalletRow
                  icon={CreditCard}
                  label="Đang giữ"
                  value={formatCompactPrice(wallet?.total_funds_held || 0)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Wallet Details */}
        <Card className="lg:col-span-2 border-2 border-orange-100 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Lịch sử giao dịch</CardTitle>
                <CardDescription>Tổng quan dòng tiền của bạn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <DetailBox
                label="Đã quyết toán"
                value={formatPrice(wallet?.total_settled_revenue || 0)}
                icon={TrendingUp}
                color="emerald"
              />
              <DetailBox
                label="Đã rút về ngân hàng"
                value={formatPrice(wallet?.total_withdrawn || 0)}
                icon={ArrowUpRight}
                color="orange"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Clean Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="bg-white border-2 border-orange-100 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger
              value="revenue"
              className="rounded-lg px-6 py-3 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#FF6A00] data-[state=active]:to-[#FF8533] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Doanh thu
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-6 py-3 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#FF6A00] data-[state=active]:to-[#FF8533] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Đơn hàng
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Revenue Chart */}
        <TabsContent value="revenue" className="mt-0">
          <Card className="border-2 border-orange-100 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-[#FF6A00]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Biểu đồ doanh thu</CardTitle>
                    <CardDescription className="mt-1">
                      Theo dõi doanh thu theo từng ngày
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {revenueLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#FF6B35"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FF6B35"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#66BB6A"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#66BB6A"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={formatCompactPrice}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={50}
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: "20px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      name="💰 Tổng doanh thu (GMV)"
                      stroke="#FF6B35"
                      strokeWidth={4}
                      fill="url(#colorGmv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="net_revenue"
                      name="💵 Doanh thu thực nhận"
                      stroke="#66BB6A"
                      strokeWidth={4}
                      fill="url(#colorNet)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="Chưa có dữ liệu doanh thu" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Charts */}
        <TabsContent value="orders" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card className="border-2 border-orange-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <PieChart className="h-5 w-5 text-[#FF6A00]" />
                  </div>
                  <div>
                    <CardTitle>Tỷ lệ trạng thái</CardTitle>
                    <CardDescription>Phân bổ đơn hàng theo %</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <RePieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={40}
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="Chưa có đơn hàng" />
                )}
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="border-2 border-orange-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Số lượng đơn hàng</CardTitle>
                    <CardDescription>Chi tiết từng trạng thái</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={getOrderStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Số đơn"
                        radius={[10, 10, 0, 0]}
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="Chưa có đơn hàng" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  loading,
  growth,
  trend,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  gradient: string;
  loading?: boolean;
  growth?: number;
  trend?: "up" | "down";
  highlight?: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-48 rounded-3xl" />;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer",
        highlight ? "ring-4 ring-amber-300/50 shadow-xl" : "shadow-lg"
      )}
    >
      {/* Gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity",
          gradient
        )}
      />

      {/* Decorative circle */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-linear-to-br from-orange-200/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <CardContent className="p-7 relative z-10">
        {/* Top row - Icon and Growth */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div
              className={cn(
                "relative p-4 rounded-2xl shadow-lg bg-linear-to-br",
                gradient
              )}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>

          {growth && (
            <div className="flex items-center gap-1.5 bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" />+{growth}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {value}
          </h3>
          <div className="flex items-center gap-2 pt-2">
            <div className="w-8 h-1 bg-linear-to-r from-orange-400 to-orange-500 rounded-full" />
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WalletRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-white/80">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-white">{value}đ</span>
    </div>
  );
}

function DetailBox({ label, value, icon: Icon, color }: any) {
  const colorStyles = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-xl border-2 transition-all hover:shadow-md",
        colorStyles[color as keyof typeof colorStyles]
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/80 rounded-xl shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm opacity-80 mb-1">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-orange-100 shadow-2xl rounded-xl p-4 min-w-[200px]">
        <p className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mb-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}:</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {typeof entry.value === "number" && entry.value > 1000
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyState = ({ message }: { message?: string }) => (
  <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
    <div className="p-6 bg-gray-50 rounded-2xl mb-4">
      <AlertCircle className="h-12 w-12 text-gray-300" />
    </div>
    <p className="text-base font-medium text-gray-600">
      {message || "Không có dữ liệu"}
    </p>
    <p className="text-sm text-gray-400 mt-1">Thử chọn khoảng thời gian khác</p>
  </div>
);
