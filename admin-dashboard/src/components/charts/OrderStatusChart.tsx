'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface OrderStatusData {
  name: string
  value: number
  color: string
}

interface OrderStatusChartProps {
  data: OrderStatusData[]
  isLoading?: boolean
}

const COLORS = ['#FF6A00', '#FFB000', '#3B82F6', '#22C55E', '#E65100']

export function OrderStatusChart({ data, isLoading }: OrderStatusChartProps) {
  if (isLoading) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-vivid border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-500">
        Không có dữ liệu
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #FFB38A',
            borderRadius: '8px',
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
