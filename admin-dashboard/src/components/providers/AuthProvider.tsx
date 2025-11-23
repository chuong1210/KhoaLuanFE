'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAuth } from '@/store'
import { initializeAuth } from '@/store/slices/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password']

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth/login')
      }

      if (isAuthenticated && isPublicRoute) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft-glow">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-vivid border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
