import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from "jwt-decode"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeToken(token: string) {
  try {
    const decoded: any = jwtDecode(token)
    return {
      userId: decoded.sub || decoded.userId,
      role: decoded.scope || decoded.role,
      email: decoded.email,
    }
  } catch (error) {
    return null
  }
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("vi-VN")
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}
