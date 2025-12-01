"use client";

import { useState } from "react";
import {
  useSupportAnalytics,
  useSupportFeedbacks,
} from "@/features/analytics/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";

interface Props {
  dateParams: { start_date: string; end_date: string };
}

// Định nghĩa lại BadgeVariant cho khớp với project của bạn
type BadgeVariant =
  | "error"
  | "pending"
  | "default"
  | "success"
  | "warning"
  | "info"
  | "processing"
  | "active"
  | "inactive";

// Cập nhật Config: Thêm PENDING và mapping màu chính xác
const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: BadgeVariant; icon: any }
> = {
  BUG: { label: "Lỗi", color: "error", icon: Bug },
  SUGGESTION: { label: "Góp ý", color: "info", icon: Lightbulb },
  COMPLAINT: { label: "Khiếu nại", color: "warning", icon: AlertTriangle },
  PENDING: { label: "Chờ xử lý", color: "pending", icon: Clock }, // Thêm PENDING
  OTHER: { label: "Khác", color: "default", icon: MessageCircle },
};

export function SupportFeedbackTab({ dateParams }: Props) {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL"); // State lưu loại filter

  const { data: stats } = useSupportAnalytics(dateParams);

  // Truyền category vào hook nếu không phải là ALL
  const { data: feedbacks, isLoading } = useSupportFeedbacks({
    page,
    page_size: 10,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
  });

  // Reset về trang 1 khi đổi filter
  const handleFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats - Giữ nguyên */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-900">Báo Lỗi</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {stats?.overview?.bug_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-900">Khiếu nại</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {stats?.overview?.complaint_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900">Góp ý</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {stats?.overview?.suggestion_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">User Unique</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">
              {stats?.overview?.unique_users || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table với Filter Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách Phản hồi</CardTitle>

          {/* Dropdown Filter */}
          <Select value={categoryFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="BUG">Lỗi (Bug)</SelectItem>
              <SelectItem value="COMPLAINT">Khiếu nại</SelectItem>
              <SelectItem value="SUGGESTION">Góp ý</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Liên hệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks?.data.map((fb) => {
                  const config =
                    CATEGORY_CONFIG[fb.category] || CATEGORY_CONFIG.OTHER;
                  return (
                    <TableRow key={fb.id}>
                      <TableCell className="w-[150px]">
                        {format(new Date(fb.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <Badge
                          variant={config.color}
                          className="gap-1 px-2 py-1"
                        >
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        <p
                          className="truncate hover:whitespace-normal transition-all cursor-default"
                          title={fb.content}
                        >
                          {fb.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{fb.email}</span>
                          <span className="text-gray-500 text-xs">
                            {fb.phone}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {!isLoading && feedbacks?.data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy phản hồi nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button variant="outline" size="sm" disabled>
              Trang {page}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={feedbacks?.data.length !== 10}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
