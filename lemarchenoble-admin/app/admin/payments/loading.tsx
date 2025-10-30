import { Card } from "@/components/ui/card"

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 h-32 bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
