"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopAnalyticsService } from "@/services/shop-analytics-service";
import { productService } from "@/services/product-service"; // Import Product Service
import { useAppSelector } from "@/store/hooks";
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
  Eye,
  MousePointerClick,
  ShoppingCart,
  Package,
  Activity,
  Award,
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import type { AnalyticsFilters, TopProduct } from "@/types/shop-analytics";
import Image from "next/image"; // Import Image từ Next.js

// ... (Giữ nguyên các hàm formatNumber, formatPrice, formatCompactPrice, formatPercent)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatCompactPrice = (price: number) => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
  return price.toString();
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

const formatPercent = (num: number) => {
  return `${num.toFixed(1)}%`;
};

// --------------------------------------------------------
// COMPONENT MỚI: TopProductItem
// Nhiệm vụ: Nhận vào thông tin thống kê (ID, doanh thu...)
// và tự gọi API lấy chi tiết sản phẩm (Tên, Ảnh) để hiển thị
// --------------------------------------------------------
const TopProductItem = ({
  product,
  index,
}: {
  product: TopProduct;
  index: number;
}) => {
  // Fetch chi tiết sản phẩm dựa trên ID
  const { data: productDetail, isLoading } = useQuery({
    queryKey: ["product", product.product_id],
    queryFn: () => productService.getProductDetail(product.product_id),
    staleTime: 1000 * 60 * 5, // Cache 5 phút để tránh gọi lại nhiều lần
  });

  // Lấy URL ảnh sử dụng helper từ service
  const imageUrl = productService.getImageUrl(productDetail?.product.image);

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-linear-to-r from-white to-orange-50/30 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all">
      {/* Ranking Badge */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white text-lg shadow-lg ${
          index === 0
            ? "bg-linear-to-br from-yellow-400 to-yellow-600"
            : index === 1
            ? "bg-linear-to-br from-gray-300 to-gray-500"
            : index === 2
            ? "bg-linear-to-br from-orange-400 to-orange-600"
            : "bg-linear-to-br from-orange-300 to-orange-400"
        }`}
      >
        {index + 1}
      </div>

      {/* Product Image */}
      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            src={imageUrl}
            alt={productDetail?.product.name || "Product Image"}
            fill
            className="object-cover"
            sizes="64px"
          />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <Skeleton className="h-5 w-3/4 mb-2" />
        ) : (
          <p
            className="font-bold text-gray-900 mb-1 truncate"
            title={productDetail?.product.name}
          >
            {productDetail?.product.name ||
              `Sản phẩm #${product.product_id.slice(0, 8)}`}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-blue-500" />
            {formatNumber(product.views)} view
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-green-500" />
            {formatNumber(product.orders)} sold
          </span>
          {/* Hiển thị thêm giá gốc nếu muốn */}
          {!isLoading && productDetail && (
            <span className="text-gray-400 text-xs hidden sm:inline-block">
              Giá: {formatCompactPrice(productDetail.product.min_price)}đ -{" "}
              {formatCompactPrice(productDetail.product.max_price)}đ
            </span>
          )}
        </div>
      </div>

      {/* Revenue */}
      <div className="text-right shrink-0">
        <p className="text-sm text-gray-500 mb-0.5">Doanh thu</p>
        <p className="text-lg md:text-xl font-bold bg-linear-to-r from-[#FF6A00] to-[#FFB000] bg-clip-text text-transparent">
          {formatCompactPrice(product.revenue)}đ
        </p>
      </div>
    </div>
  );
};

