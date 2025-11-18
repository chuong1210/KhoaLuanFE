"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
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
        "relative flex flex-col transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
      style={{
        background: "linear-gradient(180deg, #FF6A00 0%, #E65100 100%)",
      }}
    >
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full text-white">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/20 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB000 0%, #FF8A33 100%)",
                }}
              >
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Seller Dashboard</span>
            </Link>
          )}
          {collapsed && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg mx-auto"
              style={{
                background: "linear-gradient(135deg, #FFB000 0%, #FF8A33 100%)",
              }}
            >
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="absolute top-20 -right-3 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 rounded-full bg-white shadow-md hover:bg-white/90 transition-transform hover:scale-110"
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
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.href ||
                currentPath.startsWith(item.href + "/");

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-white/90 hover:bg-white/15 hover:text-white transition-all duration-200",
                      isActive &&
                        "bg-white/20 text-white font-semibold shadow-sm hover:bg-white/25",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer info */}
        {!collapsed && (
          <div className="border-t border-white/20 p-4">
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/70 mb-1">Phiên bản</p>
              <p className="text-sm font-semibold text-white">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
