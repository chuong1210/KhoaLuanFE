"use client"

import { useRouter, useParams } from "next/navigation"
import { usePolicyById, useUpdatePolicy } from "@/hooks/usePolicies"
import PolicyForm from "@/components/forms/policy-form"
import { Card } from "@/components/ui/card"

export default function EditPolicyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data: policy, isLoading } = usePolicyById(id)
  const updateMutation = useUpdatePolicy()

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      router.push("/policies")
    } catch (error) {
      console.error("Error updating policy:", error)
    }
  }

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chỉnh sửa Chính sách</h1>
      <Card className="p-6">
        <PolicyForm onSubmit={handleSubmit} initialData={policy} isLoading={updateMutation.isPending} />
      </Card>
    </div>
  )
}
