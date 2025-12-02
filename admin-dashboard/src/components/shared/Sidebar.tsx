"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Ticket,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Image,
  FileText, // Icon cho Chính sách
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useSidebarCollapsed } from "@/store";
import { toggleSidebarCollapse } from "@/store/slices/uiSlice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Cửa hàng",
    icon: Store,
    href: "/dashboard/shops",
  },
  {
    title: "Danh mục",
    icon: FolderTree,
    href: "/dashboard/categories",
  },
  {
    title: "Chính sách",
    icon: FileText, // Đã thêm icon FileText vào đây
    href: "/dashboard/policies",
  },
  {
    title: "Duyệt sản phẩm",
    icon: Package,
    href: "/dashboard/products",
  },
  {
    title: "Đơn hàng",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    title: "Vouchers",
    icon: Ticket,
    href: "/dashboard/vouchers",
  },
  {
    title: "Thống kê",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    title: "Tài chính",
    icon: Wallet,
    href: "/dashboard/finance",
  },
  {
    title: "Banner",
    icon: Image,
    href: "/dashboard/banners",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useSidebarCollapsed();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-orange-50 to-white border-r border-orange-200 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-orange-100/50">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FFB000] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg tracking-tight">
                Le Marché
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#FF6A00] tracking-wider">
                Admin Panel
              </span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FFB000] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">L</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(toggleSidebarCollapse())}
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-orange-200 bg-white shadow-sm hover:bg-orange-50 text-orange-600"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Menu Items */}
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#FFB000] text-white shadow-md shadow-orange-500/20"
                    : "text-gray-600 hover:bg-orange-50 hover:text-[#E65100]",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    isCollapsed ? "h-6 w-6" : "mr-1",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 pt-4 border-t border-orange-100 mt-4">
          <Link
            href="/dashboard/settings"
            title={isCollapsed ? "Cài đặt" : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-[#E65100] transition-all duration-200 group",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings
              className={cn(
                "h-5 w-5 group-hover:rotate-90 transition-transform duration-500",
                isCollapsed && "h-6 w-6"
              )}
            />
            {!isCollapsed && <span className="font-medium">Cài đặt</span>}
          </Link>
        </div>
      </ScrollArea>
    </aside>
  );
}
