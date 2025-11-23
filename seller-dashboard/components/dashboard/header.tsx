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
import {
  Bell,
  LogOut,
  Settings,
  User,
  Search,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
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
      className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b px-6"
      style={{
        background: "linear-gradient(90deg, #FFF0E0 0%, #FFFFFF 50%, #FFFFFF 100%)",
        borderBottomColor: "rgba(255, 179, 138, 0.3)",
        boxShadow: "0 1px 3px rgba(255, 106, 0, 0.05)",
      }}
    >
      {/* Left Section - Title & Shop Badge */}
      <div className="flex items-center gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #E65100 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Quản lý cửa hàng
          </h1>
          <p className="text-xs text-[#78716C] mt-0.5">Chào mừng bạn trở lại</p>
        </div>

        {shopId && (
          <Badge
            className="text-white font-medium px-3 py-1 rounded-full text-xs shadow-sm"
            style={{
              background: "linear-gradient(135deg, #FF8A33 0%, #FFB38A 100%)",
            }}
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            Shop: {shopId}
          </Badge>
        )}
      </div>

      {/* Center Section - Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FFB38A] transition-colors group-focus-within:text-[#FF6A00]" />
          <Input
            placeholder="Tìm kiếm đơn hàng, sản phẩm..."
            className="w-full pl-11 pr-4 h-11 rounded-xl border-[#FFB38A]/40 bg-white/80 backdrop-blur-sm
                       focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20
                       placeholder:text-[#A8A29E] text-[#1C1917] transition-all duration-200
                       hover:border-[#FFB38A]"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:inline-flex h-6 items-center gap-1 rounded-md border border-[#FFB38A]/30 bg-[#FFF0E0] px-2 text-[10px] font-medium text-[#78716C]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-[#78716C] hover:text-[#FF6A00] hover:bg-[#FFF0E0] transition-all duration-200"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl text-[#78716C] hover:text-[#FF6A00] hover:bg-[#FFF0E0] transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
            style={{ background: "linear-gradient(135deg, #E65100 0%, #FF6A00 100%)" }}
          >
            3
          </span>
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-[#FFB38A]/30 mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-11 px-3 rounded-xl hover:bg-[#FFF0E0] transition-all duration-200 group"
            >
              <Avatar className="h-9 w-9 ring-2 ring-[#FFB38A]/50 transition-all duration-200 group-hover:ring-[#FF6A00]/50">
                <AvatarImage
                  src="/placeholder-user.jpg"
                  alt={username || "User"}
                />
                <AvatarFallback
                  className="text-white font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
                  }}
                >
                  {username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-[#1C1917]">
                  {username || "Seller"}
                </span>
                <span className="text-[10px] text-[#78716C]">Quản lý viên</span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#78716C] hidden md:block transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-2 rounded-xl border-[#FFB38A]/30 shadow-lg"
            style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF0E0 100%)" }}
          >
            {/* User Info Header */}
            <div className="px-3 py-3 mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-[#FFB38A]/30">
                  <AvatarFallback
                    className="text-white font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)",
                    }}
                  >
                    {username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-[#1C1917]">{username || "Seller"}</p>
                  <p className="text-xs text-[#78716C]">seller@example.com</p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-[#FFB38A]/20" />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#FFF0E0] focus:bg-[#FFF0E0] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0E0]">
                <User className="h-4 w-4 text-[#FF6A00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1C1917]">Hồ sơ của tôi</p>
                <p className="text-[10px] text-[#78716C]">Xem và chỉnh sửa thông tin</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#FFF0E0] focus:bg-[#FFF0E0] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0E0]">
                <Settings className="h-4 w-4 text-[#FF6A00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1C1917]">Cài đặt</p>
                <p className="text-[10px] text-[#78716C]">Tùy chỉnh tài khoản</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#FFB38A]/20 my-2" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-colors group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-4 w-4 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#E65100]">Đăng xuất</p>
                <p className="text-[10px] text-[#78716C]">Thoát khỏi tài khoản</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
