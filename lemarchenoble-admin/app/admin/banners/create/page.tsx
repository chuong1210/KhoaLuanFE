"use client"

import { useRouter } from "next/navigation"
import { useCreateBanner } from "@/hooks/useBanners"
import BannerForm from "@/components/forms/banner-form"
import { Card } from "@/components/ui/card"

export default function CreateBannerPage() {
  const router = useRouter()
  const createMutation = useCreateBanner()

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      router.push("/banners")
    } catch (error) {
      console.error("Error creating banner:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tạo Banner Mới</h1>
      <Card className="p-6">
        <BannerForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </Card>
    </div>
  )
}
