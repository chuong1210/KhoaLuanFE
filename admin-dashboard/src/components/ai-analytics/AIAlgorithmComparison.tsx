"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Award,
  ArrowUpDown,
  Download,
  Zap,
  DollarSign,
  Activity,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area,
} from "recharts";

// --- TYPES CẬP NHẬT THEO ĐÚNG JSON ---
interface AlgorithmStats {
  algorithm: string;
  impressions: number;
  clicks: number;
  orders: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
}

interface TrendData {
  date: string;
  clicks: number;
  impressions: number;
  revenue: number;
}

interface PerformanceResponse {
  success: boolean;
  summary: {
    clicks: number; // JSON trả về clicks, không phải total_clicks
    conversion_rate: number;
    ctr: number;
    impressions: number;
    orders: number;
    revenue: number;
  };
  by_algorithm: AlgorithmStats[];
  trend_chart: TrendData[]; // Cập nhật đúng cấu trúc JSON
}

// --- CONFIG ---
const ALGORITHM_COLORS: Record<string, string> = {
  personalized: "#FF6A00", // Cam
  similar: "#3B82F6", // Xanh dương
  trending: "#22C55E", // Xanh lá
  cross_sell: "#EC4899", // Hồng (Thêm cái này từ JSON)
  collaborative: "#A855F7", // Tím
  content_based: "#F59E0B", // Vàng
};

const ALGORITHM_NAMES: Record<string, string> = {
  personalized: "Gợi ý Cá nhân hóa",
  similar: "Sản phẩm Tương tự",
  trending: "Xu hướng Hot",
  cross_sell: "Bán chéo (Cross-sell)",
  collaborative: "Lọc Cộng tác",
  content_based: "Dựa trên Nội dung",
};

