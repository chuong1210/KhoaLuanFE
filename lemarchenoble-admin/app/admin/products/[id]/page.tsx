"use client"

import { useRouter, useParams } from "next/navigation"
import { useProduct } from "@/hooks/useProducts"
import { ProductForm } from "@/components/forms/product-form"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { data: product, isLoading } = useProduct(params.id as string)

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  if (!product) {
    return <div className="text-center py-8 text-error">Sản phẩm không tìm thấy</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin sản phẩm</p>
      </div>

      <ProductForm product={product} onSuccess={() => router.push("/admin/products")} />
    </div>
  )
}
