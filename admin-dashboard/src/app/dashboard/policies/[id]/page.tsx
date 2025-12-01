"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { policyService } from "@/features/policy/services/policy-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Edit, Tag } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { POLICY_TYPES } from "@/features/policy/types/policy";

export default function AdminPolicyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy", id],
    queryFn: () => policyService.getPolicyById(id as string),
  });

  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  if (!policy) return <div className="p-8">Không tìm thấy chính sách.</div>;

  const typeLabel = POLICY_TYPES.find(
    (t) => t.value === policy.policyType
  )?.label;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Button>
          {!policy.isActive && (
            <Button
              onClick={() =>
                router.push(`/dashboard/policies/${policy.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa bản nháp
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="border-b bg-white sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="active">{typeLabel}</Badge>
                  <Badge
                    className={
                      policy.isActive ? "bg-green-600" : "bg-slate-500"
                    }
                  >
                    {policy.isActive ? "Đang hoạt động" : "Bản nháp"}
                  </Badge>
                  <Badge variant="default">v{policy.version}</Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 mt-2">
                  {policy.policyName}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Hiệu lực:{" "}
                    {policy.effectiveDate
                      ? format(new Date(policy.effectiveDate), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "Chưa xác định"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    ID: {policy.id}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <article
              className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: policy.policyContent }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
