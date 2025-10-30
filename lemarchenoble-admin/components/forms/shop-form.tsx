"use client"

import type React from "react"

import { useState } from "react"
import { useCreateShop, useUpdateShop } from "@/hooks/useShops"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Shop } from "@/types"

interface ShopFormProps {
  shop?: Shop
  onSuccess?: () => void
}

export function ShopForm({ shop, onSuccess }: ShopFormProps) {
  const [formData, setFormData] = useState<Partial<Shop>>(
    shop || {
      name: "",
      description: "",
      logo: "",
      isActive: true,
    },
  )

  const createShop = useCreateShop()
  const updateShop = useUpdateShop()
  const isLoading = createShop.isPending || updateShop.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (shop?.id) {
      await updateShop.mutateAsync({ id: shop.id, data: formData })
    } else {
      await createShop.mutateAsync(formData)
    }
    onSuccess?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shop ? "Chỉnh sửa cửa hàng" : "Tạo cửa hàng mới"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên cửa hàng</label>
            <Input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Nhập tên cửa hàng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Nhập mô tả cửa hàng"
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <Input
              type="text"
              name="logo"
              value={formData.logo || ""}
              onChange={handleChange}
              placeholder="Nhập URL logo"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm font-medium">Kích hoạt cửa hàng</label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
