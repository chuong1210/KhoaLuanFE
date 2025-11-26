"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Store,
  Users,
  Ticket,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopShopsChart } from "@/components/charts/TopShopsChart";
import {
  usePlatformOverview,
  useRevenueTimeseries,
  usePlatformShops,
  useVoucherPerformance,
} from "@/features/analytics/hooks/useAnalytics";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import {
  exportAnalyticsOverview,
  exportRevenueTimeseries,
  exportTopShops,
  exportVoucherPerformance,
  exportAnalyticsComprehensive,
} from "@/lib/excel-export";
import { toast } from "sonner";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number;
  icon: React.ElementType;
  color?: string;
  isLoading?: boolean;
}

function MetricCard({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  color = "orange",
  isLoading,
}: MetricCardProps) {
  const colorClasses = {
    orange: "from-orange-vivid to-orange-warm",
    green: "from-green-500 to-green-400",
    blue: "from-blue-500 to-blue-400",
    purple: "from-purple-500 to-purple-400",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        <div
          className={cn(
            "p-6 bg-gradient-to-br text-white",
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subValue && (
                <p className="text-sm opacity-75 mt-1">{subValue}</p>
              )}
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-3 text-sm">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}% so với kỳ trước</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("revenue");

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

  const { data: overview, isLoading: overviewLoading } =
    usePlatformOverview(dateParams);
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueTimeseries(dateParams);
  const { data: shopsData, isLoading: shopsLoading } = usePlatformShops({
    limit: 20,
  });
  const { data: voucherPerf, isLoading: voucherLoading } =
    useVoucherPerformance(dateParams);

  // Export handlers
  const handleExportOverview = () => {
    if (!overview) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    exportAnalyticsOverview(overview, dateRange);
    toast.success("Xuất tổng quan thành công!");
  };

  const handleExportRevenue = () => {
    if (!revenueData || revenueData.length === 0) {
      toast.error("Không có dữ liệu doanh thu");
      return;
    }
    exportRevenueTimeseries(revenueData, dateRange);
    toast.success("Xuất dữ liệu doanh thu thành công!");
  };

  const handleExportShops = () => {
    if (!shopsData || shopsData.length === 0) {
      toast.error("Không có dữ liệu shop");
      return;
    }
    exportTopShops(shopsData);
    toast.success("Xuất dữ liệu shop thành công!");
  };

  const handleExportVouchers = () => {
    if (!voucherPerf) {
      toast.error("Không có dữ liệu voucher");
      return;
    }
    exportVoucherPerformance(voucherPerf, dateRange);
    toast.success("Xuất dữ liệu voucher thành công!");
  };

  const handleExportAll = () => {
    if (!overview && !revenueData && !shopsData && !voucherPerf) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    exportAnalyticsComprehensive(
      overview || null,
      revenueData || [],
      shopsData || [],
      voucherPerf || null,
      dateRange
    );
    toast.success("Xuất báo cáo tổng hợp thành công!");
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-orange-vivid" />
            Phân tích & Thống kê
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi hiệu suất kinh doanh của sàn thương mại điện tử
          </p>
        </div>
        <div className="flex gap-2">
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

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportOverview}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-vivid" />
                Xuất Tổng quan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRevenue}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Xuất Doanh thu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportShops}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                Xuất Top Shops
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportVouchers}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-purple-600" />
                Xuất Voucher
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExportAll}
                className="font-medium"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-deep" />
                Xuất Tổng hợp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng GMV"
          value={formatCurrency(overview?.total_gmv || 0)}
          change={15.3}
          icon={DollarSign}
          color="orange"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Doanh thu Sàn"
          value={formatCurrency(overview?.total_platform_revenue || 0)}
          change={8.7}
          icon={TrendingUp}
          color="green"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Tổng đơn hàng"
          value={formatNumber(overview?.total_orders || 0)}
          change={12.1}
          icon={ShoppingCart}
          color="blue"
          isLoading={overviewLoading}
        />
        <MetricCard
          title="Lợi nhuận Sàn"
          value={formatCurrency(overview?.platform_profit || 0)}
          subValue={
            overview?.platform_profit && overview.platform_profit < 0
              ? "Chi phí vượt doanh thu"
              : undefined
          }
          change={
            overview?.platform_profit && overview.platform_profit < 0
              ? -5.2
              : 10.5
          }
          icon={Store}
          color="purple"
          isLoading={overviewLoading}
        />
      </div>

      {/* Tabs for different analytics views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="shops">Cửa hàng</TabsTrigger>
            <TabsTrigger value="vouchers">Voucher</TabsTrigger>
          </TabsList>

          {/* Quick Export for Active Tab */}
          {activeTab === "revenue" && revenueData && revenueData.length > 0 && (
            <Button onClick={handleExportRevenue} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          )}
          {activeTab === "shops" && shopsData && shopsData.length > 0 && (
            <Button onClick={handleExportShops} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          )}
          {activeTab === "vouchers" && voucherPerf && (
            <Button onClick={handleExportVouchers} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          )}
        </div>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-vivid" />
                  Biểu đồ Doanh thu theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart
                  data={revenueData || []}
                  isLoading={revenueLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tổng quan Tài chính</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overviewLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-gradient-soft-glow">
                      <p className="text-sm text-gray-500">Tổng GMV</p>
                      <p className="text-xl font-bold text-orange-vivid">
                        {formatCurrency(overview?.total_gmv || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm text-gray-500">Doanh thu Sàn</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(overview?.total_platform_revenue || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50">
                      <p className="text-sm text-gray-500">Chi phí Sàn</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(overview?.total_platform_cost || 0)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-lg",
                        (overview?.platform_profit || 0) >= 0
                          ? "bg-green-50"
                          : "bg-red-50"
                      )}
                    >
                      <p className="text-sm text-gray-500">Lợi nhuận</p>
                      <p
                        className={cn(
                          "text-xl font-bold",
                          (overview?.platform_profit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {formatCurrency(overview?.platform_profit || 0)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-vivid" />
                  Top 10 Cửa hàng theo GMV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopShopsChart
                  data={shopsData || []}
                  isLoading={shopsLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-vivid" />
                  Danh sách Top Shops
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shopsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shopsData?.slice(0, 5).map((shop, index) => (
                      <div
                        key={shop.shop_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-orange-apricot/30 hover:bg-orange-apricot/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                              index === 0 && "bg-gradient-sunrise",
                              index === 1 && "bg-orange-warm",
                              index === 2 && "bg-orange-peach text-gray-800",
                              index > 2 && "bg-gray-200 text-gray-600"
                            )}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">
                              {shop.shop_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {shop.total_orders} đơn hàng
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-vivid text-sm">
                            {formatCurrency(shop.total_gmv)}
                          </p>
                          <ArrowUpRight className="h-4 w-4 text-green-500 inline" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vouchers Tab */}
        <TabsContent value="vouchers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-soft-glow hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-vivid/20 rounded-lg">
                    <Ticket className="h-8 w-8 text-orange-vivid" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng lượt sử dụng</p>
                    <p className="text-2xl font-bold">
                      {voucherLoading
                        ? "-"
                        : formatNumber(
                            voucherPerf?.usage_history_stats
                              .total_usage_count || 0
                          )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-soft-glow hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-vivid/20 rounded-lg">
                    <DollarSign className="h-8 w-8 text-orange-vivid" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng giảm giá</p>
                    <p className="text-2xl font-bold">
                      {voucherLoading
                        ? "-"
                        : formatCurrency(
                            voucherPerf?.usage_history_stats
                              .total_discount_value || 0
                          )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chi phí Ship</p>
                    <p className="text-2xl font-bold text-red-500">
                      {voucherLoading
                        ? "-"
                        : formatCurrency(
                            voucherPerf?.platform_cost_stats
                              .total_shipping_discount_cost || 0
                          )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Tổng chi phí Voucher
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {voucherLoading
                        ? "-"
                        : formatCurrency(voucherPerf?.total_voucher_cost || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voucher Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Chi tiết Chi phí Voucher
              </CardTitle>
            </CardHeader>
            <CardContent>
              {voucherLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Voucher đơn hàng
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        voucherPerf?.platform_cost_stats
                          .total_order_voucher_cost || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Chi phí khuyến mãi
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        voucherPerf?.platform_cost_stats.total_promotion_cost ||
                          0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Giảm giá vận chuyển
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        voucherPerf?.platform_cost_stats
                          .total_shipping_discount_cost || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Trợ giá sản phẩm
                    </span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        voucherPerf?.platform_cost_stats
                          .total_product_subsidy_cost || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-100 border-2 border-red-200">
                    <span className="text-sm font-semibold text-gray-800">
                      Tổng chi phí
                    </span>
                    <span className="font-bold text-xl text-red-600">
                      {formatCurrency(voucherPerf?.total_voucher_cost || 0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
