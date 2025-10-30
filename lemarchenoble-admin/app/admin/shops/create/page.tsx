"use client"

import { useRouter } from "next/navigation"
import { ShopForm } from "@/components/forms/shop-form"

export default function CreateShopPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tạo cửa hàng mới</h1>
        <p className="text-gray-600 mt-2">Thêm một cửa hàng mới vào hệ thống</p>
      </div>

      <ShopForm onSuccess={() => router.push("/admin/shops")} />
    </div>
  )
}
