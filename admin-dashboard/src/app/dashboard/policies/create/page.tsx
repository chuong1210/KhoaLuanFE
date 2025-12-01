"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PolicyForm } from "../components/policies/policy-form";
import { toast } from "sonner";
import { policyService } from "@/features/policy/services/policy-service";
import {
  CreatePolicyRequest,
  Policy,
  POLICY_TYPES,
  PolicyType,
} from "@/features/policy/types/policy";
export default function AdminCreatePolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") || undefined;

  const createMutation = useMutation({
    mutationFn: policyService.createPolicy,
    onSuccess: (data) => {
      toast.success("Tạo bản nháp thành công", {
        description: `Phiên bản v${data.version} đã được lưu.`,
      });
      router.push("/dashboard/policies");
    },
    onError: (err: any) =>
      toast.error("Lỗi khi tạo chính sách", { description: err.message }),
  });

  const handleCreate = (data: any) => {
    const request: CreatePolicyRequest = {
      ...data,
      effectiveDate: data.effectiveDate || undefined,
      // shopId: null // Admin không cần gửi shopId hoặc gửi null
    };
    createMutation.mutate(request);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PolicyForm
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
        defaultType={defaultType}
      />
    </div>
  );
}
