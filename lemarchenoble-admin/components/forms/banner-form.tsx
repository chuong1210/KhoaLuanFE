"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BannerFormProps {
  onSubmit: (data: any) => void
  initialData?: any
  isLoading?: boolean
}

export default function BannerForm({ onSubmit, initialData, isLoading }: BannerFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      BannerName: "",
      BannerImage: "",
      BannerUrl: "",
      BannerOrder: 0,
      IsActive: true,
      StartDate: "",
      EndDate: "",
      BannerType: "HOME",
      TargetId: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên Banner</label>
        <Input name="BannerName" value={formData.BannerName} onChange={handleChange} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL Ảnh</label>
        <Input name="BannerImage" value={formData.BannerImage} onChange={handleChange} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL Liên kết</label>
        <Input name="BannerUrl" value={formData.BannerUrl} onChange={handleChange} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Loại Banner</label>
        <select
          name="BannerType"
          value={formData.BannerType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="HOME">Trang chủ</option>
          <option value="CATEGORY">Danh mục</option>
          <option value="PRODUCT">Sản phẩm</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thứ tự</label>
        <Input name="BannerOrder" type="number" value={formData.BannerOrder} onChange={handleChange} />
      </div>

      <div className="flex items-center">
        <input type="checkbox" name="IsActive" checked={formData.IsActive} onChange={handleChange} className="mr-2" />
        <label className="text-sm font-medium">Hoạt động</label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  )
}
