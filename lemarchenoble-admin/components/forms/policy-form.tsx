"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PolicyFormProps {
  onSubmit: (data: any) => void
  initialData?: any
  isLoading?: boolean
}

export default function PolicyForm({ onSubmit, initialData, isLoading }: PolicyFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      PolicyName: "",
      PolicyContent: "",
      PolicyType: "TERMS",
      EffectiveDate: "",
      ShopId: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên Chính sách</label>
        <Input name="PolicyName" value={formData.PolicyName} onChange={handleChange} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Loại Chính sách</label>
        <select
          name="PolicyType"
          value={formData.PolicyType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="TERMS">Điều khoản</option>
          <option value="PRIVACY">Bảo mật</option>
          <option value="RETURN">Hoàn trả</option>
          <option value="WARRANTY">Bảo hành</option>
          <option value="SHIPPING">Vận chuyển</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nội dung</label>
        <textarea
          name="PolicyContent"
          value={formData.PolicyContent}
          onChange={handleChange}
          rows={6}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ngày Hiệu lực</label>
        <Input name="EffectiveDate" type="datetime-local" value={formData.EffectiveDate} onChange={handleChange} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  )
}
