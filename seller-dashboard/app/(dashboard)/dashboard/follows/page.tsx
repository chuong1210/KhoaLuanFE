"use client"
import { useQuery } from "@tanstack/react-query"
import { followService } from "@/services/follow-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function FollowsPage() {
  const {
    data: follows,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["follows"],
    queryFn: followService.getFollows,
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Người theo dõi</h2>
        <p className="text-muted-foreground">Danh sách người dùng đang theo dõi cửa hàng của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách người theo dõi ({follows?.length || 0})
          </CardTitle>
          <CardDescription>Quản lý và theo dõi người dùng quan tâm đến cửa hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể tải danh sách người theo dõi</AlertDescription>
            </Alert>
          ) : follows && follows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày theo dõi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {follows.map((follow) => (
                  <TableRow key={follow.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={follow.userAvatar || "/placeholder.svg"} alt={follow.userName} />
                          <AvatarFallback>{follow.userName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{follow.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{follow.userEmail}</TableCell>
                    <TableCell>{formatDate(follow.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chưa có người theo dõi nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
