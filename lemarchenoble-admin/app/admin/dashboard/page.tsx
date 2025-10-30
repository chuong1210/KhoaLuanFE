"use client"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Package, Store, ShoppingCart, Users } from "lucide-react"

const dashboardStats = [
  { title: "Tổng sản phẩm", value: "1,234", icon: Package, color: "bg-blue-500" },
  { title: "Tổng cửa hàng", value: "56", icon: Store, color: "bg-green-500" },
  { title: "Tổng đơn hàng", value: "789", icon: ShoppingCart, color: "bg-yellow-500" },
  { title: "Tổng người dùng", value: "2,345", icon: Users, color: "bg-purple-500" },
]

const chartData = [
  { name: "Jan", sales: 4000, orders: 2400 },
  { name: "Feb", sales: 3000, orders: 1398 },
  { name: "Mar", sales: 2000, orders: 9800 },
  { name: "Apr", sales: 2780, orders: 3908 },
  { name: "May", sales: 1890, orders: 4800 },
  { name: "Jun", sales: 2390, orders: 3800 },
]

export default function DashboardPage() {
  const auth = useSelector((state: RootState) => state.auth)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Chào mừng, {auth.userId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="text-white" size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doanh số bán hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" />
              <Bar dataKey="orders" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
