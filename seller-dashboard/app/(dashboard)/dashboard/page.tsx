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
  Download,
  Heart,
  Zap,
  Star,
  Gift,
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

// Soft Color Palette - Modern & Friendly
const STATUS_COLORS = {
  AWAITING_PAYMENT: {
    main: "#FBBF24", // Amber - Chờ thanh toán
    light: "#FEF3C7",
    gradient: "from-amber-400 to-amber-500",
  },
  PROCESSING: {
    main: "#60A5FA", // Blue - Đang xử lý
    light: "#DBEAFE",
    gradient: "from-blue-400 to-blue-500",
  },
  SHIPPED: {
    main: "#A78BFA", // Purple - Đang giao
    light: "#EDE9FE",
    gradient: "from-purple-400 to-purple-500",
  },
  COMPLETED: {
    main: "#34D399", // Emerald - Hoàn thành
    light: "#D1FAE5",
    gradient: "from-emerald-400 to-emerald-500",
  },
  CANCELLED: {
    main: "#F87171", // Red - Đã hủy
    light: "#FEE2E2",
    gradient: "from-red-400 to-red-500",
  },
  REFUNDED: {
    main: "#FB923C", // Orange - Hoàn tiền
    light: "#FFEDD5",
    gradient: "from-orange-400 to-orange-500",
  },
};

