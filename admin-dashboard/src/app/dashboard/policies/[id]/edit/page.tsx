"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { policyService } from "@/features/policy/services/policy-service";
import { PolicyForm } from "../../components/policies/policy-form";
import {
  POLICY_TYPES,
  UpdatePolicyRequest,
} from "@/features/policy/types/policy";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Ban, History } from "lucide-react";

export default function AdminEditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  // 1. Fetch dữ liệu Policy hiện tại
  const {
    data: policy,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["policy", id],
    queryFn: () => policyService.getPolicyById(id),
    retry: 1, // Chỉ thử lại 1 lần nếu lỗi
  });

  // 2. Mutation Update
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePolicyRequest) =>
      policyService.updatePolicy(id, data),
    onSuccess: () => {
      // Invalidate cache để list cập nhật mới
      queryClient.invalidateQueries({ queryKey: ["admin-policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy", id] });

      toast.success("Cập nhật bản nháp thành công!", {
        style: { borderColor: "#FF6A00", color: "#E65100" },
      });
      router.push("/dashboard/policies");
    },
    onError: (error: any) => {
      toast.error("Cập nhật thất bại", {
        description: error.response?.data?.messages?.[0] || "Lỗi hệ thống",
      });
    },
  });

  const handleUpdate = (formData: any) => {
    // Chỉ gửi các trường cần thiết lên API Update
    const requestData: UpdatePolicyRequest = {
      policyName: formData.policyName,
      policyContent: formData.policyContent,
      effectiveDate: formData.effectiveDate || null,
      // isActive không được gửi ở đây, phải dùng API Publish riêng
    };
    updateMutation.mutate(requestData);
  };

  // --- RENDER STATES ---

  // 1. Loading Skeleton (Màu cam nhạt)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF0E0]/30 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 bg-orange-100" />
              <Skeleton className="h-10 w-64 bg-orange-100" />
            </div>
            <Skeleton className="h-10 w-32 bg-orange-100" />
          </div>
          {/* Form Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] col-span-1 bg-orange-50 rounded-xl" />
            <Skeleton className="h-[600px] col-span-2 bg-orange-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError || !policy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center max-w-md">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy chính sách
          </h2>
          <p className="text-gray-500 mb-6">
            Chính sách này không tồn tại hoặc đã bị xóa.
          </p>
          <Button
            onClick={() => router.push("/dashboard/policies")}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // 3. Logic Guard: Chặn sửa nếu đang Active
  if (policy.isActive) {
    return (
      <div className="min-h-screen bg-[#FFF0E0]/50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-100 text-center max-w-lg relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-orange-100/50 blur-2xl"></div>

          <div className="bg-gradient-to-br from-orange-100 to-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Ban className="h-10 w-10 text-[#E65100]" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Phiên bản đang hoạt động
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Chính sách <strong>{policy.policyName}</strong> (v{policy.version})
            đang được áp dụng trên hệ thống. Để đảm bảo tính toàn vẹn dữ liệu,
            bạn không thể chỉnh sửa trực tiếp.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-[#E65100]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <Button
              className="shadow-lg shadow-orange-500/20 text-white font-medium"
              style={{
                background: "linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)",
              }}
              onClick={() =>
                router.push(
                  `/dashboard/policies/create?type=${policy.policyType}`
                )
              }
            >
              <History className="mr-2 h-4 w-4" /> Tạo phiên bản mới (v
              {policy.version + 1})
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Render Form (khi hợp lệ - bản Draft)
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8">
      <PolicyForm
        initialData={policy}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
