"use client"

import { useState } from "react"
import { useShops, useApproveShop, useRejectShop, useDeleteShop } from "@/hooks/useShops"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table/data-table"
import { Plus, Search, Check, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function ShopsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useShops(page, 10, { search })
  const approveShop = useApproveShop()
  const rejectShop = useRejectShop()
  const deleteShop = useDeleteShop()

  const columns = [
    {
      key: "name" as const,
      label: "Tên cửa hàng",
    },
    {
      key: "id" as const,
      label: "ID",
      render: (value: string) => <span className="text-xs text-gray-500">{value.slice(0, 8)}</span>,
    },
    {
      key: "isActive" as const,
      label: "Trạng thái",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded text-sm ${value ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}
        >
          {value ? "Hoạt động" : "Chưa duyệt"}
        </span>
      ),
    },
    {
      key: "createdDate" as const,
      label: "Ngày tạo",
      render: (value: string) => formatDate(value),
    },
    {
      key: "id" as const,
      label: "Hành động",
      render: (value: string) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => approveShop.mutate(value)}
            disabled={approveShop.isPending}
          >
            <Check size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => rejectShop.mutate({ id: value, feedback: "Từ chối" })}
            disabled={rejectShop.isPending}
          >
            <X size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteShop.mutate(value)}
            disabled={deleteShop.isPending}
            className="text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý cửa hàng</h1>
        <Link href="/admin/shops/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            Thêm cửa hàng
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Tìm kiếm cửa hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.responses || []}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
