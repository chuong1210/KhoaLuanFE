"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { bannerService } from "@/services/banner-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ImageIcon } from "lucide-react"
import type { BannerFormData } from "@/types/banner"

export default function CreateBannerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    image: "",
    link: "",
    order: 1,
    startDate: "",
    endDate: "",
  })

  const createBannerMutation = useMutation({
    mutationFn: bannerService.createBanner,
    onSuccess: () => {
      toast.success("Đã tạo banner thành công")
      router.push("/dashboard/banners")
    },
    onError: (error: any) => {
      toast.error("Tạo banner thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createBannerMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number.parseInt(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <ImageIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tạo Banner mới</h2>
          <p className="text-muted-foreground">Tạo banner quảng cáo cho cửa hàng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Banner</CardTitle>
          <CardDescription>Điền đầy đủ thông tin để tạo banner mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Banner khuyến mãi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Hình ảnh (URL) *</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                type="url"
                required
              />
              {formData.image && (
                <div className="mt-2 h-32 w-full overflow-hidden rounded border">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link đích *</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com/promotion"
                type="url"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Thứ tự hiển thị *</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
              <p className="text-sm text-muted-foreground">Banner có thứ tự nhỏ hơn sẽ hiển thị trước</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createBannerMutation.isPending} className="flex-1">
                {createBannerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo banner
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
