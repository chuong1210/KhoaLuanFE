"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/data-table/data-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function TransactionsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const columns = [
    { key: "order_id", label: "Mã Đơn hàng" },
    { key: "amount", label: "Số tiền" },
    { key: "payment_method_id", label: "Phương thức" },
    { key: "status", label: "Trạng thái" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
        <Link href="/payments/transactions/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Giao dịch
          </Button>
        </Link>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={[]}
          pagination={{
            pageNumber,
            pageSize,
            total: 0,
            onPageChange: setPageNumber,
            onPageSizeChange: setPageSize,
          }}
        />
      </Card>
    </div>
  )
}
