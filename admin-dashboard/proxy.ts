// src/proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Tên hàm MỚI bắt buộc là 'proxy' cho Next.js 16
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Console log để debug (sẽ hiện trong Terminal VS Code)
  console.log(`[PROXY] Checking path: ${pathname}`)
  console.log(`[PROXY] Token status: ${token ? "Found" : "Missing"}`)

  // 1. Nếu đang ở trang Login hoặc Home mà ĐÃ có token -> Đá về Dashboard
  if (pathname.startsWith("/auth/login") || pathname === "/") {
    if (token) {
      console.log(`[PROXY] Redirecting to Dashboard`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // 2. Nếu đang vào trang Dashboard (hoặc route bảo mật) mà KHÔNG có token -> Đá về Login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log(`[PROXY] Redirecting to Login (No Token)`)
      return NextResponse.redirect(new URL("/auth/login", request.url)) // Sửa lại đúng đường dẫn login của bạn
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
}