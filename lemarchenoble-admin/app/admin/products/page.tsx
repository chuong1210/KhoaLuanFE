"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/useProducts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading, error } = useProducts(page, 10, { search })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <Link href="/admin/products/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-error">Lỗi khi tải dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tên sản phẩm</th>
                    <th className="text-left py-3 px-4">Giá</th>
                    <th className="text-left py-3 px-4">Cửa hàng</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.responses?.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.price.toLocaleString("vi-VN")} ₫</td>
                      <td className="py-3 px-4">{product.shopId}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            product.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"
                          }`}
                        >
                          {product.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Chỉnh sửa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
