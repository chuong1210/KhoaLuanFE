"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Store, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface DashboardSidebarProps {
  menuItems: MenuItem[];
  currentPath: string;
}

export function DashboardSidebar({
  menuItems,
  currentPath,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col transition-all duration-300 overflow-hidden min-h-screen border-r",
        collapsed ? "w-[72px]" : "w-64"
      )}
      style={{
        background:
          "linear-gradient(180deg, #FFFBF5 0%, #FFF8F0 50%, #FFF5EB 100%)",
        borderColor: "#FFE4CC",
      }}
    >
      {/* Decorative elements - Subtle and elegant */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-radial from-orange-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-radial from-amber-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-radial from-orange-50/20 to-transparent rounded-full blur-2xl" />

        {/* Elegant pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F97316' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z' fill-opacity='0.05'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex h-[72px] items-center justify-between border-b border-orange-100/50 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)",
                }}
              >
                <Store className="h-5 w-5 text-orange-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Seller Hub
                </span>
                <span className="text-[10px] text-orange-400/80 font-medium tracking-wider uppercase">
                  Dashboard
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto group">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)",
                }}
              >
                <Store className="h-5 w-5 text-orange-700" />
              </div>
            </Link>
          )}
        </div>

        {/* Toggle Button */}
        <div className="absolute top-[78px] -right-3 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 rounded-full bg-white shadow-md hover:bg-orange-50 transition-all duration-200 hover:scale-110 active:scale-95 border border-orange-100"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-orange-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-orange-600" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 px-3 py-6">
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.href ||
                currentPath.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-orange-700/70 hover:bg-orange-50/80 hover:text-orange-700 transition-all duration-200 h-11 rounded-xl font-medium",
                      isActive &&
                        "bg-gradient-to-r from-orange-100/80 to-amber-50/80 text-orange-700 font-semibold shadow-sm hover:from-orange-100 hover:to-amber-50 border border-orange-200/50",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-all duration-200",
                        isActive && "scale-110"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-sm" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer Section */}
        {!collapsed && (
          <div className="border-t border-orange-100/50 p-4 space-y-3">
            {/* Pro tip card */}
            <div
              className="rounded-xl p-3.5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(254, 215, 170, 0.3) 0%, rgba(253, 186, 116, 0.2) 100%)",
                border: "1px solid rgba(249, 115, 22, 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-semibold text-orange-700">Mẹo hay</p>
              </div>
              <p className="text-[11px] text-orange-600/80 leading-relaxed">
                Cập nhật sản phẩm thường xuyên để tăng độ hiển thị trên hệ thống
              </p>
            </div>

            {/* Version info */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] text-orange-400/70 font-medium">
                Phiên bản
              </p>
              <p className="text-xs font-semibold text-orange-600/90">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
