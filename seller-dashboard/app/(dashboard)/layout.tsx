"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setShopLoading, setShopData, setShopError } from "@/store/shop-slice";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Store,
  Package,
  ShoppingCart,
  Ticket,
  Wallet,
  FileText,
  ImageIcon,
  Truck,
  Users,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import { apiClient } from "@/lib/api/axios-instance";
import { shopService } from "@/services/shop-service";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  const { data: shopData } = useAppSelector((state) => state.shop);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!isAuthenticated) return;

      try {
        dispatch(setShopLoading());
        const response = await shopService.getCurrentShop();
        if (response) {
          dispatch(setShopData(response));
        }
      } catch (error) {
        console.log("[v0] No shop found or error fetching shop:", error);
        dispatch(setShopError("Failed to fetch shop data"));
      }
    };

    if (isInitialized && isAuthenticated) {
      fetchShopData();
    }
  }, [isAuthenticated, isInitialized, dispatch]);

  useEffect(() => {
    console.log("[v0] Dashboard layout - Auth state:", {
      isAuthenticated,
      isInitialized,
    });

    if (isInitialized) {
      if (!isAuthenticated) {
        console.log("[v0] Not authenticated, redirecting to login");
        router.push("/login");
      } else {
        console.log("[v0] Authenticated, showing dashboard");
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasApprovedShop = shopData && shopData.shopStatus === true;
  console.log("[v0] Shop data:", shopData);
  const allMenuItems = [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Quản lý Shop",
      icon: Store,
      href: "/dashboard/shop",
    },
    {
      title: "Sản phẩm",
      icon: Package,
      href: "/dashboard/products",
    },
    {
      title: "Đơn hàng",
      icon: ShoppingCart,
      href: "/dashboard/orders",
    },
    {
      title: "Voucher",
      icon: Ticket,
      href: "/dashboard/vouchers",
    },
    {
      title: "Ví tiền",
      icon: Wallet,
      href: "/dashboard/wallet",
    },
    {
      title: "Chính sách",
      icon: FileText,
      href: "/dashboard/policies",
    },
    {
      title: "Banner",
      icon: ImageIcon,
      href: "/dashboard/banners",
    },
    {
      title: "Vận chuyển",
      icon: Truck,
      href: "/dashboard/transfers",
    },
    {
      title: "Theo dõi",
      icon: Users,
      href: "/dashboard/follows",
    },
    {
      title: "Tin nhắn",
      icon: MessageSquare,
      href: "/dashboard/messages",
    },
  ];

  const menuItems = hasApprovedShop
    ? allMenuItems
    : [allMenuItems[0], allMenuItems[1]];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar menuItems={menuItems} currentPath={pathname} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
