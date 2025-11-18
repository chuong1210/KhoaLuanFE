"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, User, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.username);
  const shopId = useAppSelector((state) => state.auth.shopId);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header
      className="flex h-16 items-center justify-between border-b px-6 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 100%)",
        borderBottomColor: "#FFB38A",
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <h1
          className="text-xl font-bold"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #E65100 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Quản lý cửa hàng
        </h1>

        {shopId && (
          <Badge
            className="text-white font-medium"
            style={{ backgroundColor: "#FF8A33" }}
          >
            Shop: {shopId}
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm đơn hàng, sản phẩm..."
            className="pl-10 border-[#FFB38A] focus:border-[#FF6A00] focus:ring-[#FF6A00]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-[#FFF0E0]"
          style={{ color: "#FF6A00" }}
        >
          <Bell className="h-5 w-5" />
          <Badge
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs text-white border-2 border-white"
            style={{ backgroundColor: "#E65100" }}
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-[#FFF0E0]"
            >
              <Avatar className="h-8 w-8 ring-2 ring-[#FFB38A]">
                <AvatarImage
                  src="/placeholder-user.jpg"
                  alt={username || "User"}
                />
                <AvatarFallback
                  className="text-white font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF8A33 0%, #FFB38A 100%)",
                  }}
                >
                  {username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className="text-sm font-semibold hidden md:block"
                style={{ color: "#E65100" }}
              >
                {username || "Seller"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[#FFB38A]">
            <DropdownMenuLabel
              className="font-semibold"
              style={{ color: "#E65100" }}
            >
              Tài khoản của tôi
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#FFB38A]/30" />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="hover:bg-[#FFF0E0] cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" style={{ color: "#FF8A33" }} />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="hover:bg-[#FFF0E0] cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" style={{ color: "#FF8A33" }} />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#FFB38A]/30" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:bg-red-50 cursor-pointer"
              style={{ color: "#E65100" }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
