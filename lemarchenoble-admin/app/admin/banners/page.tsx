"use client"

import { useState } from "react"
import Link from "next/link"
import { useBanners, useDeleteBanner } from "@/hooks/useBanners"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function BannersPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useBanners(pageNumber, pageSize)
  const deleteMutation = useDeleteBanner()

  const columns = [
    { key: "BannerName", label: "Tên Banner" },
    { key: "BannerType", label: "Loại" },
    { key: "IsActive", label: "Trạng thái", render: (value: boolean) => (value ? "Hoạt động" : "Không hoạt động") },
    { key: "BannerOrder", label: "Thứ tự" },
  ]

  const actions = [
    {
      label: "Chỉnh sửa",
      icon: Edit,
      onClick: (row: any) => (window.location.href = `/banners/${row.id}/edit`),
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
        <h1 className="text-3xl font-bold">Quản lý Banner</h1>
        <Link href="/banners/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Banner
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
