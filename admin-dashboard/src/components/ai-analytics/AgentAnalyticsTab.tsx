"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAgentAnalytics,
  useAgentTopUsers,
} from "@/features/analytics/hooks/useAnalytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageSquare, Users, BrainCircuit, ShoppingBag } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  dateParams: { start_date: string; end_date: string };
}

const COLORS = [
  "#FF6A00",
  "#3B82F6",
  "#22C55E",
  "#A855F7",
  "#F59E0B",
  "#EF4444",
];

export function AgentAnalyticsTab({ dateParams }: Props) {
  const { overview, volume, topics, intent } = useAgentAnalytics(dateParams);
  const { data: topUsers } = useAgentTopUsers(10);

  if (overview.isLoading)
    return (
      <div className="p-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Tổng Phiên Chat
              </p>
              <p className="text-3xl font-bold text-blue-800">
                {formatNumber(overview.data?.total_sessions || 0)}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-400" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Tin nhắn User
              </p>
              <p className="text-3xl font-bold text-green-800">
                {formatNumber(overview.data?.total_user_messages || 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Tin nhắn Agent
              </p>
              <p className="text-3xl font-bold text-purple-800">
                {formatNumber(overview.data?.total_agent_messages || 0)}
              </p>
            </div>
            <BrainCircuit className="h-8 w-8 text-purple-400" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mật độ tin nhắn theo giờ</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour_of_day"
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="message_count"
                  name="Số tin nhắn"
                  fill="#FF6A00"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Người dùng tích cực</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topUsers?.map((user, idx) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx < 3
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate w-32" title={user.user_id}>
                    {user.user_id}
                  </span>
                </div>
                <span className="font-semibold">{user.message_count} msgs</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân loại Chủ đề (Topics)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topics.data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {topics.data?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ý định mua hàng (Intent)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={intent.data || []}
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" />
                <YAxis dataKey="purchase_intent" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]}>
                  {intent.data?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.purchase_intent === "HIGH"
                          ? "#22C55E"
                          : entry.purchase_intent === "LOW"
                          ? "#9CA3AF"
                          : "#F59E0B"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
