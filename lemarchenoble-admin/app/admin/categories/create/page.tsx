"use client"

import { useRouter } from "next/navigation"
import { useCreateCategory } from "@/hooks/useCategories"
import CategoryForm from "@/components/forms/category-form"
import { Card } from "@/components/ui/card"

export default function CreateCategoryPage() {
  const router = useRouter()
  const createMutation = useCreateCategory()

  const handleSubmit = async (formData: FormData) => {
    try {
      await createMutation.mutateAsync(formData)
      router.push("/categories")
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tạo Danh mục Mới</h1>
      <Card className="p-6">
        <CategoryForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </Card>
    </div>
  )
}
