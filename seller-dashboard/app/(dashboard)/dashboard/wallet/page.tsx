"use client"
import { useState } from "react"
import type React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { walletService } from "@/services/wallet-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { PayoutRequest } from "@/types/wallet"

export default function WalletPage() {
  const queryClient = useQueryClient()
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)
  const [payoutData, setPayoutData] = useState<PayoutRequest>({
    amount: 0,
    bankAccount: "",
    bankName: "",
    accountHolder: "",
  })

  const {
    data: wallet,
    isLoading: isLoadingWallet,
    error: errorWallet,
  } = useQuery({
    queryKey: ["wallet"],
    queryFn: walletService.getWallet,
  })

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: errorTransactions,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: walletService.getTransactions,
  })

  const payoutMutation = useMutation({
    mutationFn: walletService.requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Yêu cầu rút tiền đã được gửi")
      setIsPayoutDialogOpen(false)
      setPayoutData({
        amount: 0,
        bankAccount: "",
        bankName: "",
        accountHolder: "",
      })
    },
    onError: () => {
      toast.error("Không thể gửi yêu cầu rút tiền")
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN")
  }

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (wallet && payoutData.amount > wallet.balance) {
      toast.error("Số dư không đủ")
      return
    }
    payoutMutation.mutate(payoutData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ví tiền</h2>
          <p className="text-muted-foreground">Quản lý số dư và giao dịch của cửa hàng</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Số dư ví
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWallet ? (
            <Skeleton className="h-16 w-full" />
          ) : errorWallet ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể tải thông tin ví</AlertDescription>
            </Alert>
          ) : wallet ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
                <p className="text-4xl font-bold">{formatPrice(wallet.balance)}</p>
              </div>
              <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={wallet.balance <= 0}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Yêu cầu rút tiền
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yêu cầu rút tiền</DialogTitle>
                    <DialogDescription>Điền thông tin tài khoản ngân hàng để rút tiền</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePayoutSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Số tiền rút (VNĐ) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={payoutData.amount}
                        onChange={(e) => setPayoutData({ ...payoutData, amount: Number.parseFloat(e.target.value) })}
                        placeholder="0"
                        min="0"
                        max={wallet.balance}
                        required
                      />
                      <p className="text-sm text-muted-foreground">Số dư khả dụng: {formatPrice(wallet.balance)}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Tên ngân hàng *</Label>
                      <Input
                        id="bankName"
                        value={payoutData.bankName}
                        onChange={(e) => setPayoutData({ ...payoutData, bankName: e.target.value })}
                        placeholder="Vietcombank"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Số tài khoản *</Label>
                      <Input
                        id="bankAccount"
                        value={payoutData.bankAccount}
                        onChange={(e) => setPayoutData({ ...payoutData, bankAccount: e.target.value })}
                        placeholder="1234567890"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Tên chủ tài khoản *</Label>
                      <Input
                        id="accountHolder"
                        value={payoutData.accountHolder}
                        onChange={(e) => setPayoutData({ ...payoutData, accountHolder: e.target.value })}
                        placeholder="NGUYEN VAN A"
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={payoutMutation.isPending} className="flex-1">
                        {payoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi yêu cầu
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
                        Hủy
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>Xem tất cả các giao dịch của ví</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : errorTransactions ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể tải lịch sử giao dịch</AlertDescription>
            </Alert>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.type === "credit" ? (
                        <div className="flex items-center gap-2 text-success">
                          <ArrowDownRight className="h-4 w-4" />
                          <span>Nhận tiền</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive">
                          <ArrowUpRight className="h-4 w-4" />
                          <span>Rút tiền</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="font-medium">{formatPrice(transaction.amount)}</TableCell>
                    <TableCell>
                      {transaction.status === "completed" ? (
                        <Badge className="bg-success text-white">Hoàn thành</Badge>
                      ) : transaction.status === "pending" ? (
                        <Badge variant="secondary">Đang xử lý</Badge>
                      ) : (
                        <Badge variant="destructive">Thất bại</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Chưa có giao dịch nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
