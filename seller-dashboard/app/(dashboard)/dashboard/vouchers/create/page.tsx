"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { voucherService } from "@/services/voucher-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Ticket } from "lucide-react"
import type { VoucherFormData } from "@/types/voucher"

export default function CreateVoucherPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<VoucherFormData>({
    name: "",
    code: "",
    discount: 0,
    discountType: "percentage",
    minSupport: 0,
    quantity: 0,
    startDate: "",
    endDate: "",
    image: "",
  })

  const createVoucherMutation = useMutation({
    mutationFn: voucherService.createVoucher,
    onSuccess: () => {
      toast.success("Đã tạo voucher thành công")
      router.push("/dashboard/vouchers")
    },
    onError: (error: any) => {
      toast.error("Tạo voucher thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createVoucherMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number.parseFloat(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Ticket className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tạo Voucher mới</h2>
          <p className="text-muted-foreground">Tạo voucher giảm giá cho cửa hàng của bạn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Voucher</CardTitle>
          <CardDescription>Điền đầy đủ thông tin để tạo voucher mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên voucher *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Giảm giá 50%"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Mã voucher *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SALE50"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountType">Loại giảm giá *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">
                  Giá trị giảm {formData.discountType === "percentage" ? "(%)" : "(VNĐ)"} *
                </Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder={formData.discountType === "percentage" ? "50" : "100000"}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minSupport">Giá trị đơn hàng tối thiểu (VNĐ) *</Label>
                <Input
                  id="minSupport"
                  name="minSupport"
                  type="number"
                  value={formData.minSupport}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Hình ảnh voucher (URL)</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/voucher.jpg"
                type="url"
              />
              {formData.image && (
                <div className="mt-2 h-32 w-32 overflow-hidden rounded border">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createVoucherMutation.isPending} className="flex-1">
                {createVoucherMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo voucher
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
