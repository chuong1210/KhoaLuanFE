"use client"

import { useState } from "react"
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table/data-table"
import { Search } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useOrders(page, 10, { search })
  const updateStatus = useUpdateOrderStatus()

  const columns = [
    {
      key: "orderCode" as const,
      label: "Mã đơn hàng",
    },
    {
      key: "userId" as const,
      label: "Người dùng",
      render: (value: string) => <span className="text-xs text-gray-500">{value.slice(0, 8)}</span>,
    },
    {
      key: "totalAmount" as const,
      label: "Tổng tiền",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            value === "delivered"
              ? "bg-success/20 text-success"
              : value === "cancelled"
                ? "bg-error/20 text-error"
                : "bg-warning/20 text-warning"
          }`}
        >
          {value}
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
      render: (value: string, row: any) => (
        <div className="flex gap-2">
          <select
            value={row.status}
            onChange={(e) => updateStatus.mutate({ id: value, status: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
            disabled={updateStatus.isPending}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Tìm kiếm đơn hàng..."
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
