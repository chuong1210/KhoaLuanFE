"use client"

import type React from "react"

import { useState } from "react"
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/types"

interface ProductFormProps {
  product?: Product
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: "",
      isActive: true,
    },
  )

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isLoading = createProduct.isPending || updateProduct.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (product?.id) {
      await updateProduct.mutateAsync({ id: product.id, data: formData })
    } else {
      await createProduct.mutateAsync(formData)
    }
    onSuccess?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
            <Input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Giá</label>
              <Input
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleChange}
                placeholder="Nhập giá"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Danh mục</label>
              <Input
                type="text"
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                placeholder="Nhập ID danh mục"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hình ảnh</label>
            <Input
              type="text"
              name="image"
              value={formData.image || ""}
              onChange={handleChange}
              placeholder="Nhập URL hình ảnh"
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
            <label className="text-sm font-medium">Kích hoạt sản phẩm</label>
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
