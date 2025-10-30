"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/auth-slice";
import { authService } from "@/services/auth-service";
import { decodeToken } from "@/lib/utils/jwt";
import { cookies } from "@/lib/utils/cookies";
import { toast } from "sonner";
import { Store } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("seller101204");
  const [password, setPassword] = useState("11111111");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.code === 10000) {
        const token = response.result.token;
        const decoded = decodeToken(token);

        if (!decoded) {
          toast.error("Token không hợp lệ");
          return;
        }

        // Check if user has ROLE_SELLER
        if (!decoded.scope.includes("ROLE_SELLER")) {
          toast.error("Bạn không có quyền truy cập trang này");
          return;
        }

        cookies.set("token", token, 7);

        dispatch(
          setCredentials({
            token,
            userId: decoded.userId,
            shopId: decoded.user_profile?.shopId || null,
            // shopStatus:
            //   decoded.user_profile?.shopStatus || decoded.shopStatus || null,
            role: decoded.scope,
            username: decoded.username || username,
          })
        );

        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Store className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Seller Dashboard</CardTitle>
          <CardDescription>
            Đăng nhập để quản lý cửa hàng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
