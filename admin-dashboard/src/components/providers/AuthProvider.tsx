// src/components/providers/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { initializeAuth } from "@/store/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Chỉ cần gọi hàm này để Redux lấy data từ Cookie lên Store
    dispatch(initializeAuth());
  }, [dispatch]);

  // Không cần return Loading state ở đây nữa vì Middleware đã đảm bảo
  // user vào được dashboard là đã có token rồi.
  // Tuy nhiên, để UI mượt mà khi Redux đang load user info, bạn vẫn có thể giữ spinner nếu muốn.

  return <>{children}</>;
}
