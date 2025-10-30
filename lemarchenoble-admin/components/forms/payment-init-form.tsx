"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInitPayment } from "@/hooks/usePayments"

interface PaymentInitFormProps {
  onSuccess?: () => void
}

export default function PaymentInitForm({ onSuccess }: PaymentInitFormProps) {
  const [formData, setFormData] = useState({
    order_id: "",
    amount: "",
    payment_method_id: "",
    order_info: "",
  })

  const initPaymentMutation = useInitPayment()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await initPaymentMutation.mutateAsync(formData)
      onSuccess?.()
    } catch (error) {
      console.error("Error initializing payment:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Mã Đơn hàng</label>
        <Input name="order_id" value={formData.order_id} onChange={handleChange} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Số tiền</label>
        <Input name="amount" type="number" value={formData.amount} onChange={handleChange} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
        <Input
          name="payment_method_id"
          value={formData.payment_method_id}
          onChange={handleChange}
          placeholder="UUID phương thức thanh toán"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thông tin đơn hàng</label>
        <Input name="order_info" value={formData.order_info} onChange={handleChange} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={initPaymentMutation.isPending}>
          {initPaymentMutation.isPending ? "Đang xử lý..." : "Khởi tạo Thanh toán"}
        </Button>
      </div>
    </form>
  )
}
