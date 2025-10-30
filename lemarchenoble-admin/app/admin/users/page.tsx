"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table/data-table"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

// Mock data for users
const mockUsers = [
  { id: "1", email: "user1@example.com", username: "user1", role: "ROLE_USER", createdDate: "2024-01-15" },
  { id: "2", email: "admin@example.com", username: "admin", role: "ROLE_ADMIN", createdDate: "2024-01-10" },
  { id: "3", email: "seller@example.com", username: "seller", role: "ROLE_SELLER", createdDate: "2024-01-20" },
]

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const columns = [
    {
      key: "email" as const,
      label: "Email",
    },
    {
      key: "username" as const,
      label: "Tên đăng nhập",
    },
    {
      key: "role" as const,
      label: "Vai trò",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            value === "ROLE_ADMIN"
              ? "bg-primary/20 text-primary"
              : value === "ROLE_SELLER"
                ? "bg-secondary/20 text-secondary"
                : "bg-gray-200 text-gray-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "createdDate" as const,
      label: "Ngày tạo",
    },
    {
      key: "id" as const,
      label: "Hành động",
      render: (value: string) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Chỉnh sửa
          </Button>
          <Button size="sm" variant="outline" className="text-error hover:bg-error/10 bg-transparent">
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <Link href="/admin/users/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            Thêm người dùng
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockUsers} currentPage={page} totalPages={1} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}
