"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { followerService } from "@/services/follow-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  AlertCircle,
  Search,
  Mail,
  Calendar,
  TrendingUp,
  Filter,
  UserPlus,
} from "lucide-react";
import type { FollowerFilters } from "@/types/follow";

export default function FollowersPage() {
  const [filters, setFilters] = useState<FollowerFilters>({
    pageNumber: 1,
    pageSize: 20,
    sortBy: "created_desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: followersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["followers", filters],
    queryFn: () => followerService.getMyShopFollowers(filters),
  });

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: searchTerm,
      pageNumber: 1,
    }));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,106,0,0.08), rgba(255,179,138,0.03))",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        {/* Header with Stats */}
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-white shadow-2xl"
          style={{
            background:
              "linear-gradient(120deg, #E65100 0%, #FF6A00 60%, #FFD3A3 100%)",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-black/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

          <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-4 ring-white/30">
                  <Users className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    Người theo dõi
                  </h1>
                  <p className="mt-2 text-lg text-white/95">
                    Quản lý cộng đồng của bạn
                  </p>
                </div>
              </div>

              {followersData && (
                <div className="flex gap-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-[#FFF0E0]" />
                      <div>
                        <p className="text-sm text-white/80">Tổng số</p>
                        <p className="text-3xl font-bold">
                          {followersData.extra.totalElements}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader
            style={{
              background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                }}
              >
                <Filter className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#E65100]">
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF8A33] pointer-events-none" />
                    <Input
                      placeholder="Tìm kiếm theo ID người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 h-12 border-2 border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 rounded-xl transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                    }}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Select
                value={filters.sortBy}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: value,
                    pageNumber: 1,
                  }))
                }
              >
                <SelectTrigger className="h-12 border-2 border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10 rounded-xl font-medium">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="created_desc" className="rounded-lg py-3">
                    📅 Mới nhất
                  </SelectItem>
                  <SelectItem value="created_asc" className="rounded-lg py-3">
                    📅 Cũ nhất
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Followers Grid */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert
                variant="destructive"
                className="border-2 border-red-200 rounded-2xl"
              >
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">Lỗi</AlertTitle>
                <AlertDescription className="text-base">
                  Không thể tải danh sách người theo dõi. Vui lòng thử lại.
                </AlertDescription>
              </Alert>
            ) : followersData && followersData.result.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {followersData.result.map((follower) => (
                    <Card
                      key={follower.id}
                      className="group relative overflow-hidden border-2 border-[#FFB38A]/30 hover:border-[#FF6A00] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-2xl bg-white"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-[#FF6A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                      <CardContent className="p-6 relative">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-[#FFB38A]/40 group-hover:border-[#FF6A00] transition-colors">
                              <AvatarImage
                                src={
                                  follower.userAvatar ||
                                  "https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg"
                                }
                                alt={follower.userName}
                              />
                              <AvatarFallback
                                className="text-xl font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                                  color: "white",
                                }}
                              >
                                {follower.userName[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-[#111111] group-hover:text-[#FF6A00] transition-colors truncate">
                              {follower.userName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatTimeAgo(follower.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {follower.userEmail && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#FFF0E0]/50 rounded-lg p-3">
                              <Mail className="h-4 w-4 text-[#FF8A33] shrink-0" />
                              <span className="truncate">
                                {follower.userEmail}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#FFF0E0]/50 rounded-lg p-3">
                            <Calendar className="h-4 w-4 text-[#FFB000] shrink-0" />
                            <span>{formatDate(follower.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#FFB38A]/20">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="font-medium">
                              ID: {follower.userProfileId.slice(0, 8)}...
                            </span>
                            <UserPlus className="h-4 w-4 text-[#FF6A00]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {followersData.extra.totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        disabled={!followersData.extra.hasPreviousPage}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            pageNumber: (prev.pageNumber || 1) - 1,
                          }))
                        }
                        className="h-11 px-6 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all disabled:opacity-40"
                      >
                        ← Trước
                      </Button>

                      <div className="flex items-center gap-2">
                        {Array.from(
                          {
                            length: Math.min(5, followersData.extra.totalPages),
                          },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={
                                  filters.pageNumber === page
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  filters.pageNumber === page
                                    ? "h-11 w-11 rounded-xl font-bold text-white shadow-lg"
                                    : "h-11 w-11 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all"
                                }
                                style={
                                  filters.pageNumber === page
                                    ? {
                                        background:
                                          "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                                      }
                                    : {}
                                }
                                onClick={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    pageNumber: page,
                                  }))
                                }
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        disabled={!followersData.extra.hasNextPage}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            pageNumber: (prev.pageNumber || 1) + 1,
                          }))
                        }
                        className="h-11 px-6 border-2 border-[#FFB38A]/40 hover:border-[#FF6A00] hover:bg-[#FFF0E0] rounded-xl font-semibold transition-all disabled:opacity-40"
                      >
                        Sau →
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 font-medium">
                      Trang {followersData.extra.currentPage} /{" "}
                      {followersData.extra.totalPages}
                      <span className="mx-2">•</span>
                      Tổng {followersData.extra.totalElements} người theo dõi
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div
                  className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl shadow-2xl animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
                  }}
                >
                  <Users className="h-14 w-14 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#111111] mb-3">
                  Chưa có người theo dõi
                </p>
                <p className="text-gray-600 text-lg mb-6 text-center max-w-md">
                  Chia sẻ shop của bạn để thu hút nhiều người theo dõi hơn
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
