"use client"

import { usePaymentMethods } from "@/hooks/usePayments"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentsPage() {
  const { data, isLoading } = usePaymentMethods()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Thanh toán</h1>
        <Link href="/payments/transactions">
          <Button>Xem Giao dịch</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : (
          data?.map((method: any) => (
            <Card key={method.id} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{method.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Loại: {method.type}</p>
              <Button variant="outline" className="w-full bg-transparent">
                Cấu hình
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
