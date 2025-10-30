"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { paymentsAPI } from "@/lib/api/payments"

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => paymentsAPI.getPaymentMethods(),
  })
}

export const useInitPayment = () => {
  return useMutation({
    mutationFn: (data: any) => paymentsAPI.initPayment(data),
  })
}
