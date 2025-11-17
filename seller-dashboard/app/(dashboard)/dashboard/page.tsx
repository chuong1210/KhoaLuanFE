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
} from "recharts";

const CHART_COLORS = ["#FF6A00", "#FF8A33", "#FFB38A", "#FFB000", "#E65100"];

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Fetch overview data
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["shopOverview", dateRange],
    queryFn: () =>
      analyticsService.getShopOverview(dateRange.start, dateRange.end),
  });

  // Fetch wallet summary
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["walletSummary"],
    queryFn: analyticsService.getWalletSummary,
  });

  // Fetch revenue timeseries
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueTimeseries", dateRange],
    queryFn: () =>
      analyticsService.getRevenueTimeseries(dateRange.start, dateRange.end),
  });

  // Fetch orders for status distribution
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shopOrders", dateRange],
    queryFn: () =>
      analyticsService.getShopOrders(
        undefined,
        dateRange.start,
        dateRange.end,
        100,
        0
      ),
  });

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

  // Calculate order status distribution
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Thống kê & Phân tích
          </h2>
          <p className="text-gray-600 mt-1">
            Theo dõi hiệu suất kinh doanh của cửa hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="border rounded px-3 py-2 text-sm"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="hover:bg-[#FFF0E0]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu (GMV)"
          value={formatPrice(overview?.total_gmv || 0)}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)"
          loading={overviewLoading}
        />
        <StatCard
          title="Doanh thu ròng"
          value={formatPrice(overview?.total_net_revenue || 0)}
          icon={DollarSign}
          gradient="linear-gradient(135deg, #FF8A33 0%, #FFB38A 100%)"
          loading={overviewLoading}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={overview?.total_orders || 0}
          icon={ShoppingCart}
          gradient="linear-gradient(135deg, #FFB000 0%, #FFB38A 100%)"
          loading={overviewLoading}
        />
        <StatCard
          title="Đơn đang xử lý"
          value={overview?.processing_orders || 0}
          icon={Package}
          gradient="linear-gradient(135deg, #E65100 0%, #FF6A00 100%)"
          loading={overviewLoading}
        />
      </div>

      {/* Wallet Summary */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: "#E65100" }}
          >
            <Wallet className="h-5 w-5" />
            Tổng quan ví
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <WalletItem
                label="Số dư khả dụng"
                value={formatPrice(wallet?.balance || 0)}
                color="#4CAF50"
              />
              <WalletItem
                label="Số dư chờ quyết toán"
                value={formatPrice(wallet?.pending_balance || 0)}
                color="#FFB000"
              />
              <WalletItem
                label="Tổng đã quyết toán"
                value={formatPrice(wallet?.total_settled_revenue || 0)}
                color="#FF6A00"
              />
              <WalletItem
                label="Tổng đang giữ"
                value={formatPrice(wallet?.total_funds_held || 0)}
                color="#FF8A33"
              />
              <WalletItem
                label="Đã rút"
                value={formatPrice(wallet?.total_withdrawn || 0)}
                color="#E65100"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="revenue">
            <BarChart3 className="h-4 w-4 mr-2" />
            Biểu đồ doanh thu
          </TabsTrigger>
          <TabsTrigger value="orders">
            <PieChart className="h-4 w-4 mr-2" />
            Phân bổ đơn hàng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle style={{ color: "#E65100" }}>
                Doanh thu theo thời gian
              </CardTitle>
              <CardDescription>
                Theo dõi GMV và doanh thu ròng trong khoảng thời gian đã chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#666"
                      style={{ fontSize: "12px" }}
                      tickFormatter={formatCompactPrice}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #FFB38A",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => formatPrice(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="gmv"
                      name="GMV"
                      stroke="#FF6A00"
                      strokeWidth={3}
                      dot={{ fill: "#FF6A00", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="net_revenue"
                      name="Doanh thu ròng"
                      stroke="#FFB000"
                      strokeWidth={3}
                      dot={{ fill: "#FFB000", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Không có dữ liệu trong khoảng thời gian này
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle style={{ color: "#E65100" }}>
                  Phân bổ trạng thái đơn hàng
                </CardTitle>
                <CardDescription>
                  Tỷ lệ đơn hàng theo từng trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent as number) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Không có dữ liệu đơn hàng
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle style={{ color: "#E65100" }}>
                  Thống kê đơn hàng
                </CardTitle>
                <CardDescription>
                  Số lượng đơn hàng theo trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : getOrderStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getOrderStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#666"
                        style={{ fontSize: "11px" }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #FFB38A",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" name="Số đơn">
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
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Không có dữ liệu đơn hàng
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  loading,
}: {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  loading?: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-32" />;
  }

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="h-2 w-full" style={{ background: gradient }} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="text-2xl font-bold"
          style={{
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function WalletItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-lg border-l-4"
      style={{
        borderLeftColor: color,
        backgroundColor: `${color}10`,
      }}
    >
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
