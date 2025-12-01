"use client";

import { useState } from "react";
import {
  useChatboxAnalytics,
  useChatboxReviews,
} from "@/features/analytics/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquareMore } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  dateParams: { start_date: string; end_date: string };
}

export function ChatboxAnalyticsTab({ dateParams }: Props) {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<string>("all"); // 'all', '1', '-1'

  const { data: stats, isLoading: statsLoading } =
    useChatboxAnalytics(dateParams);

  const { data: reviews, isLoading: reviewsLoading } = useChatboxReviews({
    page,
    page_size: 10,
    rating: ratingFilter === "all" ? undefined : parseInt(ratingFilter),
  });

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-6 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <p className="text-white/80 text-sm">Tỷ lệ hài lòng</p>
            <p className="text-4xl font-bold mt-2">
              {stats?.overview?.satisfaction_rate || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Lượt thích</p>
              <p className="text-2xl font-bold">
                {stats?.overview?.like_count || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ThumbsDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Lượt không thích</p>
              <p className="text-2xl font-bold">
                {stats?.overview?.dislike_count || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <MessageSquareMore className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng đánh giá</p>
              <p className="text-2xl font-bold">
                {stats?.overview?.total_ratings || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chi tiết Đánh giá</CardTitle>
          <Select
            value={ratingFilter}
            onValueChange={(val) => {
              setRatingFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">Hài lòng (Like)</SelectItem>
              <SelectItem value="-1">Không hài lòng (Dislike)</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews?.data.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={review.rating === 1 ? "success" : "error"}
                      className="gap-1"
                    >
                      {review.rating === 1 ? (
                        <ThumbsUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ThumbsDown className="h-3 w-3 mr-1" />
                      )}
                      {review.rating === 1 ? "Hài lòng" : "Không hài lòng"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(review.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <span className="font-semibold text-gray-700 block mb-1">
                        User:
                      </span>
                      {review.user_prompt}
                    </div>
                    <div className="bg-blue-50/50 p-2 rounded border border-blue-100">
                      <span className="font-semibold text-blue-700 block mb-1">
                        Agent:
                      </span>
                      {review.agent_response}
                    </div>
                  </div>
                </div>
              ))}
              {reviews?.data.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Không có đánh giá nào.
                </p>
              )}
            </div>
          )}

          {/* Simple Pagination */}
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
              disabled={reviews?.data.length !== 10}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
