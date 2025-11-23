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
        "relative flex flex-col transition-all duration-300 overflow-hidden min-h-screen",
        collapsed ? "w-[72px]" : "w-64"
      )}
      style={{
        background: "linear-gradient(180deg, #FF6A00 0%, #E65100 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-64 h-64 bg-[#FFB000]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full text-white">
        {/* Logo Section */}
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FFB000 0%, #FF8A33 100%)",
                  boxShadow: "0 4px 15px rgba(255, 176, 0, 0.3)",
                }}
              >
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">Seller Hub</span>
                <span className="text-[10px] text-white/60 font-medium tracking-wider uppercase">Dashboard</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto group">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FFB000 0%, #FF8A33 100%)",
                  boxShadow: "0 4px 15px rgba(255, 176, 0, 0.3)",
                }}
              >
                <Store className="h-5 w-5 text-white" />
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
            className="h-6 w-6 rounded-full bg-white shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color: "#FF6A00" }}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
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
                      "w-full justify-start gap-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 h-11 rounded-xl font-medium",
                      isActive &&
                        "bg-white/20 text-white font-semibold shadow-sm hover:bg-white/25 backdrop-blur-sm",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <div className={cn(
                      "flex items-center justify-center transition-all duration-200",
                      isActive && "scale-110"
                    )}>
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFB000] animate-pulse" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer Section */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* Pro tip card */}
            <div
              className="rounded-xl p-3.5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(255,176,0,0.2) 0%, rgba(255,138,51,0.15) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#FFB000]" />
                <p className="text-xs font-semibold text-white">Mẹo hay</p>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Cập nhật sản phẩm thường xuyên để tăng độ hiển thị trên hệ thống
              </p>
            </div>

            {/* Version info */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] text-white/50 font-medium">Phiên bản</p>
              <p className="text-xs font-semibold text-white/80">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
