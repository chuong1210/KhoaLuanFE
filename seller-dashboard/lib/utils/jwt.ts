import { jwtDecode } from "jwt-decode"

export interface DecodedToken {
  userId: string
  scope: string
  username?: string
  user_profile?: {
    shopId?: string
    shopStatus?: "pending" | "approved" | "rejected" | null
  }
  shopId?: string
  shopStatus?: "pending" | "approved" | "rejected" | null
  exp: number
}


export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true
  return decoded.exp * 1000 < Date.now()
}
