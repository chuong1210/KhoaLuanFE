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
import { setCredentials, setShopId } from "@/store/auth-slice";
import { setShopLoading, setShopData, setShopError } from "@/store/shop-slice";
import { authService } from "@/services/auth-service";
import { shopService } from "@/services/shop-service";
import { decodeToken } from "@/lib/utils/jwt";
import { cookies } from "@/lib/utils/cookies";
import { toast } from "sonner";
import { Store, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("seller101204");
  const [password, setPassword] = useState("11111111");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Logic giữ nguyên
  const fetchShopAfterLogin = async (token: string) => {
    dispatch(setShopLoading());
    try {
      const shop = await shopService.getCurrentShop();
      dispatch(setShopData(shop));
      dispatch(setShopId(shop.id));
      console.log("Fetched shop after login:", shop);
      toast.success("Đăng nhập và tải thông tin shop thành công!");
    } catch (error: any) {
      if (error.response?.status === 404) {
        dispatch(
          setShopError("Bạn chưa có shop. Vui lòng đăng ký shop để tiếp tục.")
        );
        toast.warning(
          "Chưa có shop? Bạn có thể đăng ký ngay sau khi đăng nhập!"
        );
        dispatch(setShopId(null));
      } else {
        dispatch(setShopError(error.message || "Lỗi tải thông tin shop"));
        toast.error("Lỗi tải thông tin shop, nhưng đăng nhập vẫn ok!");
      }
    }
  };

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

        if (!decoded.scope.includes("ROLE_SELLER")) {
          toast.error("Bạn không có quyền truy cập trang này");
          return;
        }

        cookies.set("token", token, 7);

        dispatch(
          setCredentials({
            token,
            userId: decoded.userId,
            shopId: null,
            role: decoded.scope,
            username: decoded.username || username,
          })
        );

        await fetchShopAfterLogin(token);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Blobs - Nhẹ nhàng hơn */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <Card className="w-full max-w-md shadow-xl border border-gray-100 bg-white relative z-10">
        <CardHeader className="space-y-3 text-center pb-6 pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-2">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription className="text-base mt-2 text-gray-500">
              Đăng nhập vào hệ thống Seller Dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </Label>
                <span className="text-xs text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                  Quên mật khẩu?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium text-white shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
              style={{
                backgroundColor: "#FF6A00", // Giữ màu brand chính
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Chưa có cửa hàng?{" "}
            <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
              Đăng ký ngay
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Footer text nhỏ */}
      <div className="absolute bottom-6 text-xs text-gray-400 text-center w-full">
        &copy; 2025 Seller Platform. All rights reserved.
      </div>
    </div>
  );
}
