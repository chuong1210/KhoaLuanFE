"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { shopService } from "@/services/shop-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Store } from "lucide-react"
import type { ShopFormData } from "@/types/shop"

export default function ShopRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: "",
    shopDescription: "",
    shopLogo: "",
    shopBanner: "",
    shopEmail: "",
    shopPhone: "",
    shopAddressId: "",
    shopPersonalIdentifyId: "",
    shopTaxId: "",
  })

  const createShopMutation = useMutation({
    mutationFn: shopService.createShop,
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu đăng ký shop", {
        description: "Vui lòng chờ admin phê duyệt",
      })
      router.push("/dashboard/shop")
    },
    onError: (error: any) => {
      toast.error("Đăng ký shop thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createShopMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Store className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đăng ký Shop</h2>
          <p className="text-muted-foreground">Điền thông tin để đăng ký cửa hàng của bạn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin. Yêu cầu của bạn sẽ được gửi đến admin để phê duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName">Tên cửa hàng *</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Nhập tên cửa hàng"
                required
              />
            </div>

            {/* Shop Description */}
            <div className="space-y-2">
              <Label htmlFor="shopDescription">Mô tả cửa hàng *</Label>
              <Textarea
                id="shopDescription"
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleChange}
                placeholder="Mô tả về cửa hàng của bạn"
                rows={4}
                required
              />
            </div>

            {/* Shop Logo */}
            <div className="space-y-2">
              <Label htmlFor="shopLogo">Logo cửa hàng (URL) *</Label>
              <Input
                id="shopLogo"
                name="shopLogo"
                value={formData.shopLogo}
                onChange={handleChange}
                placeholder="https://example.com/logo.jpg"
                type="url"
                required
              />
              <p className="text-sm text-muted-foreground">Nhập URL hình ảnh logo của cửa hàng</p>
            </div>

            {/* Shop Banner */}
            <div className="space-y-2">
              <Label htmlFor="shopBanner">Banner cửa hàng (URL) *</Label>
              <Input
                id="shopBanner"
                name="shopBanner"
                value={formData.shopBanner}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                type="url"
                required
              />
              <p className="text-sm text-muted-foreground">Nhập URL hình ảnh banner của cửa hàng</p>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopEmail">Email *</Label>
                <Input
                  id="shopEmail"
                  name="shopEmail"
                  type="email"
                  value={formData.shopEmail}
                  onChange={handleChange}
                  placeholder="shop@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopPhone">Số điện thoại *</Label>
                <Input
                  id="shopPhone"
                  name="shopPhone"
                  type="tel"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  placeholder="0123456789"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="shopAddressId">Địa chỉ *</Label>
              <Input
                id="shopAddressId"
                name="shopAddressId"
                value={formData.shopAddressId}
                onChange={handleChange}
                placeholder="Nhập địa chỉ cửa hàng"
                required
              />
            </div>

            {/* Legal Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopPersonalIdentifyId">CMND/CCCD *</Label>
                <Input
                  id="shopPersonalIdentifyId"
                  name="shopPersonalIdentifyId"
                  value={formData.shopPersonalIdentifyId}
                  onChange={handleChange}
                  placeholder="Số CMND/CCCD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopTaxId">Mã số thuế *</Label>
                <Input
                  id="shopTaxId"
                  name="shopTaxId"
                  value={formData.shopTaxId}
                  onChange={handleChange}
                  placeholder="Mã số thuế"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={createShopMutation.isPending} className="flex-1">
                {createShopMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi yêu cầu đăng ký
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
