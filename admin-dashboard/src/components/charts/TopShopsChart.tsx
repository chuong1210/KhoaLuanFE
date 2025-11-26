// components/charts/TopShopsChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Store } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TopShopsChartProps {
  data: Array<{
    shop_id: string;
    total_gmv: number;
    total_orders: number;
  }>;
  isLoading?: boolean;
}

const COLORS = [
  "#FF6A00", // Orange Vivid
  "#FF8A3D", // Orange Warm
  "#FFB000", // Orange Amber
  "#E65100", // Orange Deep
  "#CC5200", // Orange Terracotta
  "#B34700",
  "#993C00",
  "#803200",
  "#662800",
  "#4D1E00",
];

export function TopShopsChart({ data, isLoading }: TopShopsChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
        <Store className="h-12 w-12 mb-2 text-orange-peach" />
        <p>Chưa có dữ liệu shop</p>
      </div>
    );
  }

  // Take top 10 and format data
  const chartData = data.slice(0, 10).map((shop, index) => ({
    name: `Shop ${shop.shop_id.slice(0, 8)}`,
    fullId: shop.shop_id,
    gmv: shop.total_gmv,
    orders: shop.total_orders,
    rank: index + 1,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-orange-peach/20">
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-4 w-4 text-orange-vivid" />
            <p className="font-semibold text-gray-800">
              {payload[0].payload.fullId}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              GMV:{" "}
              <span className="font-bold text-orange-vivid">
                {formatCurrency(payload[0].value)}
              </span>
            </p>
            <p className="text-gray-600">
              Đơn hàng:{" "}
              <span className="font-semibold">{payload[0].payload.orders}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#FFF4E6"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#9CA3AF"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(1)}M`
                : value >= 1000
                ? `${(value / 1000).toFixed(0)}K`
                : value.toString()
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="gmv" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top 3 Highlights */}
      <div className="grid grid-cols-3 gap-2">
        {chartData.slice(0, 3).map((shop, index) => (
          <div
            key={shop.fullId}
            className={cn(
              "p-3 rounded-lg text-center",
              index === 0 &&
                "bg-gradient-to-br from-orange-vivid to-orange-warm text-white",
              index === 1 &&
                "bg-gradient-to-br from-orange-warm to-orange-amber text-white",
              index === 2 &&
                "bg-gradient-to-br from-orange-amber to-orange-peach text-white"
            )}
          >
            <div className="text-2xl font-bold mb-1">#{index + 1}</div>
            <div className="text-xs opacity-90 mb-1 truncate">
              {shop.fullId}
            </div>
            <div className="text-sm font-semibold">
              {formatCurrency(shop.gmv)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
