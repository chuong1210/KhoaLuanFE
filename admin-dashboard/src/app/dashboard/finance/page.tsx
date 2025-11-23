'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Building,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  useTransactions,
  useSettlements,
  useLedgers,
} from '@/features/analytics/hooks/useAnalytics'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function FinancePage() {
  const [dateRange, setDateRange] = useState('30days')
  const [transactionStatus, setTransactionStatus] = useState<string>('')
  const [transactionType, setTransactionType] = useState<string>('')

  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(
    dateRange === '7days'
      ? subDays(new Date(), 7)
      : dateRange === '30days'
      ? subDays(new Date(), 30)
      : subDays(new Date(), 90),
    'yyyy-MM-dd'
  )

  const { data: transactions, isLoading: txLoading } = useTransactions({
    start_date: startDate,
    end_date: endDate,
    status: transactionStatus || undefined,
    type: transactionType || undefined,
    limit: 20,
    offset: 0,
  })

  const { data: settlements, isLoading: settleLoading } = useSettlements({
    start_date: startDate,
    end_date: endDate,
    status: 'PENDING_SETTLEMENT',
    limit: 20,
    offset: 0,
  })

  const { data: ledgers, isLoading: ledgerLoading } = useLedgers({
    owner_type: 'PLATFORM',
    limit: 10,
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'REFUND':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <Receipt className="h-4 w-4 text-orange-vivid" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success">Thành công</Badge>
      case 'PENDING':
        return <Badge variant="pending">Chờ xử lý</Badge>
      case 'FAILED':
        return <Badge variant="error">Thất bại</Badge>
      case 'PENDING_SETTLEMENT':
        return <Badge variant="warning">Chờ thanh toán</Badge>
      case 'SETTLED':
        return <Badge variant="success">Đã thanh toán</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="h-7 w-7 text-orange-vivid" />
            Quản lý Tài chính
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi giao dịch và thanh toán trên sàn
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="90days">90 ngày qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Platform Balance */}
        <Card className="bg-gradient-sunrise text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Số dư Sàn</p>
                <p className="text-3xl font-bold mt-2">
                  {ledgerLoading ? '-' : formatCurrency(parseFloat(ledgers?.[0]?.balance || '0'))}
                </p>
                <p className="text-sm opacity-75 mt-1">Ví Platform</p>
              </div>
              <Wallet className="h-12 w-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        <Card className="bg-gradient-to-br from-orange-amber to-orange-warm text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Số dư chờ xử lý</p>
                <p className="text-3xl font-bold mt-2">
                  {ledgerLoading ? '-' : formatCurrency(parseFloat(ledgers?.[0]?.pending_balance || '0'))}
                </p>
                <p className="text-sm opacity-75 mt-1">Đang chờ quyết toán</p>
              </div>
              <Clock className="h-12 w-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Settlements Count */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-400 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Đơn chờ quyết toán</p>
                <p className="text-3xl font-bold mt-2">
                  {settleLoading ? '-' : settlements?.length || 0}
                </p>
                <p className="text-sm opacity-75 mt-1">Cần xử lý</p>
              </div>
              <Building className="h-12 w-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            Giao dịch
            {transactions && (
              <Badge variant="processing" className="ml-2">
                {transactions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Quyết toán
            {settlements && (
              <Badge variant="warning" className="ml-2">
                {settlements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ledgers">Sổ cái</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="PAYMENT">Thanh toán</SelectItem>
                <SelectItem value="REFUND">Hoàn tiền</SelectItem>
                <SelectItem value="SETTLEMENT">Quyết toán</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transactionStatus} onValueChange={setTransactionStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="SUCCESS">Thành công</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <Card className="table-container">
            <CardHeader className="border-b border-orange-peach/20">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-vivid" />
                Danh sách Giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="table-row-hover">
                        <TableCell>
                          <span className="font-mono text-sm text-orange-vivid">
                            {tx.transaction_code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.type)}
                            <span>{tx.type === 'PAYMENT' ? 'Thanh toán' : tx.type === 'REFUND' ? 'Hoàn tiền' : tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            'font-bold',
                            tx.type === 'PAYMENT' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {tx.type === 'PAYMENT' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                          {tx.notes?.Valid ? tx.notes.String : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                        <p className="text-gray-500">Không có giao dịch nào</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlements Tab */}
        <TabsContent value="settlements" className="space-y-4">
          <Card className="table-container">
            <CardHeader className="border-b border-orange-peach/20">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-vivid" />
                Quyết toán chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead>Mã đơn Shop</TableHead>
                    <TableHead className="text-right">Tổng đơn</TableHead>
                    <TableHead className="text-right">Phí hoa hồng</TableHead>
                    <TableHead className="text-right">Số tiền quyết toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settleLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : settlements && settlements.length > 0 ? (
                    settlements.map((settle) => (
                      <TableRow key={settle.id} className="table-row-hover">
                        <TableCell>
                          <span className="font-mono text-sm">{settle.shop_order_id.slice(0, 8)}...</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(settle.order_subtotal))}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatCurrency(parseFloat(settle.commission_fee))}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(parseFloat(settle.net_settled_amount))}
                        </TableCell>
                        <TableCell>{getStatusBadge(settle.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="text-gray-500">Không có đơn chờ quyết toán</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledgers Tab */}
        <TabsContent value="ledgers" className="space-y-4">
          <Card className="table-container">
            <CardHeader className="border-b border-orange-peach/20">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-orange-vivid" />
                Sổ cái Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead>Loại chủ sở hữu</TableHead>
                    <TableHead className="text-right">Số dư</TableHead>
                    <TableHead className="text-right">Số dư chờ</TableHead>
                    <TableHead>Cập nhật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : ledgers && ledgers.length > 0 ? (
                    ledgers.map((ledger) => (
                      <TableRow key={ledger.id} className="table-row-hover">
                        <TableCell>
                          <Badge variant={ledger.owner_type === 'PLATFORM' ? 'processing' : 'info'}>
                            {ledger.owner_type === 'PLATFORM' ? 'Sàn' : 'Shop'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(parseFloat(ledger.balance))}
                        </TableCell>
                        <TableCell className="text-right text-orange-vivid">
                          {formatCurrency(parseFloat(ledger.pending_balance))}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(ledger.updated_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Wallet className="h-12 w-12 mx-auto mb-2 text-orange-peach" />
                        <p className="text-gray-500">Không có dữ liệu</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