export function AIAlgorithmComparison() {
  const [dateRange, setDateRange] = useState("30days");
  const [sortBy, setSortBy] = useState<keyof AlgorithmStats>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Calculate date params
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(
    dateRange === "7days"
      ? subDays(new Date(), 7)
      : dateRange === "30days"
      ? subDays(new Date(), 30)
      : subDays(new Date(), 90),
    "yyyy-MM-dd"
  );

  const { data, isLoading } = useQuery({
    queryKey: ["ai-performance", startDate, endDate],
    queryFn: async () => {
      const response = await aiApi.get<PerformanceResponse>(
        `/api/analytics/performance?start_date=${startDate}&end_date=${endDate}`
      );
      return response.data;
    },
  });

  // Sort logic
  const sortedAlgorithms = data?.by_algorithm
    ? [...data.by_algorithm].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return sortOrder === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      })
    : [];

  const handleSort = (column: keyof AlgorithmStats) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Pie chart data
  const pieData = sortedAlgorithms.map((algo) => ({
    name: ALGORITHM_NAMES[algo.algorithm] || algo.algorithm,
    value: algo.revenue,
    color: ALGORITHM_COLORS[algo.algorithm] || "#94A3B8",
  }));

  const bestAlgo = sortedAlgorithms[0];
  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Hiệu Quả Gợi Ý AI (A/B Testing)
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            So sánh hiệu suất các mô hình gợi ý và theo dõi doanh thu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Impressions"
          value={summary?.impressions}
          icon={Eye}
          color="blue"
          sub="Lượt hiển thị"
        />
        <SummaryCard
          title="Total Clicks"
          value={summary?.clicks}
          icon={MousePointerClick}
          color="purple"
          sub={`CTR: ${summary?.ctr.toFixed(2)}%`}
        />
        <SummaryCard
          title="Total Orders"
          value={summary?.orders}
          icon={ShoppingCart}
          color="green"
          sub={`CVR: ${summary?.conversion_rate.toFixed(2)}%`}
        />
        <SummaryCard
          title="Total Revenue"
          value={summary?.revenue}
          isCurrency
          icon={DollarSign}
          color="orange"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg"
          iconClassName="text-white/80"
          textClassName="text-white"
          subClassName="text-white/80"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT: BEST PERFORMER & PIE CHART --- */}
        <div className="space-y-6 lg:col-span-1">
          {/* Best Performer Card */}
          {bestAlgo && (
            <Card className="overflow-hidden border-l-4 border-l-yellow-500 shadow-md">
              <CardContent className="p-6 relative">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Award className="h-24 w-24 text-yellow-600" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thuật toán tốt nhất
                    </p>
                    <h3 className="text-lg font-bold text-gray-800">
                      {ALGORITHM_NAMES[bestAlgo.algorithm] ||
                        bestAlgo.algorithm}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Doanh thu</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(bestAlgo.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Chuyển đổi</p>
                    <p className="text-lg font-bold text-green-600">
                      {bestAlgo.conversion_rate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Tỷ trọng Doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60} // Donut chart
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-gray-600 ml-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT: TREND CHART (FIXED) --- */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Xu hướng Tổng hợp
                </CardTitle>
                <CardDescription>
                  Doanh thu và Lượt Click theo thời gian
                </CardDescription>
              </div>
              <Badge variant="active" className="font-normal bg-gray-50">
                Dữ liệu tổng hợp (All Algorithms)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {data?.trend_chart && data.trend_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {/* Sử dụng ComposedChart để vẽ 2 trục Y */}
                  <ComposedChart
                    data={data.trend_chart}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => format(new Date(val), "dd/MM")}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* Trục trái: Doanh thu */}
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* Trục phải: Clicks */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      labelFormatter={(label) =>
                        format(new Date(label), "dd/MM/yyyy")
                      }
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue"
                          ? "Doanh thu"
                          : name === "clicks"
                          ? "Lượt Click"
                          : name,
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    {/* Vẽ Area cho Revenue */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    {/* Vẽ Line cho Clicks */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="clicks"
                      name="clicks"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Chưa có dữ liệu xu hướng
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- BOTTOM: DETAILED TABLE --- */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="py-4 text-base">
            Chi tiết Hiệu suất từng Thuật toán
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Thuật toán</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("impressions")}
                >
                  Impression{" "}
                  {sortBy === "impressions" && (
                    <ArrowUpDown className="inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("clicks")}
                >
                  Clicks{" "}
                  {sortBy === "clicks" && (
                    <ArrowUpDown className="inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("ctr")}
                >
                  CTR{" "}
                  {sortBy === "ctr" && (
                    <ArrowUpDown className="inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("conversion_rate")}
                >
                  CVR{" "}
                  {sortBy === "conversion_rate" && (
                    <ArrowUpDown className="inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("revenue")}
                >
                  Doanh thu{" "}
                  {sortBy === "revenue" && (
                    <ArrowUpDown className="inline h-3 w-3" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAlgorithms.map((algo, index) => (
                <TableRow
                  key={algo.algorithm}
                  className="hover:bg-orange-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{
                          backgroundColor:
                            ALGORITHM_COLORS[algo.algorithm] || "#94A3B8",
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {ALGORITHM_NAMES[algo.algorithm] || algo.algorithm}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] text-green-600 font-bold">
                            TOP 1
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatNumber(algo.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatNumber(algo.clicks)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="active"
                      className={cn(
                        "font-normal",
                        algo.ctr > 20
                          ? "bg-green-50 text-green-700 border-green-200"
                          : ""
                      )}
                    >
                      {algo.ctr.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        algo.conversion_rate > 15
                          ? "text-green-600"
                          : "text-gray-600"
                      )}
                    >
                      {algo.conversion_rate.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-800">
                    {formatCurrency(algo.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// --- HELPER COMPONENT ---
function SummaryCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  className,
  iconClassName,
  textClassName,
  subClassName,
  isCurrency,
}: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className={cn("text-sm font-medium text-gray-500", textClassName)}>
            {title}
          </p>
          <div className={cn("p-2 rounded-lg", colorMap[color], iconClassName)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className={cn("text-2xl font-bold text-gray-800", textClassName)}>
            {value !== undefined ? (
              isCurrency ? (
                formatCurrency(value)
              ) : (
                formatNumber(value)
              )
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
          </h3>
          {sub && (
            <p className={cn("text-xs text-gray-500", subClassName)}>{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