export default function ShopAnalyticsPage() {
  const shopId = useAppSelector((state) => state.shop.data?.id);
  // ... (Giữ nguyên logic state filters, selectedPeriod)
  const [filters, setFilters] = useState<AnalyticsFilters>({
    days: 30,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "custom"
  >("30d");

  // Fetch shop analytics
  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["shopAnalytics", shopId, filters],
    queryFn: () => shopAnalyticsService.getShopAnalytics(shopId!, filters),
    enabled: !!shopId,
  });

  // ... (Giữ nguyên các hàm handleQuickFilter, handleRefresh, handleExport)
  const handleQuickFilter = (period: "7d" | "30d" | "90d") => {
    setSelectedPeriod(period);
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    setFilters({ days: daysMap[period] });
    toast.success(`Đã chọn ${daysMap[period]} ngày gần đây`);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Đã làm mới dữ liệu");
  };

  const handleExport = () => {
    // ... (Logic export giữ nguyên)
    if (!analytics) {
      toast.error("Chưa có dữ liệu để xuất");
      return;
    }
    toast.info("Chức năng xuất báo cáo đang được xử lý...");
  };

  if (!shopId) {
    // ... (Giữ nguyên UI empty state)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-white p-6">
        <Card className="max-w-md border-2 border-orange-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <Activity className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy Shop
            </h3>
            <p className="text-gray-600">
              Vui lòng đăng ký shop hoặc đăng nhập
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/50 via-white to-orange-50/30 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ... (Phần Header và Filter Date Range giữ nguyên) ... */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35] via-[#FF8C61] to-[#FFB347]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-900/20 rounded-full blur-2xl -ml-20 -mb-20" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-xl">
                  <BarChart3 className="h-9 w-9 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Thống kê Hiệu quả
                  </h1>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <Sparkles className="h-5 w-5 text-yellow-200 animate-pulse" />
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg font-medium">
                  Theo dõi chi tiết hiệu suất kinh doanh của shop 📊
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRefresh}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl px-6 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
              </Button>
              <Button
                onClick={handleExport}
                size="lg"
                className="bg-white hover:bg-white/95 text-[#ffffff] font-bold rounded-2xl px-6 shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" /> Tải báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card className="border-0 shadow-lg bg-linear-to-br from-white to-orange-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
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
                  {analytics
                    ? `${analytics.period.start} - ${analytics.period.end}`
                    : "Chọn để xem báo cáo"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2 p-1.5 bg-white rounded-xl border-2 border-orange-100 shadow-sm">
                {[
                  { label: "7 ngày", value: "7d" },
                  { label: "30 ngày", value: "30d" },
                  { label: "90 ngày", value: "90d" },
                ].map((period) => (
                  <Button
                    key={period.value}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleQuickFilter(period.value as "7d" | "30d" | "90d")
                    }
                    className={`rounded-lg font-semibold transition-all duration-300 ${
                      selectedPeriod === period.value
                        ? "bg-linear-to-r from-orange-400 to-orange-500 text-white"
                        : "hover:bg-linear-to-r hover:from-orange-400 hover:to-orange-500 hover:text-white"
                    }`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* ... (Phần Key Metrics và Revenue Cards giữ nguyên) ... */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Lượt xem"
              value={formatNumber(analytics.summary.views)}
              icon={Eye}
              gradient="from-blue-400 to-blue-600"
              subtitle="Tổng lượt truy cập"
            />
            <MetricCard
              title="Lượt click"
              value={formatNumber(analytics.summary.total_clicks)}
              icon={MousePointerClick}
              gradient="from-purple-400 to-purple-600"
              subtitle="Click vào sản phẩm"
            />
            <MetricCard
              title="Thêm giỏ hàng"
              value={formatNumber(analytics.summary.add_to_carts)}
              icon={ShoppingCart}
              gradient="from-green-400 to-green-600"
              subtitle="Sản phẩm được thêm"
            />
            <MetricCard
              title="Đơn hàng"
              value={formatNumber(analytics.summary.orders)}
              icon={Package}
              gradient="from-orange-400 to-orange-600"
              subtitle="Thành công"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 overflow-hidden border-0 shadow-2xl">
              <div className="bg-linear-to-br from-[#FF6A00] via-[#FF8533] to-[#FFB000] p-6 md:p-8 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <p className="text-white/90 font-medium">Doanh thu</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="text-sm text-white/70 mb-2">Tổng thu nhập</p>
                  <h2 className="text-4xl font-bold mb-8">
                    {formatCompactPrice(analytics.summary.revenue)}đ
                  </h2>

                  <div className="space-y-3 border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">Từ tìm kiếm</span>
                      <span className="font-semibold">
                        {formatNumber(analytics.summary.search_clicks)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-2 border-2 border-orange-100 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Tỷ lệ chuyển đổi</CardTitle>
                    <CardDescription>
                      Hiệu quả biến khách thăm thành đơn hàng
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-linear-to-r from-orange-50 to-orange-100/30">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Tỷ lệ chuyển đổi tổng
                      </p>
                      <p className="text-4xl font-bold text-orange-600">
                        {formatPercent(analytics.summary.conversion_rate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">CTR</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatPercent(
                          (analytics.summary.total_clicks /
                            analytics.summary.views) *
                            100
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-xs text-green-700 mb-1">
                        Tỷ lệ thêm giỏ
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {formatPercent(
                          (analytics.summary.add_to_carts /
                            analytics.summary.views) *
                            100
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-xs text-blue-700 mb-1">
                        Tỷ lệ mua hàng
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPercent(
                          (analytics.summary.orders /
                            analytics.summary.add_to_carts) *
                            100
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trend" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="bg-white border-2 border-orange-100 p-1.5 rounded-xl shadow-sm">
                <TabsTrigger
                  value="trend"
                  className="rounded-lg px-6 py-3 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#FF6A00] data-[state=active]:to-[#FF8533] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Xu hướng
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="rounded-lg px-6 py-3 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#FF6A00] data-[state=active]:to-[#FF8533] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Top sản phẩm
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Trend Chart Content - Giữ nguyên */}
            <TabsContent value="trend">
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-5 w-5 text-[#FF6A00]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Biểu đồ xu hướng
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Theo dõi hiệu suất theo từng ngày
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analytics.trend_chart && analytics.trend_chart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={analytics.trend_chart}>
                        <defs>
                          <linearGradient
                            id="colorViews"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#42A5F5"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#42A5F5"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorOrders"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
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
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          height={50}
                          iconType="circle"
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          name="👁️ Lượt xem"
                          stroke="#42A5F5"
                          strokeWidth={3}
                          fill="url(#colorViews)"
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          name="📦 Đơn hàng"
                          stroke="#FF6B35"
                          strokeWidth={3}
                          fill="url(#colorOrders)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState message="Chưa có dữ liệu xu hướng" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Products Content - SỬA ĐỔI TẠI ĐÂY */}
            <TabsContent value="products">
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Award className="h-5 w-5 text-[#FF6A00]" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Top 10 sản phẩm bán chạy
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Xếp hạng theo doanh thu
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analytics.top_products &&
                  analytics.top_products.length > 0 ? (
                    <div className="space-y-3">
                      {/* Thay thế vòng lặp cũ bằng component TopProductItem */}
                      {analytics.top_products.map((product, index) => (
                        <TopProductItem
                          key={product.product_id}
                          product={product}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Chưa có dữ liệu sản phẩm" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <EmptyState message="Không có dữ liệu thống kê" />
      )}
    </div>
  );
}

// Subcomponents: MetricCard, CustomTooltip, EmptyState (Giữ nguyên như code cũ)
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  gradient: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
      <div
        className={`absolute inset-0 bg-linear-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${gradient}`}
      />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-linear-to-br from-orange-200/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <div
              className={`relative p-4 rounded-2xl shadow-lg bg-linear-to-br ${gradient}`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

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
                ? new Intl.NumberFormat("vi-VN").format(entry.value)
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
      <Activity className="h-12 w-12 text-gray-300" />
    </div>
    <p className="text-base font-medium text-gray-600">
      {message || "Không có dữ liệu"}
    </p>
    <p className="text-sm text-gray-400 mt-1">Thử chọn khoảng thời gian khác</p>
  </div>
);
