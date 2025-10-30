"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { policyService } from "@/services/policy-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, FileText } from "lucide-react"
import type { PolicyFormData } from "@/types/policy"

export default function CreatePolicyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PolicyFormData>({
    title: "",
    content: "",
    version: "1.0",
  })

  const createPolicyMutation = useMutation({
    mutationFn: policyService.createPolicy,
    onSuccess: () => {
      toast.success("Đã tạo chính sách thành công")
      router.push("/dashboard/policies")
    },
    onError: (error: any) => {
      toast.error("Tạo chính sách thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPolicyMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tạo Chính sách mới</h2>
          <p className="text-muted-foreground">Tạo chính sách cho cửa hàng của bạn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Chính sách</CardTitle>
          <CardDescription>Điền đầy đủ thông tin để tạo chính sách mới. Hỗ trợ Markdown.</CardDescription>
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
                placeholder="Chính sách đổi trả hàng"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Phiên bản *</Label>
              <Input
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="1.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung (Markdown) *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="# Chính sách đổi trả&#10;&#10;## Điều kiện đổi trả&#10;- Sản phẩm còn nguyên tem, mác&#10;- Trong vòng 7 ngày kể từ ngày mua"
                rows={15}
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">Sử dụng Markdown để định dạng nội dung</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createPolicyMutation.isPending} className="flex-1">
                {createPolicyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo chính sách
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
