"use client"

import { useRouter } from "next/navigation"
import { ProductForm } from "@/components/forms/product-form"

export default function CreateProductPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
        <p className="text-gray-600 mt-2">Thêm một sản phẩm mới vào hệ thống</p>
      </div>

      <ProductForm onSuccess={() => router.push("/admin/products")} />
    </div>
  )
}
