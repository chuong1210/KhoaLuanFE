"use client"

import { useRouter } from "next/navigation"
import { useCreatePolicy } from "@/hooks/usePolicies"
import PolicyForm from "@/components/forms/policy-form"
import { Card } from "@/components/ui/card"

export default function CreatePolicyPage() {
  const router = useRouter()
  const createMutation = useCreatePolicy()

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      router.push("/policies")
    } catch (error) {
      console.error("Error creating policy:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tạo Chính sách Mới</h1>
      <Card className="p-6">
        <PolicyForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </Card>
    </div>
  )
}
