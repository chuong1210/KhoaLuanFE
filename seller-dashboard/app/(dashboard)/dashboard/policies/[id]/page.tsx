"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { policyService } from "@/services/policy-service";
import { PolicyForm } from "@/app/(dashboard)/dashboard/policies/components/policies/policy-form";
import { UpdatePolicyRequest } from "@/types/policy";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditPolicyPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();

    // 1. Lấy dữ liệu chi tiết
    const { data: policy, isLoading, error } = useQuery({
        queryKey: ["policy", id],
        queryFn: () => policyService.getPolicyById(id),
        retry: 1,
    });

    // 2. Mutation Update
    const updateMutation = useMutation({
        mutationFn: (data: UpdatePolicyRequest) => policyService.updatePolicy(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] });
            queryClient.invalidateQueries({ queryKey: ["policy", id] });
            toast.success("Cập nhật chính sách thành công");
            router.push("/dashboard/policies");
        },
        onError: (error: any) => {
            toast.error("Cập nhật thất bại", {
                description: error.response?.data?.messages?.[0] || "Lỗi hệ thống",
            });
        },
    });

    const handleUpdate = (formData: any) => {
        const requestData: UpdatePolicyRequest = {
            policyName: formData.policyName,
            policyContent: formData.policyContent,
            effectiveDate: formData.effectiveDate || null,
            // isActive không gửi lên đây, phải dùng nút Publish riêng
        };
        updateMutation.mutate(requestData);
    };

    // 3. Loading State
    if (isLoading) {
        return (
            <div className="p-10 max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-64 bg-orange-100" />
                    <Skeleton className="h-10 w-32 bg-orange-100" />
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <Skeleton className="h-96 col-span-1 bg-orange-50" />
                    <Skeleton className="h-96 col-span-2 bg-orange-50" />
                </div>
            </div>
        );
    }

    // 4. Error State (Không tìm thấy)
    if (error) {
        return (
            <div className="p-10 flex flex-col items-center justify-center">
                <Alert variant="destructive" className="max-w-md mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>Không tìm thấy chính sách hoặc bạn không có quyền truy cập.</AlertDescription>
                </Alert>
                <Button onClick={() => router.push("/dashboard/policies")}>Quay lại danh sách</Button>
            </div>
        );
    }

    // 5. Logic Guard: Nếu chính sách đang Active -> Không cho sửa
    if (policy && policy.isActive) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-100 text-center max-w-lg">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể chỉnh sửa</h2>
                    <p className="text-gray-500 mb-6">
                        Chính sách <b>{policy.policyName}</b> đang ở trạng thái <span className="text-green-600 font-medium">Hoạt động</span>.
                        <br />Hệ thống không cho phép chỉnh sửa trực tiếp để đảm bảo tính toàn vẹn dữ liệu.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.back()}>
                            Quay lại
                        </Button>
                        <Button
                            className="bg-[#FF6A00] hover:bg-[#E65100]"
                            onClick={() => router.push(`/dashboard/policies/create?type=${policy.policyType}`)}
                        >
                            Tạo phiên bản mới (v{policy.version + 1})
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 6. Render Form khi hợp lệ
    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <PolicyForm
                initialData={policy}
                isSubmitting={updateMutation.isPending}
                onSubmit={handleUpdate}
            />
        </div>
    );
}