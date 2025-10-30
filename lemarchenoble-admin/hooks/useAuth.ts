"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { setAuth, setLoading } from "@/store/slices/authSlice"
import { decodeToken } from "@/lib/utils"
import type { RootState } from "@/store"
import * as authApi from "@/lib/api/auth"

export function useAuth() {
  const dispatch = useDispatch()
  const router = useRouter()
  const auth = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = decodeToken(token)
      if (decoded) {
        dispatch(
          setAuth({
            token,
            userId: decoded.userId,
            role: decoded.role,
          }),
        )
      }
    }
    dispatch(setLoading(false))
  }, [dispatch])

  const login = async (username: string, password: string) => {
    try {
      const result = await authApi.login({ username, password })
      const decoded = decodeToken(result.token)
      if (decoded) {
        localStorage.setItem("token", result.token)
        dispatch(
          setAuth({
            token: result.token,
            userId: decoded.userId,
            role: decoded.role,
          }),
        )
        router.push("/admin/dashboard")
      }
    } catch (error) {
      throw error
    }
  }

  return { ...auth, login }
}
