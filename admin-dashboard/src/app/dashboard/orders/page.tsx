'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import {
  Search,
  ShoppingCart,
  Eye,
  Package,
  MapPin,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
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
} from '@/components/ui/dialog'
import { useOrders } from '@/features/orders/hooks/useOrders'
import type { OrderWithShop, OrderSearchParams, OrderStatus } from '@/features/orders/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'> = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  }
  const labels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  }
  return (
    <Badge variant={variants[status] || 'pending'}>
      {labels[status] || status}
    </Badge>
  )
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
    page_size: 10,
  })
  const [selectedOrder, setSelectedOrder] = useState<OrderWithShop | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data, isLoading } = useOrders(searchParams)

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }))
  }

  const handleStatusChange = (status: string) => {
    setSearchParams((prev) => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }))
  }

  const handleViewOrder = (order: OrderWithShop) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-1">
            Theo dõi và quản lý tất cả đơn hàng trên sàn
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đơn hàng, shop..."
                className="pl-10"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    shop_id: e.target.value || undefined,
                  }))
                }
              />
            </div>

            {/* Status Filter */}
            <Select
              value={searchParams.status || ''}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-40"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    created_from: e.target.value || undefined,
                  }))
                }
              />
              <span className="text-gray-400">-</span>
              <Input
                type="date"
                className="w-40"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    created_to: e.target.value || undefined,
                  }))
                }
              />
            </div>

            {/* Amount Range */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Từ"
                className="w-28"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    min_amount: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Đến"
                className="w-28"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    max_amount: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-vivid" />
            Danh sách đơn hàng
            {data && (
              <Badge variant="processing" className="ml-2">
                {data.totalElements} đơn hàng
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((orderData) => (
                  <TableRow key={orderData.order.order_id} className="table-row-hover">
                    <TableCell>
                      <div>
                        <p className="font-medium text-orange-vivid">
                          {orderData.order.order_code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {orderData.order_shop.shop_order_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{orderData.order_shop.shop_id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {orderData.order.shipping_address.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {orderData.order.shipping_address.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-orange-vivid">
                        {formatCurrency(orderData.order.grand_total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(orderData.order_shop.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(orderData.order.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(orderData)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                      <p>Không có đơn hàng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-vivid" />
              Chi tiết đơn hàng
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card variant="gradient">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-orange-vivid" />
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                        <p className="font-bold text-orange-vivid">
                          {selectedOrder.order.order_code}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="gradient">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-orange-vivid" />
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-bold text-orange-vivid">
                          {formatCurrency(selectedOrder.order.grand_total)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-vivid" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedOrder.order.shipping_address.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.order.shipping_address.phone}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.order.shipping_address.address},{' '}
                      {selectedOrder.order.shipping_address.district},{' '}
                      {selectedOrder.order.shipping_address.city}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-vivid" />
                    Sản phẩm ({selectedOrder.order_shop.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_shop.items?.map((item) => (
                      <div key={item.item_id} className="flex gap-4 p-3 rounded-lg bg-orange-apricot/20">
                        <div className="relative h-16 w-16 rounded overflow-hidden bg-white flex-shrink-0">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-full w-full p-4 text-orange-peach" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">{item.sku_attributes}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm">x{item.quantity}</span>
                            <span className="font-bold text-orange-vivid">
                              {formatCurrency(item.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính:</span>
                      <span>{formatCurrency(selectedOrder.order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển:</span>
                      <span>{formatCurrency(selectedOrder.order.total_shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giảm giá:</span>
                      <span className="text-green-600">-{formatCurrency(selectedOrder.order.total_discount)}</span>
                    </div>
                    <div className="border-t border-orange-peach/30 pt-2 flex justify-between font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-vivid">
                        {formatCurrency(selectedOrder.order.grand_total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
