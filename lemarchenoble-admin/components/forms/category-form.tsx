"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CategoryFormProps {
  onSubmit: (formData: FormData) => void
  isLoading?: boolean
}

export default function CategoryForm({ onSubmit, isLoading }: CategoryFormProps) {
  const [name, setName] = useState("")
  const [parent, setParent] = useState("")
  const [media, setMedia] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", name)
    if (parent) formData.append("parent", parent)
    if (media) formData.append("media", media)
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên Danh mục</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Danh mục cha (tùy chọn)</label>
        <Input value={parent} onChange={(e) => setParent(e.target.value)} placeholder="ID danh mục cha" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh đại diện (tùy chọn)</label>
        <input
          type="file"
          onChange={(e) => setMedia(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border rounded-md"
          accept="image/*"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  )
}
