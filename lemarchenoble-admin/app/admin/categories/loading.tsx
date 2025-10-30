import { Card } from "@/components/ui/card"

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    </div>
  )
}
