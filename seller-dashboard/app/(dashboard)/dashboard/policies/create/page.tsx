"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { policyService } from "@/services/policy-service";
import { PolicyForm } from "@/app/(dashboard)/dashboard/policies/components/policies/policy-form";
import { CreatePolicyRequest } from "@/types/policy";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

export default function CreatePolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = useAppSelector((state) => state.shop.data?.id);

  // Lấy type từ URL nếu người dùng bấm "Tạo phiên bản mới" từ list
  const defaultType = searchParams.get("type") || undefined;

  const createMutation = useMutation({
    mutationFn: policyService.createPolicy,
    onSuccess: (data) => {
      toast.success("Đã tạo bản nháp chính sách thành công!", {
        description: `Phiên bản v${data.version} đã được lưu.`,
        style: { borderColor: "#FF6A00", color: "#E65100" }
      });
      router.push("/dashboard/policies");
    },
    onError: (error: any) => {
      toast.error("Không thể tạo chính sách", {
        description: error.response?.data?.messages?.[0] || "Vui lòng thử lại sau.",
      });
    },
  });

  const handleCreate = (formData: any) => {
    // Mapping data từ form sang request body chuẩn
    const requestData: CreatePolicyRequest = {
      policyName: formData.policyName,
      policyContent: formData.policyContent,
      policyType: formData.policyType,
      effectiveDate: formData.effectiveDate || undefined,
      shopId: shopId, // ShopId sẽ được backend tự xử lý nếu user là Seller
    };

    createMutation.mutate(requestData);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <PolicyForm
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
        defaultType={defaultType}
      />
    </div>
  );
}