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

        console.log("Decoded Token:", decoded);
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
              }}
            >
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle
              className="text-3xl font-bold"
              style={{ color: "#E65100" }}
            >
              Seller Dashboard
            </CardTitle>
            <CardDescription className="text-base mt-2 text-gray-600">
              Đăng nhập để quản lý cửa hàng của bạn
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold"
                style={{ color: "#E65100" }}
              >
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 border-2 focus:border-[#FF6A00] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold"
                style={{ color: "#E65100" }}
              >
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-2 focus:border-[#FF6A00] transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              disabled={isLoading}
              style={{
                background: isLoading
                  ? "#FFB38A"
                  : "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Bằng cách đăng nhập, bạn đồng ý với</p>
            <p className="mt-1">
              <span className="text-[#FF6A00] font-medium cursor-pointer hover:underline">
                Điều khoản dịch vụ
              </span>{" "}
              và{" "}
              <span className="text-[#FF6A00] font-medium cursor-pointer hover:underline">
                Chính sách bảo mật
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
