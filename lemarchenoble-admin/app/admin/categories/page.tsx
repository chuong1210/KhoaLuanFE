"use client"
import Link from "next/link"
import { useCategories, useDeleteCategory } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function CategoriesPage() {
  const { data, isLoading } = useCategories()
  const deleteMutation = useDeleteCategory()

  const columns = [
    { key: "name", label: "Tên Danh mục" },
    { key: "parent", label: "Danh mục cha" },
  ]

  const actions = [
    {
      label: "Chỉnh sửa",
      icon: Edit,
      onClick: (row: any) => (window.location.href = `/categories/${row.id}/edit`),
    },
    {
      label: "Xóa",
      icon: Trash2,
      onClick: (row: any) => {
        if (confirm("Bạn chắc chắn muốn xóa?")) {
          deleteMutation.mutate(row.id)
        }
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
        <Link href="/categories/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Danh mục
          </Button>
        </Link>
      </div>

      <Card>
        <DataTable columns={columns} data={data?.data || []} actions={actions} isLoading={isLoading} />
      </Card>
    </div>
  )
}
