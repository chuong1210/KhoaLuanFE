"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Store,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OrderStatusChart } from "@/components/charts/OrderStatusChart";
import { TopShopsChart } from "@/components/charts/TopShopsChart";
import {
  usePlatformOverview,
  useRevenueTimeseries,
  usePlatformShops,
} from "@/features/analytics/hooks/useAnalytics";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-orange-vivid",
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="stats-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stats-card hover:shadow-orange-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {change !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-sm",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(change)}% so với kỳ trước</span>
              </div>
            )}
          </div>
          <div
            className={cn("p-3 rounded-full bg-gradient-soft-glow", iconColor)}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock order status data - replace with actual data
const orderStatusData = [
  { name: "Chờ xử lý", value: 45, color: "#FFB000" },
  { name: "Đang xử lý", value: 120, color: "#FF6A00" },
  { name: "Đang giao", value: 80, color: "#3B82F6" },
  { name: "Hoàn thành", value: 350, color: "#22C55E" },
  { name: "Đã hủy", value: 25, color: "#E65100" },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("7days");

  // Calculate date range
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(
    dateRange === "7days"
      ? subDays(new Date(), 7)
      : dateRange === "30days"
      ? subDays(new Date(), 30)
      : subDays(new Date(), 90),
    "yyyy-MM-dd"
  );

  const dateParams = { start_date: startDate, end_date: endDate };

  // Fetch data
  const { data: overview, isLoading: overviewLoading } =
    usePlatformOverview(dateParams);
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueTimeseries(dateParams);
  const { data: shopsData, isLoading: shopsLoading } = usePlatformShops({
    limit: 10,
  });

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="90days">90 ngày qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng GMV"
          value={formatCurrency(overview?.total_gmv || 0)}
          change={12.5}
          icon={DollarSign}
          iconColor="text-orange-vivid"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={formatNumber(overview?.total_orders || 0)}
          change={8.2}
          icon={ShoppingCart}
          iconColor="text-orange-warm"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Doanh Thu Sàn"
          value={formatCurrency(overview?.total_platform_revenue || 0)}
          change={-3.1}
          icon={Wallet}
          iconColor="text-orange-amber"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Tổng Cửa Hàng"
          value={formatNumber(overview?.total_shops || 0)}
          change={5.7}
          icon={Store}
          iconColor="text-orange-terracotta"
          isLoading={overviewLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-vivid" />
              Biểu đồ Doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData || []} isLoading={revenueLoading} />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-vivid" />
              Trạng thái Đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={orderStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-vivid" />
              Top Cửa hàng
            </CardTitle>
            <Badge variant="processing">Top 10</Badge>
          </CardHeader>
          <CardContent>
            <TopShopsChart data={shopsData || []} isLoading={shopsLoading} />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-vivid" />
              Hoạt động Gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Đơn hàng mới #ORD-12345",
                  time: "2 phút trước",
                  type: "order",
                },
                {
                  title: 'Shop "Fashion Store" đăng ký',
                  time: "15 phút trước",
                  type: "shop",
                },
                {
                  title: "Sản phẩm mới được duyệt",
                  time: "1 giờ trước",
                  type: "product",
                },
                {
                  title: "Thanh toán hoàn tất #TXN-67890",
                  time: "2 giờ trước",
                  type: "payment",
                },
                {
                  title: "Voucher SALE20 được sử dụng",
                  time: "3 giờ trước",
                  type: "voucher",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-apricot/30 transition-colors"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "order" && "bg-orange-vivid",
                      activity.type === "shop" && "bg-blue-500",
                      activity.type === "product" && "bg-green-500",
                      activity.type === "payment" && "bg-orange-amber",
                      activity.type === "voucher" && "bg-purple-500"
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
