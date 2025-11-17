// components/ShopRegistrationPage.tsx
// Updated: Changed shopLogo and shopBanner inputs to file type (accept="image/*").
// FormData now holds File objects.
// Removed URL placeholders; added accept and multiple=false.
// In mutation, pass formData directly (service handles File upload).
// Added onChange for file inputs to set File | null.

"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { shopService } from "@/services/shop-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Store, Image as ImageIcon } from "lucide-react";
import type { ShopFormData } from "@/types/shop";

export default function ShopRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: "",
    shopDescription: "",
    shopLogo: undefined, // File | undefined
    shopBanner: undefined, // File | undefined
    shopEmail: "",
    shopPhone: "",
    shopAddress: "",
    shopPersonalIdentifyId: "",
    shopAddressId: "",
    shopTaxId: "",
  });

  const createShopMutation = useMutation({
    mutationFn: (data: ShopFormData) => shopService.createShopWithTax(data),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu đăng ký shop", {
        description: "Vui lòng chờ admin phê duyệt",
      });
      router.push("/dashboard/shop");
    },
    onError: (error: any) => {
      toast.error("Đăng ký shop thất bại", {
        description: error.message || "Vui lòng thử lại sau",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopTaxId) {
      toast.error("Vui lòng nhập mã số thuế");
      return;
    }
    createShopMutation.mutate(formData);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "shopLogo" | "shopBanner"
  ) => {
    const file = e.target.files?.[0] || undefined;
    setFormData({
      ...formData,
      [field]: file,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Store className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đăng ký Shop</h2>
          <p className="text-muted-foreground">
            Điền thông tin để đăng ký cửa hàng của bạn
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin. Yêu cầu của bạn sẽ được gửi đến
            admin để phê duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName">Tên cửa hàng *</Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                value={formData.shopName}
                onChange={handleTextChange}
                placeholder="Nhập tên cửa hàng"
                required
              />
            </div>

            {/* Shop Description */}
            <div className="space-y-2">
              <Label htmlFor="shopDescription">Mô tả cửa hàng</Label>
              <Textarea
                id="shopDescription"
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleTextChange}
                placeholder="Mô tả về cửa hàng của bạn"
                rows={4}
              />
            </div>

            {/* Shop Logo */}
            <div className="space-y-2">
              <Label htmlFor="shopLogo">Logo cửa hàng</Label>
              <Input
                id="shopLogo"
                name="shopLogo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "shopLogo")}
              />
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Chọn file hình ảnh logo của cửa hàng (tùy chọn)
              </p>
              {formData.shopLogo && typeof formData.shopLogo === "object" && (
                <p className="text-sm text-green-600">
                  Đã chọn: {(formData.shopLogo as File).name}
                </p>
              )}
            </div>

            {/* Shop Banner */}
            <div className="space-y-2">
              <Label htmlFor="shopBanner">Banner cửa hàng</Label>
              <Input
                id="shopBanner"
                name="shopBanner"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "shopBanner")}
              />
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Chọn file hình ảnh banner của cửa hàng (tùy chọn)
              </p>
              {formData.shopBanner &&
                typeof formData.shopBanner === "object" && (
                  <p className="text-sm text-green-600">
                    Đã chọn: {(formData.shopBanner as File).name}
                  </p>
                )}
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopEmail">Email *</Label>
                <Input
                  id="shopEmail"
                  name="shopEmail"
                  type="email"
                  value={formData.shopEmail}
                  onChange={handleTextChange}
                  placeholder="shop@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopPhone">Số điện thoại *</Label>
                <Input
                  id="shopPhone"
                  name="shopPhone"
                  type="tel"
                  value={formData.shopPhone}
                  onChange={handleTextChange}
                  placeholder="0123456789"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Địa chỉ *</Label>
              <Input
                id="shopAddress"
                name="shopAddress"
                type="text"
                value={formData.shopAddress}
                onChange={handleTextChange}
                placeholder="Nhập địa chỉ cửa hàng đầy đủ"
                required
              />
            </div>

            {/* Legal Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopPersonalIdentifyId">CMND/CCCD</Label>
                <Input
                  id="shopPersonalIdentifyId"
                  name="shopPersonalIdentifyId"
                  type="text"
                  value={formData.shopPersonalIdentifyId}
                  onChange={handleTextChange}
                  placeholder="Số CMND/CCCD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopTaxId">Mã số thuế *</Label>
                <Input
                  id="shopTaxId"
                  name="shopTaxId"
                  type="text"
                  value={formData.shopTaxId}
                  onChange={handleTextChange}
                  placeholder="Mã số thuế"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createShopMutation.isPending}
                className="flex-1"
              >
                {createShopMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gửi yêu cầu đăng ký
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
