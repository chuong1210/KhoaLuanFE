import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-processing',
    SHIPPED: 'badge-info',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-error',
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-error',
    EXPIRED: 'badge-error',
  }
  return statusColors[status] || 'badge-info'
}

export function parseQueryParams(
  params: Record<string, unknown> | { [key: string]: unknown }
): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Add this to @/lib/utils

export function getImageUrl(imageName: string | null | undefined): string {
  if (!imageName) return '/placeholder-product.png' // Add a placeholder image
  
  // If it's already a full URL (starts with http or https), return it
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName
  }
  
  // Otherwise, construct the media API URL
  return `http://localhost:9001/v1/media/${imageName}`
}