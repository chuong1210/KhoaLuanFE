"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopAnalyticsService } from "@/services/shop-analytics-service";
import { productService } from "@/services/product-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Package,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  Target,
  Activity,
  Percent,
  Star,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AnalyticsFilters } from "@/types/shop-analytics";

const COLOR_PALETTE = {
  primary: "#FF6B35",
  secondary: "#FFB347",
  success: "#66BB6A",
  info: "#42A5F5",
  warning: "#FFA726",
  charts: ["#FF6B35", "#66BB6A", "#42A5F5", "#FFA726", "#7E57C2"],
};

export default function ProductAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    days: 30,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Fetch product details
  const { data: productDetail } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductDetail(id),
  });

  // Fetch product analytics
  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["productAnalytics", id, filters],
    queryFn: () => shopAnalyticsService.getProductAnalytics(id, filters),
  });

  // Format functions
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

  const getImageUrl = (fileName: string | null | undefined): string => {
    if (!fileName) return "/placeholder-image.jpg";
    if (fileName.startsWith("http")) return fileName;
    return `http://localhost:9001/v1/media/${fileName}`;
  };

  // Quick filter handlers
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
    if (!analytics) {
      toast.error("Chưa có dữ liệu để xuất");
      return;
    }

    try {
      import("xlsx").then((XLSX) => {
        const wb = XLSX.utils.book_new();

        const summaryData = [
          ["BÁO CÁO CHI TIẾT HIỆU QUẢ SẢN PHẨM"],
          [`Mã sản phẩm: ${analytics.product_id}`],
          [`Thời gian: ${analytics.period.start} - ${analytics.period.end}`],
          [],
          ["THÔNG TIN SẢN PHẨM"],
          ["Danh mục", analytics.info.category_id],
          ["Giá hiện tại", formatPrice(analytics.info.current_price)],
          ["Đánh giá", analytics.info.rating.toFixed(1)],
          [
            "Tổng lượt xem 30 ngày",
            formatNumber(analytics.info.total_views_30d),
          ],
          [],
          ["CHỈ SỐ HIỆU QUẢ"],
          ["Chỉ số", "Giá trị"],
          ["Tổng lượt xem", formatNumber(analytics.summary.views)],
          ["Tổng lượt click", formatNumber(analytics.summary.total_clicks)],
          ["Lượt thêm giỏ hàng", formatNumber(analytics.summary.add_to_carts)],
          ["Đơn hàng", formatNumber(analytics.summary.orders)],
          ["Click từ tìm kiếm", formatNumber(analytics.summary.search_clicks)],
          ["Doanh thu", formatPrice(analytics.summary.revenue)],
          ["CTR (%)", formatPercent(analytics.summary.ctr)],
          ["Tỷ lệ thêm giỏ (%)", formatPercent(analytics.summary.cart_rate)],
          [
            "Tỷ lệ chuyển đổi (%)",
            formatPercent(analytics.summary.conversion_rate),
          ],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary["!cols"] = [{ wch: 30 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");

        if (analytics.trend_chart && analytics.trend_chart.length > 0) {
          const trendData = [
            ["XU HƯỚNG THEO NGÀY"],
            [],
            ["Ngày", "Lượt xem", "Thêm giỏ", "Đơn hàng", "Doanh thu"],
            ...analytics.trend_chart.map((item) => [
              item.date,
              item.views,
              item.carts,
              item.orders,
              item.revenue,
            ]),
          ];

          const wsTrend = XLSX.utils.aoa_to_sheet(trendData);
          wsTrend["!cols"] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
          ];
          XLSX.utils.book_append_sheet(wb, wsTrend, "Xu hướng");
        }

        const today = new Date().toISOString().split("T")[0];
        const filename = `Thong_Ke_San_Pham_${id.slice(0, 8)}_${today}.xlsx`;
        XLSX.writeFile(wb, filename);

        toast.success("Xuất báo cáo thành công!", {
          description: `File ${filename} đã được tải xuống`,
        });
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất báo cáo");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-orange-50/50 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-linear-to-br from-orange-50 to-white">
        <Alert
          variant="destructive"
          className="max-w-lg border-2 border-red-200 shadow-xl"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Không thể tải dữ liệu
          </AlertTitle>
          <AlertDescription className="text-base">
            Không tìm thấy thống kê cho sản phẩm này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Prepare radar chart data for performance metrics
  const radarData = [
    {
      metric: "Lượt xem",
      value: Math.min((analytics.summary.views / 1000) * 100, 100),
      fullMark: 100,
    },
    {
      metric: "CTR",
      value: analytics.summary.ctr,
      fullMark: 100,
    },
    {
      metric: "Tỷ lệ giỏ",
      value: analytics.summary.cart_rate,
      fullMark: 100,
    },
    {
      metric: "Chuyển đổi",
      value: analytics.summary.conversion_rate * 10,
      fullMark: 100,
    },
    {
      metric: "Đánh giá",
      value: (analytics.info.rating / 5) * 100,
      fullMark: 100,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/50 via-white to-orange-50/30 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35] via-[#FF8C61] to-[#FFB347]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-12 w-12 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-xl">
                  <BarChart3 className="h-9 w-9 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Chi tiết Sản phẩm
                  </h1>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <Sparkles className="h-5 w-5 text-yellow-200 animate-pulse" />
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg font-medium">
                  Phân tích hiệu suất chi tiết của sản phẩm 📈
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRefresh}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold rounded-2xl px-6 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button
                onClick={handleExport}
                size="lg"
                className="bg-white hover:bg-white/95 text-[#fefefe] font-bold rounded-2xl px-6 shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info Card */}
      {productDetail && (
        <Card className="border-2 border-orange-100 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-linear-to-br from-orange-50 to-orange-100">
                <img
                  src={getImageUrl(productDetail.product.image)}
                  alt={productDetail.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-image.jpg";
                  }}
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {productDetail.product.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {productDetail.product.short_description}
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                    <span className="text-xl font-bold text-orange-600">
                      {formatPrice(analytics.info.current_price)}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {analytics.info.rating.toFixed(1)}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-gray-700">
                      {formatNumber(analytics.info.total_views_30d)} lượt xem
                      (30d)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Filters */}
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
                  {`${analytics.period.start} - ${analytics.period.end}`}
                </p>
              </div>
            </div>

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
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Lượt xem"
          value={formatNumber(analytics.summary.views)}
          icon={Eye}
          gradient="from-blue-400 to-blue-600"
          subtitle="Tổng lượt truy cập"
        />
        <MetricCard
          title="CTR"
          value={formatPercent(analytics.summary.ctr)}
          icon={MousePointerClick}
          gradient="from-purple-400 to-purple-600"
          subtitle="Click Through Rate"
        />
        <MetricCard
          title="Tỷ lệ thêm giỏ"
          value={formatPercent(analytics.summary.cart_rate)}
          icon={ShoppingCart}
          gradient="from-green-400 to-green-600"
          subtitle="Add to Cart Rate"
          highlight
        />
        <MetricCard
          title="Chuyển đổi"
          value={formatPercent(analytics.summary.conversion_rate)}
          icon={Target}
          gradient="from-orange-400 to-orange-600"
          subtitle="Conversion Rate"
          highlight
        />
      </div>

      {/* Performance & Revenue Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Card */}
        <Card className="lg:col-span-1 overflow-hidden border-0 shadow-2xl">
          <div className="bg-linear-to-br from-[#FF6A00] via-[#FF8533] to-[#FFB000] p-6 md:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <p className="text-white/90 font-medium">Doanh thu</p>
                </div>
                <TrendingUp className="h-5 w-5" />
              </div>

              <p className="text-sm text-white/70 mb-2">Tổng thu từ SP này</p>
              <h2 className="text-4xl font-bold mb-8">
                {formatCompactPrice(analytics.summary.revenue)}đ
              </h2>

              <div className="space-y-3 border-t border-white/20 pt-4">
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm">Đơn hàng</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.summary.orders)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm">Từ tìm kiếm</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.summary.search_clicks)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Radar */}
        <Card className="lg:col-span-2 border-2 border-orange-100 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Hiệu suất tổng quan</CardTitle>
                <CardDescription>Đánh giá đa chiều về sản phẩm</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#FFB38A" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Hiệu suất"
                  dataKey="value"
                  stroke="#FF6B35"
                  fill="#FF6B35"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-[#FF6A00]" />
            </div>
            <div>
              <CardTitle className="text-xl">Xu hướng hiệu suất</CardTitle>
              <CardDescription className="mt-1">
                Theo dõi từng chỉ số theo ngày
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {analytics.trend_chart && analytics.trend_chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.trend_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={50} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="👁️ Lượt xem"
                  stroke="#42A5F5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="carts"
                  name="🛒 Thêm giỏ"
                  stroke="#66BB6A"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="📦 Đơn hàng"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Chưa có dữ liệu xu hướng" />
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-orange-600" />
            Chỉ số chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <DetailMetric
              label="Tổng lượt click"
              value={formatNumber(analytics.summary.total_clicks)}
              color="blue"
            />
            <DetailMetric
              label="Lượt thêm giỏ hàng"
              value={formatNumber(analytics.summary.add_to_carts)}
              color="green"
            />
            <DetailMetric
              label="Click từ tìm kiếm"
              value={formatNumber(analytics.summary.search_clicks)}
              color="purple"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Subcomponents
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  gradient: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer ${
        highlight ? "ring-2 ring-orange-300" : ""
      }`}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${gradient}`}
      />

      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`relative p-4 rounded-2xl shadow-lg bg-linear-to-br ${gradient}`}
          >
            <Icon className="h-7 w-7 text-white" />
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

function DetailMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorStyles = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div
      className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
        colorStyles[color as keyof typeof colorStyles]
      }`}
    >
      <p className="text-sm opacity-80 mb-2">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
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
              {typeof entry.value === "number"
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
  </div>
);
