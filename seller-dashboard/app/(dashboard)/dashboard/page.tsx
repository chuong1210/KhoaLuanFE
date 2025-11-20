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

// Palette màu cam hiện đại
const CHART_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];
const PRIMARY_COLOR = "#f97316"; // Orange-500

export default function AnalyticsDashboardPage() {
  const shopId = useAppSelector((state) => state.shop.data?.id);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // --- DATA FETCHING LOGIC (GIỮ NGUYÊN) ---
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
  // ----------------------------------------

  // --- HELPER FUNCTIONS (GIỮ NGUYÊN) ---
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
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </span>
            Thống kê & Phân tích
          </h2>
          <p className="text-slate-500 mt-1 text-sm ml-12">
            Tổng quan hiệu suất kinh doanh của cửa hàng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
            <Calendar className="h-4 w-4 text-orange-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="text-sm bg-transparent border-none outline-none text-slate-600 cursor-pointer focus:ring-0 font-medium"
            />
            <span className="text-slate-400 text-xs px-1">đến</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="text-sm bg-transparent border-none outline-none text-slate-600 cursor-pointer focus:ring-0 font-medium"
            />
          </div>
          <Button
            onClick={handleRefresh}
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
          color="blue"
          loading={overviewLoading}
          description="Đơn hàng đã tạo"
        />
        <StatCard
          title="Đang xử lý"
          value={overview?.processing_orders || 0}
          icon={Package}
          color="amber"
          loading={overviewLoading}
          description="Cần xử lý ngay"
        />
      </div>

      {/* Wallet Summary Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Wallet Card */}
        <Card className="border-none shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative lg:col-span-1">
          <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 p-24 bg-black opacity-5 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100 font-medium mb-1 text-sm">Số dư khả dụng</p>
                {walletLoading ? (
                  <Skeleton className="h-10 w-32 bg-white/20" />
                ) : (
                  <h3 className="text-3xl font-bold tracking-tight">
                    {formatPrice(wallet?.balance || 0)}
                  </h3>
                )}
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <span className="text-orange-100 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Chờ quyết toán
                </span>
                <span className="font-semibold">{formatPrice(wallet?.pending_balance || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-100 text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Đang giữ
                </span>
                <span className="font-semibold">{formatPrice(wallet?.total_funds_held || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Details Grid */}
        <Card className="border-none shadow-sm bg-white lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Lịch sử dòng tiền
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <WalletDetailItem
                label="Tổng đã quyết toán"
                value={formatPrice(wallet?.total_settled_revenue || 0)}
                icon={TrendingUp}
                className="bg-green-50 text-green-700 border-green-100"
              />
              <WalletDetailItem
                label="Đã rút về ngân hàng"
                value={formatPrice(wallet?.total_withdrawn || 0)}
                icon={ArrowUpRight}
                className="bg-slate-50 text-slate-700 border-slate-100"
              />
              {/* Có thể thêm các chỉ số khác ở đây nếu cần */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="flex items-center justify-center md:justify-start">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="revenue"
              className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Biểu đồ doanh thu
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Phân bổ đơn hàng
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="mt-0 animate-in fade-in-50 duration-300">
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-slate-800">Doanh thu theo thời gian</CardTitle>
                  <CardDescription className="mt-1">So sánh GMV và Doanh thu thực nhận</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pl-0 pr-6">
              {revenueLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
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
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      name="GMV (Tổng doanh thu)"
                      stroke="#f97316"
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

        <TabsContent value="orders" className="mt-0 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-slate-800">Tỷ lệ trạng thái đơn</CardTitle>
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
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
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

            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-slate-800">Số lượng đơn hàng</CardTitle>
                <CardDescription>Chi tiết số lượng theo từng loại</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getOrderStatusData()} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Số đơn" radius={[6, 6, 0, 0]} barSize={40}>
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
  color: "orange" | "blue" | "emerald" | "amber";
  loading?: boolean;
  description?: string;
}) {
  const colorStyles = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  if (loading) {
    return <Skeleton className="h-36 w-full rounded-2xl" />;
  }

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 group-hover:text-orange-600 transition-colors">
              {value}
            </h3>
          </div>
          <div className={cn("p-3 rounded-xl", colorStyles[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WalletDetailItem({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: any;
  className?: string;
}) {
  return (
    <div className={cn("p-4 rounded-xl border flex items-center gap-4", className)}>
      <div className="h-10 w-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 opacity-80" />
      </div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

// Custom Tooltip for Recharts để đẹp hơn
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl text-sm">
        <p className="font-medium text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-semibold text-slate-700">
              {typeof entry.value === 'number' && entry.value > 1000
                ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(entry.value)
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
  <div className="h-full flex flex-col items-center justify-center text-slate-400">
    <div className="bg-slate-50 p-4 rounded-full mb-3">
      <BarChart3 className="h-8 w-8 opacity-50" />
    </div>
    <p className="text-sm font-medium">Không có dữ liệu hiển thị</p>
  </div>
);