export default function AnalyticsDashboardPage() {
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const quickFilters = [
    { label: "7 ngày", days: 7, icon: "⚡" },
    { label: "30 ngày", days: 30, icon: "📅" },
    { label: "90 ngày", days: 90, icon: "📊" },
  ];

  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
    toast.success(`✨ Đã chọn ${days} ngày gần đây`, {
      description: "Dữ liệu đang được cập nhật",
    });
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
      status: status as keyof typeof STATUS_COLORS,
      color:
        STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.main || "#94A3B8",
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AWAITING_PAYMENT: "Chờ thanh toán",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao hàng",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      REFUNDED: "Hoàn tiền",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      AWAITING_PAYMENT: "⏳",
      PROCESSING: "📦",
      SHIPPED: "🚚",
      COMPLETED: "✅",
      CANCELLED: "❌",
      REFUNDED: "💰",
    };
    return icons[status] || "📋";
  };

  const handleRefresh = () => {
    refetchOverview();
    toast.success("🔄 Đã làm mới dữ liệu", {
      description: "Thống kê đã được cập nhật",
    });
  };

  const handleExport = () => {
    if (!overview || !wallet || !revenueData || !orders) {
      toast.error("⚠️ Chưa có dữ liệu để xuất");
      return;
    }

    try {
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

        // Sheet 3: Thống kê đơn hàng
        if (orders && orders.length > 0) {
          const orderStatusData = getOrderStatusData();
          const ordersSheet = [
            ["THỐNG KÊ ĐƠN HÀNG"],
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
        }

        const today = new Date().toISOString().split("T")[0];
        const filename = `Bao_Cao_Thong_Ke_${today}.xlsx`;
        XLSX.writeFile(wb, filename);

        toast.success("✅ Xuất báo cáo thành công!", {
          description: `File ${filename} đã được tải xuống`,
        });
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("❌ Lỗi khi xuất báo cáo");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Friendly Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                Chào mừng trở lại! 👋
              </h1>
              <p className="text-slate-500 text-base">
                Đây là tổng quan kinh doanh của bạn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleRefresh}
              size="lg"
              variant="outline"
              className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button
              onClick={handleExport}
              size="lg"
              className="rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Picker - Soft & Clean */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Khoảng thời gian
                </h3>
                <p className="text-sm text-slate-500">Chọn để xem báo cáo</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.days}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickFilter(filter.days)}
                  className="rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <span className="mr-1.5">{filter.icon}</span>
                  {filter.label}
                </Button>
              ))}

              <div className="h-8 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-slate-700 w-32"
                />
                <span className="text-slate-400">→</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="text-sm bg-transparent border-none outline-none text-slate-700 w-32"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards - Soft & Modern */}
      <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SoftMetricCard
          title="Tổng doanh thu"
          value={formatPrice(overview?.total_gmv || 0)}
          subtitle="Giá trị đơn hàng"
          icon={TrendingUp}
          gradient="from-emerald-400 to-teal-500"
          bgColor="bg-emerald-50"
          loading={overviewLoading}
          iconColor="text-emerald-600"
        />
        <SoftMetricCard
          title="Thực nhận"
          value={formatPrice(overview?.total_net_revenue || 0)}
          subtitle="Sau chiết khấu"
          icon={DollarSign}
          gradient="from-blue-400 to-indigo-500"
          bgColor="bg-blue-50"
          loading={overviewLoading}
          iconColor="text-blue-600"
        />
        <SoftMetricCard
          title="Đơn hàng"
          value={overview?.total_orders || 0}
          subtitle="Tổng số đơn"
          icon={ShoppingCart}
          gradient="from-violet-400 to-purple-500"
          bgColor="bg-violet-50"
          loading={overviewLoading}
          iconColor="text-violet-600"
        />
        <SoftMetricCard
          title="Cần xử lý"
          value={overview?.processing_orders || 0}
          subtitle="Đơn chờ xử lý"
          icon={Zap}
          gradient="from-amber-400 to-orange-500"
          bgColor="bg-amber-50"
          loading={overviewLoading}
          iconColor="text-amber-600"
          highlight
        />
      </div>

      {/* Wallet Section - Elegant */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500">
          <CardContent className="p-6 md:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <p className="font-medium">Ví của tôi</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Premium</span>
                </div>
              </div>

              {walletLoading ? (
                <Skeleton className="h-12 w-40 bg-white/20 rounded-xl" />
              ) : (
                <>
                  <p className="text-sm text-white/80 mb-2">Số dư khả dụng</p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">
                    {formatCompactPrice(wallet?.balance || 0)}đ
                  </h2>
                </>
              )}

              <div className="space-y-3 border-t border-white/20 pt-5">
                <WalletItem
                  icon={Clock}
                  label="Chờ quyết toán"
                  value={formatCompactPrice(wallet?.pending_balance || 0)}
                />
                <WalletItem
                  icon={CreditCard}
                  label="Đang giữ"
                  value={formatCompactPrice(wallet?.total_funds_held || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
                <CardDescription>Dòng tiền của bạn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <SoftDetailBox
                label="Đã quyết toán"
                value={formatPrice(wallet?.total_settled_revenue || 0)}
                icon={CheckCircle2}
                color="emerald"
              />
              <SoftDetailBox
                label="Đã rút về"
                value={formatPrice(wallet?.total_withdrawn || 0)}
                icon={ArrowUpRight}
                color="blue"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Clean Tabs */}
      <Tabs defaultValue="revenue" className="space-y-5">
        <div className="flex justify-center">
          <TabsList className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
            <TabsTrigger
              value="revenue"
              className="rounded-xl px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Doanh thu
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-xl px-6 py-2.5 data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 transition-all"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Đơn hàng
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Revenue Chart */}
        <TabsContent value="revenue" className="mt-0">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="border-b border-slate-50 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Biểu đồ doanh thu</CardTitle>
                  <CardDescription className="mt-1">
                    Theo dõi xu hướng từng ngày
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {revenueLoading ? (
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F1F5F9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickFormatter={formatCompactPrice}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<SoftTooltip />} />
                    <Legend verticalAlign="top" height={50} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      name="💰 Tổng doanh thu"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#colorGmv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="net_revenue"
                      name="✨ Thực nhận"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#colorNet)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <FriendlyEmptyState
                  message="Chưa có dữ liệu doanh thu"
                  icon="📊"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Charts */}
        <TabsContent value="orders" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 rounded-xl">
                    <PieChart className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Phân bổ trạng thái</CardTitle>
                    <CardDescription>Tỷ lệ từng loại đơn</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-[350px] w-full rounded-2xl" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={115}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<SoftTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={50}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                          <span className="text-sm text-slate-700">
                            {getStatusIcon(entry.payload.status)} {value}
                          </span>
                        )}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <FriendlyEmptyState message="Chưa có đơn hàng" icon="📦" />
                )}
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Số lượng đơn</CardTitle>
                    <CardDescription>Chi tiết từng trạng thái</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-[350px] w-full rounded-2xl" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getOrderStatusData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F1F5F9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                      <Tooltip content={<SoftTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Số đơn"
                        radius={[12, 12, 0, 0]}
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <FriendlyEmptyState message="Chưa có đơn hàng" icon="📦" />
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

function SoftMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  bgColor,
  loading,
  iconColor,
  highlight,
}: any) {
  if (loading) {
    return <Skeleton className="h-40 rounded-2xl" />;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        highlight
          ? "border-amber-200 ring-2 ring-amber-100"
          : "border-slate-100"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-2xl", bgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          {highlight && (
            <div className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Ưu tiên
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-600 font-medium mb-1.5">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {value}
          </h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WalletItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-white/90">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-white">{value}đ</span>
    </div>
  );
}

function SoftDetailBox({ label, value, icon: Icon, color }: any) {
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border-2 transition-all hover:shadow-sm",
        styles[color] || ""
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/80 rounded-xl shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm opacity-80 mb-1 font-medium">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

const SoftTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4 min-w-[200px]">
        <p className="font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
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
              <span className="text-sm text-slate-600">{entry.name}:</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
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

const FriendlyEmptyState = ({ message, icon }: any) => (
  <div className="h-80 flex flex-col items-center justify-center">
    <div className="text-6xl mb-4">{icon}</div>
    <p className="text-base font-medium text-slate-600 mb-1">{message}</p>
    <p className="text-sm text-slate-400">Thử chọn khoảng thời gian khác nhé</p>
  </div>
);
