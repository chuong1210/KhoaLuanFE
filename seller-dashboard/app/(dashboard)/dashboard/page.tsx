"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Users, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const revenueData = [
  { name: "T1", revenue: 4000000 },
  { name: "T2", revenue: 3000000 },
  { name: "T3", revenue: 5000000 },
  { name: "T4", revenue: 4500000 },
  { name: "T5", revenue: 6000000 },
  { name: "T6", revenue: 5500000 },
  { name: "T7", revenue: 7000000 },
];

const orderStatusData = [
  { name: "Chờ xử lý", value: 12, color: "#FACC15" },
  { name: "Đang xử lý", value: 25, color: "#3B82F6" },
  { name: "Đã giao", value: 45, color: "#22C55E" },
  { name: "Đã hủy", value: 8, color: "#EF4444" },
];

export default function DashboardPage() {
  const router = useRouter();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-muted-foreground">
          Xem tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => router.push("/dashboard/products")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => router.push("/dashboard/orders")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng chờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => router.push("/dashboard/wallet")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125.5M VNĐ</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+18%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => router.push("/dashboard/follows")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Người theo dõi
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 7 tháng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatPrice} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${((percent as number) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/orders")}
          >
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Đơn hàng #ORD{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">
                      Khách hàng: Nguyễn Văn A
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {(Math.random() * 1000000 + 100000).toFixed(0)} VNĐ
                  </p>
                  <p className="text-sm text-muted-foreground">2 giờ trước</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
