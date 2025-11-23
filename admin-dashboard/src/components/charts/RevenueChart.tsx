'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import type { RevenueTimeseries } from '@/features/analytics/types'

interface RevenueChartProps {
  data: RevenueTimeseries[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-vivid border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        Không có dữ liệu
      </div>
    )
  }

  const chartData = data.map((item) => ({
    ...item,
    date: formatShortDate(item.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFB000" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FFB000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#FFB38A" opacity={0.3} />
        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #FFB38A',
            borderRadius: '8px',
          }}
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Ngày: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="total_gmv"
          name="GMV"
          stroke="#FF6A00"
          fillOpacity={1}
          fill="url(#colorGmv)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="platform_revenue"
          name="Doanh thu"
          stroke="#FFB000"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="platform_profit"
          name="Lợi nhuận"
          stroke="#22C55E"
          fillOpacity={1}
          fill="url(#colorProfit)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
