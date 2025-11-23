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
} from "lucide-react";
import {
  LineChart,
  Line,
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
  Area,
  AreaChart,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

// Orange Palette Colors
const CHART_COLORS = ["#FF6A00", "#FF8A33", "#FFB38A", "#FFB000", "#E65100"];
const PRIMARY_COLOR = "#FF6A00";

export default function AnalyticsDashboardPage() {
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // --- DATA FETCHING LOGIC ---
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["shopOverview", dateRange, shopId],
    queryFn: () =>
      analyticsService.getShopOverview(shopId!, dateRange.start, dateRange.end),
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["walletSummary", shopId],
    queryFn: () => analyticsService.getWalletSummary(shopId!),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueTimeseries", dateRange],
    queryFn: () =>
      analyticsService.getRevenueTimeseries(dateRange.start, dateRange.end),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shopOrders", dateRange],
    queryFn: () =>
      analyticsService.getShopOrders(
        shopId!,
        undefined,
        dateRange.start,
        dateRange.end,
        100,
        0
      ),
  });

  // --- HELPER FUNCTIONS ---
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}K`;
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
    return Object.entries(statusCount).map(([name, value]) => ({
      name: getStatusLabel(name),
      value,
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
  };

  return (
    <div
      className="min-h-screen p-6 lg:p-8 space-y-8"
      style={{
        background: "linear-gradient(180deg, rgba(255,106,0,0.03) 0%, rgba(255,240,224,0.3) 100%)",
      }}
    >
      {/* Header Section */}
      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 rounded-2xl border border-[#FFB38A]/20"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #FFF0E0 100%)",
          boxShadow: "0 4px 20px rgba(255, 106, 0, 0.06)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
            }}
          >
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              Thống kê & Phân tích
            </h2>
            <p className="text-[#78716C] mt-1 text-sm">
              Tổng quan hiệu suất kinh doanh của cửa hàng
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#FFB38A]/30"
            style={{ background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)" }}
          >
            <Calendar className="h-4 w-4 text-[#FF6A00]" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="text-sm bg-transparent border-none outline-none text-[#1C1917] cursor-pointer focus:ring-0 font-medium"
            />
            <span className="text-[#78716C] text-xs px-1">đến</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="text-sm bg-transparent border-none outline-none text-[#1C1917] cursor-pointer focus:ring-0 font-medium"
            />
          </div>
          <Button
            onClick={handleRefresh}
            size="icon"
            variant="outline"
            className="h-10 w-10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu (GMV)"
          value={formatPrice(overview?.total_gmv || 0)}
          icon={TrendingUp}
          color="orange"
          loading={overviewLoading}
          description="Tổng giá trị giao dịch"
        />
        <StatCard
          title="Doanh thu ròng"
          value={formatPrice(overview?.total_net_revenue || 0)}
          icon={DollarSign}
          color="emerald"
          loading={overviewLoading}
          description="Thực nhận sau chiết khấu"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={overview?.total_orders || 0}
          icon={ShoppingCart}
          color="amber"
          loading={overviewLoading}
          description="Đơn hàng đã tạo"
        />
        <StatCard
          title="Đang xử lý"
          value={overview?.processing_orders || 0}
          icon={Package}
          color="deep"
          loading={overviewLoading}
          description="Cần xử lý ngay"
        />
      </div>

      {/* Wallet Summary Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Wallet Card */}
        <div
          className="rounded-2xl overflow-hidden relative lg:col-span-1 shadow-xl"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #E65100 100%)",
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />

          <div className="p-8 flex flex-col justify-between h-full relative z-10 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 font-medium mb-2 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Số dư khả dụng
                </p>
                {walletLoading ? (
                  <Skeleton className="h-10 w-32 bg-white/20" />
                ) : (
                  <h3 className="text-3xl font-bold tracking-tight">
                    {formatPrice(wallet?.balance || 0)}
                  </h3>
                )}
              </div>
              <div
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Chờ quyết toán
                </span>
                <span className="font-semibold">
                  {formatPrice(wallet?.pending_balance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Đang giữ
                </span>
                <span className="font-semibold">
                  {formatPrice(wallet?.total_funds_held || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Details Grid */}
        <Card className="lg:col-span-2 border-[#FFB38A]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-[#1C1917] flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{ background: "rgba(22, 163, 74, 0.1)" }}
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              Lịch sử dòng tiền
            </CardTitle>
            <CardDescription>Tổng quan về các giao dịch tài chính</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <WalletDetailItem
                label="Tổng đã quyết toán"
                value={formatPrice(wallet?.total_settled_revenue || 0)}
                icon={TrendingUp}
                colorClass="bg-emerald-50 text-emerald-700 border-emerald-100"
              />
              <WalletDetailItem
                label="Đã rút về ngân hàng"
                value={formatPrice(wallet?.total_withdrawn || 0)}
                icon={ArrowUpRight}
                colorClass="bg-[#FFF0E0] text-[#E65100] border-[#FFB38A]/30"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="flex items-center justify-center md:justify-start">
          <TabsList
            className="p-1.5 rounded-xl border border-[#FFB38A]/20"
            style={{ background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)" }}
          >
            <TabsTrigger
              value="revenue"
              className="rounded-lg px-6 py-2.5 text-[#78716C] data-[state=active]:bg-white data-[state=active]:text-[#FF6A00] data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Biểu đồ doanh thu
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-6 py-2.5 text-[#78716C] data-[state=active]:bg-white data-[state=active]:text-[#FF6A00] data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Phân bổ đơn hàng
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="mt-0 animate-fade-in">
          <Card className="border-[#FFB38A]/20 overflow-hidden">
            <CardHeader className="border-b border-[#FFB38A]/10 pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[#1C1917]">
                    Doanh thu theo thời gian
                  </CardTitle>
                  <CardDescription className="mt-1">
                    So sánh GMV và Doanh thu thực nhận
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pl-0 pr-6">
              {revenueLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFB38A" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="#78716C"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#78716C"
                      fontSize={12}
                      tickFormatter={formatCompactPrice}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: "20px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      name="GMV (Tổng doanh thu)"
                      stroke="#FF6A00"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGmv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="net_revenue"
                      name="Doanh thu ròng"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorNet)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-0 animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#FFB38A]/20">
              <CardHeader>
                <CardTitle className="text-[#1C1917]">Tỷ lệ trạng thái đơn</CardTitle>
                <CardDescription>Phân bổ phần trăm theo trạng thái</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card className="border-[#FFB38A]/20">
              <CardHeader>
                <CardTitle className="text-[#1C1917]">Số lượng đơn hàng</CardTitle>
                <CardDescription>Chi tiết số lượng theo từng loại</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={getOrderStatusData()}
                      margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFB38A" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="name"
                        stroke="#78716C"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis stroke="#78716C" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "#FFF0E0" }} content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Số đơn" radius={[8, 8, 0, 0]} barSize={40}>
                        {getOrderStatusData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: "orange" | "emerald" | "amber" | "deep";
  loading?: boolean;
  description?: string;
}) {
  const colorStyles = {
    orange: {
      bg: "bg-gradient-to-br from-[#FFF0E0] to-[#FFB38A]/20",
      icon: "bg-[#FF6A00] text-white",
      accent: "#FF6A00",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/30",
      icon: "bg-emerald-500 text-white",
      accent: "#10b981",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/30",
      icon: "bg-[#FFB000] text-white",
      accent: "#FFB000",
    },
    deep: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100/30",
      icon: "bg-[#E65100] text-white",
      accent: "#E65100",
    },
  };

  if (loading) {
    return <Skeleton className="h-36 w-full rounded-2xl" />;
  }

  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        "rounded-2xl p-6 border border-[#FFB38A]/20 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#78716C]">{title}</p>
          <h3
            className="text-2xl font-bold mt-2 transition-colors"
            style={{ color: styles.accent }}
          >
            {value}
          </h3>
        </div>
        <div className={cn("p-3 rounded-xl shadow-sm", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-[#78716C] mt-4 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: styles.accent }}
          />
          {description}
        </p>
      )}
    </div>
  );
}

function WalletDetailItem({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string;
  icon: any;
  colorClass?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border flex items-center gap-4 transition-all duration-200 hover:shadow-sm",
        colorClass
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-4 border border-[#FFB38A]/20 shadow-xl rounded-xl text-sm"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF0E0 100%)" }}
      >
        <p className="font-semibold text-[#1C1917] mb-3">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#78716C]">{entry.name}:</span>
            <span className="font-semibold text-[#1C1917]">
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

const EmptyState = () => (
  <div className="h-[300px] flex flex-col items-center justify-center text-[#78716C]">
    <div
      className="p-5 rounded-2xl mb-4"
      style={{ background: "linear-gradient(135deg, #FFF0E0 0%, #FFB38A20 100%)" }}
    >
      <BarChart3 className="h-10 w-10 text-[#FFB38A]" />
    </div>
    <p className="text-sm font-medium">Không có dữ liệu hiển thị</p>
    <p className="text-xs text-[#A8A29E] mt-1">Thử thay đổi khoảng thời gian</p>
  </div>
);
