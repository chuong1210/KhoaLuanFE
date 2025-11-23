'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Search,
  Store,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useShops, usePendingShops, useDeleteShop, useApproveShop } from '@/features/shops/hooks/useShops'
import type { Shop, ShopSearchParams, PendingShop } from '@/features/shops/types'
import { formatDate, cn } from '@/lib/utils'

export default function ShopsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchParams, setSearchParams] = useState<ShopSearchParams>({
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedShop, setSelectedShop] = useState<Shop | PendingShop | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [feedback, setFeedback] = useState('')

  const { data: shopsData, isLoading: shopsLoading } = useShops(searchParams)
  const { data: pendingData, isLoading: pendingLoading } = usePendingShops({
    pageNumber: 1,
    pageSize: 20,
  })
  const deleteShop = useDeleteShop()
  const approveShop = useApproveShop()

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, PageNumber: page }))
  }

  const handleViewShop = (shop: Shop | PendingShop) => {
    setSelectedShop(shop)
    setIsDetailOpen(true)
  }

  const handleApprovalDialog = (shop: PendingShop) => {
    setSelectedShop(shop)
    setIsApprovalOpen(true)
    setFeedback('')
  }

  const handleApprove = (isApproved: boolean) => {
    if (selectedShop && 'shopId' in selectedShop) {
      approveShop.mutate({
        shopId: selectedShop.shopId,
        data: { isApproved, feedback },
      })
      setIsApprovalOpen(false)
    }
  }

  const handleDeleteShop = (shopId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa shop này?')) {
      deleteShop.mutate(shopId)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Cửa hàng</h1>
        <p className="text-gray-500 mt-1">
          Quản lý và duyệt các cửa hàng trên sàn
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tất cả Shop
            {shopsData?.extra && (
              <Badge variant="processing" className="ml-2">
                {shopsData.extra.totalElements}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chờ duyệt
            {pendingData?.result && (
              <Badge variant="warning" className="ml-2">
                {pendingData.result.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Shops Tab */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm shop..."
                    className="pl-10"
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        SearchTerm: e.target.value || undefined,
                      }))
                    }
                  />
                </div>
                <Select
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      Status: value === 'all' ? undefined : value === 'active',
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Shops Table */}
          <Card className="table-container">
            <CardHeader className="border-b border-orange-peach/20">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-vivid" />
                Danh sách cửa hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : shopsData?.result && shopsData.result.length > 0 ? (
                    shopsData.result.map((shop) => (
                      <TableRow key={shop.id} className="table-row-hover">
                        <TableCell>
                          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-orange-apricot">
                            {shop.shopLogo ? (
                              <Image src={shop.shopLogo} alt={shop.shopName} fill className="object-cover" />
                            ) : (
                              <Store className="h-full w-full p-2 text-orange-vivid" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{shop.shopName}</p>
                        </TableCell>
                        <TableCell>{shop.shopEmail}</TableCell>
                        <TableCell>{shop.shopPhone}</TableCell>
                        <TableCell>
                          <Badge variant={shop.shopStatus ? 'success' : 'error'}>
                            {shop.shopStatus ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(shop.createdDate)}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewShop(shop)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteShop(shop.id)}
                              className="text-orange-deep"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Store className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                        <p className="text-gray-500">Không có shop nào</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {shopsData?.extra && shopsData.extra.totalPages > 1 && (
                <div className="p-4 border-t border-orange-peach/20">
                  <Pagination
                    currentPage={shopsData.extra.currentPage}
                    totalPages={shopsData.extra.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Shops Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card className="table-container">
            <CardHeader className="border-b border-orange-peach/20">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-amber" />
                Shop chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Mã số thuế</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-32 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : pendingData?.result && pendingData.result.length > 0 ? (
                    pendingData.result.map((shop) => (
                      <TableRow key={shop.shopId} className="table-row-hover">
                        <TableCell className="font-medium">{shop.shopName}</TableCell>
                        <TableCell>{shop.shopEmail}</TableCell>
                        <TableCell>{shop.shopPhone}</TableCell>
                        <TableCell>{shop.taxInfo?.taxCode || '-'}</TableCell>
                        <TableCell>{formatDate(shop.createdDate)}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprovalDialog(shop)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprovalDialog(shop)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="text-gray-500">Không có shop nào chờ duyệt</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shop Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết cửa hàng</DialogTitle>
          </DialogHeader>
          {selectedShop && 'shopName' in selectedShop && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-orange-apricot">
                  {(selectedShop as Shop).shopLogo ? (
                    <Image src={(selectedShop as Shop).shopLogo} alt={(selectedShop as Shop).shopName} fill className="object-cover" />
                  ) : (
                    <Store className="h-full w-full p-4 text-orange-vivid" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{(selectedShop as Shop).shopName}</h3>
                  <Badge variant={(selectedShop as Shop).shopStatus ? 'success' : 'error'}>
                    {(selectedShop as Shop).shopStatus ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-vivid" />
                  <span>{(selectedShop as Shop).shopEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-vivid" />
                  <span>{(selectedShop as Shop).shopPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-orange-vivid mt-0.5" />
                  <span>{(selectedShop as Shop).shopAddress}</span>
                </div>
              </div>
              {(selectedShop as Shop).shopDescription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mô tả:</p>
                  <p className="text-sm">{(selectedShop as Shop).shopDescription}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt cửa hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Phản hồi (tùy chọn)</Label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Nhập phản hồi cho shop..."
                className="w-full mt-2 p-3 border border-orange-peach/50 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => handleApprove(false)}>
              <XCircle className="h-4 w-4 mr-1" />
              Từ chối
            </Button>
            <Button onClick={() => handleApprove(true)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
