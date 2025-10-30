"use client"

import { useRouter, useParams } from "next/navigation"
import { useBannerById, useUpdateBanner } from "@/hooks/useBanners"
import BannerForm from "@/components/forms/banner-form"
import { Card } from "@/components/ui/card"

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data: banner, isLoading } = useBannerById(id)
  const updateMutation = useUpdateBanner()

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push("/banners")
    } catch (error) {
      console.error("Error updating banner:", error)
    }
  }

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chỉnh sửa Banner</h1>
      <Card className="p-6">
        <BannerForm onSubmit={handleSubmit} initialData={banner} isLoading={updateMutation.isPending} />
      </Card>
    </div>
  )
}
