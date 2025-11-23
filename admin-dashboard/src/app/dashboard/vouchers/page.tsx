'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Search,
  Ticket,
  Plus,
  Eye,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { useVouchers, useCreateVoucher, useDeleteVoucher } from '@/features/vouchers/hooks/useVouchers'
import type { Voucher, VoucherSearchParams, CreateVoucherRequest } from '@/features/vouchers/types'
import { voucherSchema, type VoucherFormData } from '@/lib/validators'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function VouchersPage() {
  const [searchParams, setSearchParams] = useState<VoucherSearchParams>({
    page: 1,
    page_size: 10,
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  const { data, isLoading } = useVouchers(searchParams)
  const createVoucher = useCreateVoucher()
  const deleteVoucher = useDeleteVoucher()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      discount_type: 'PERCENTAGE',
      applies_to_type: 'ORDER_TOTAL',
      audience_type: 'PUBLIC',
      min_purchase_amount: 0,
      max_usage_per_user: 1,
      total_quantity: 100,
    },
  })

  const discountType = watch('discount_type')

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }))
  }

  const onSubmit = (data: VoucherFormData) => {
    const request: CreateVoucherRequest = {
      ...data,
      max_discount_amount: data.max_discount_amount || undefined,
    }
    createVoucher.mutate(request, {
      onSuccess: () => {
        setIsCreateOpen(false)
        reset()
      },
    })
  }

  const handleDeleteVoucher = (voucherId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      deleteVoucher.mutate(voucherId)
    }
  }

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.status === 'EXPIRED') return <Badge variant="expired">Hết hạn</Badge>
    if (!voucher.is_active) return <Badge variant="inactive">Tạm dừng</Badge>
    if (voucher.remaining_quantity === 0) return <Badge variant="error">Hết lượt</Badge>
    return <Badge variant="active">Hoạt động</Badge>
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
          <p className="text-gray-500 mt-1">
            Tạo và quản lý các mã giảm giá trên sàn
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo voucher mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã voucher..."
                className="pl-10"
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    voucher_code: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <Select
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  discount_type: value === 'all' ? undefined : value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại giảm giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setSearchParams((prev) => ({
                  ...prev,
                  applies_to_type: value === 'all' ? undefined : value as 'ORDER_TOTAL' | 'SHIPPING_FEE',
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Áp dụng cho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ORDER_TOTAL">Đơn hàng</SelectItem>
                <SelectItem value="SHIPPING_FEE">Phí ship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-vivid" />
            Danh sách voucher
            {data?.pagination && (
              <Badge variant="processing" className="ml-2">
                {data.pagination.total_items} voucher
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>Mã voucher</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Áp dụng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <TableCell key={i}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((voucher) => (
                  <TableRow key={voucher.id} className="table-row-hover">
                    <TableCell>
                      <span className="font-mono font-bold text-orange-vivid">
                        {voucher.voucher_code}
                      </span>
                    </TableCell>
                    <TableCell>{voucher.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {voucher.discount_type === 'PERCENTAGE' ? (
                          <>
                            <Percent className="h-4 w-4 text-orange-vivid" />
                            <span>{parseFloat(voucher.discount_value)}%</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-orange-vivid" />
                            <span>{formatCurrency(parseFloat(voucher.discount_value))}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={voucher.applies_to_type === 'ORDER_TOTAL' ? 'info' : 'processing'}>
                        {voucher.applies_to_type === 'ORDER_TOTAL' ? 'Đơn hàng' : 'Phí ship'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(voucher.end_date).split(' ')[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {voucher.used_quantity}/{voucher.total_quantity}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVoucher(voucher.id)}
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
                  <TableCell colSpan={8} className="text-center py-8">
                    <Ticket className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                    <p className="text-gray-500">Không có voucher nào</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data?.pagination && data.pagination.total_pages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={data.pagination.current_page}
                totalPages={data.pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Voucher Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo voucher mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Tên voucher *</Label>
                <Input {...register('name')} placeholder="VD: Giảm giá 20%" className="mt-1" />
                {errors.name && <p className="text-sm text-orange-deep mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Mã voucher *</Label>
                <Input {...register('voucher_code')} placeholder="VD: SALE20" className="mt-1 uppercase" />
                {errors.voucher_code && <p className="text-sm text-orange-deep mt-1">{errors.voucher_code.message}</p>}
              </div>
              <div>
                <Label>Loại giảm giá *</Label>
                <Select
                  value={discountType}
                  onValueChange={(value) => setValue('discount_type', value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giá trị giảm *</Label>
                <Input type="number" {...register('discount_value', { valueAsNumber: true })} className="mt-1" />
                {errors.discount_value && <p className="text-sm text-orange-deep mt-1">{errors.discount_value.message}</p>}
              </div>
              {discountType === 'PERCENTAGE' && (
                <div>
                  <Label>Giảm tối đa (VND)</Label>
                  <Input type="number" {...register('max_discount_amount', { valueAsNumber: true })} className="mt-1" />
                </div>
              )}
              <div>
                <Label>Áp dụng cho *</Label>
                <Select onValueChange={(value) => setValue('applies_to_type', value as 'ORDER_TOTAL' | 'SHIPPING_FEE')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER_TOTAL">Tổng đơn hàng</SelectItem>
                    <SelectItem value="SHIPPING_FEE">Phí vận chuyển</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Đơn tối thiểu (VND)</Label>
                <Input type="number" {...register('min_purchase_amount', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Đối tượng</Label>
                <Select onValueChange={(value) => setValue('audience_type', value as 'PUBLIC' | 'ASSIGNED')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Công khai</SelectItem>
                    <SelectItem value="ASSIGNED">Chỉ định</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày bắt đầu *</Label>
                <Input type="datetime-local" {...register('start_date')} className="mt-1" />
              </div>
              <div>
                <Label>Ngày kết thúc *</Label>
                <Input type="datetime-local" {...register('end_date')} className="mt-1" />
              </div>
              <div>
                <Label>Tổng số lượng *</Label>
                <Input type="number" {...register('total_quantity', { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Tối đa/người</Label>
                <Input type="number" {...register('max_usage_per_user', { valueAsNumber: true })} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createVoucher.isPending}>
                {createVoucher.isPending ? 'Đang tạo...' : 'Tạo voucher'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
