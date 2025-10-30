"use client"

import { useRouter, useParams } from "next/navigation"
import { useUpdateCategory } from "@/hooks/useCategories"
import CategoryForm from "@/components/forms/category-form"
import { Card } from "@/components/ui/card"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const updateMutation = useUpdateCategory()

  const handleSubmit = async (formData: FormData) => {
    try {
      formData.append("cate_id", id)
      await updateMutation.mutateAsync(formData)
      router.push("/categories")
    } catch (error) {
      console.error("Error updating category:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chỉnh sửa Danh mục</h1>
      <Card className="p-6">
        <CategoryForm onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
      </Card>
    </div>
  )
}
