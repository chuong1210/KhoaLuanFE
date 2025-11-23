'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { ShopAnalytics } from '@/features/analytics/types'

interface TopShopsChartProps {
  data: ShopAnalytics[]
  isLoading?: boolean
}

export function TopShopsChart({ data, isLoading }: TopShopsChartProps) {
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

  const chartData = data.slice(0, 10).map((shop) => ({
    shop_id: shop.shop_id.length > 10 ? shop.shop_id.slice(0, 10) + '...' : shop.shop_id,
    gmv: shop.total_gmv,
    orders: shop.total_orders,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#FFB38A" opacity={0.3} />
        <XAxis
          type="number"
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
        />
        <YAxis type="category" dataKey="shop_id" stroke="#6B7280" fontSize={11} width={100} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #FFB38A',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [
            name === 'gmv' ? formatCurrency(value) : value,
            name === 'gmv' ? 'GMV' : 'Đơn hàng',
          ]}
        />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6A00" />
            <stop offset="100%" stopColor="#FFB000" />
          </linearGradient>
        </defs>
        <Bar dataKey="gmv" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
