"use client"

import { useState } from "react"
import Link from "next/link"
import { usePolicies, useDeletePolicy } from "@/hooks/usePolicies"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function PoliciesPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = usePolicies(pageNumber, pageSize)
  const deleteMutation = useDeletePolicy()

  const columns = [
    { key: "PolicyName", label: "Tên Chính sách" },
    { key: "PolicyType", label: "Loại" },
    { key: "IsActive", label: "Trạng thái", render: (value: boolean) => (value ? "Hoạt động" : "Không hoạt động") },
  ]

  const actions = [
    {
      label: "Chỉnh sửa",
      icon: Edit,
      onClick: (row: any) => (window.location.href = `/policies/${row.id}/edit`),
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
        <h1 className="text-3xl font-bold">Quản lý Chính sách</h1>
        <Link href="/policies/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Chính sách
          </Button>
        </Link>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data || []}
          actions={actions}
          isLoading={isLoading}
          pagination={{
            pageNumber,
            pageSize,
            total: data?.total || 0,
            onPageChange: setPageNumber,
            onPageSizeChange: setPageSize,
          }}
        />
      </Card>
    </div>
  )
}
