"use client"

import { useRouter, useParams } from "next/navigation"
import { useShop } from "@/hooks/useShops"
import { ShopForm } from "@/components/forms/shop-form"

export default function EditShopPage() {
  const router = useRouter()
  const params = useParams()
  const { data: shop, isLoading } = useShop(params.id as string)

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  if (!shop) {
    return <div className="text-center py-8 text-error">Cửa hàng không tìm thấy</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa cửa hàng</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin cửa hàng</p>
      </div>

      <ShopForm shop={shop} onSuccess={() => router.push("/admin/shops")} />
    </div>
  )
}
