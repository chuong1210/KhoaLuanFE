"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface DeleteDialogProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function DeleteDialog({ title, description, onConfirm, onCancel, isLoading }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-error" size={24} />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{description}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Hủy
            </Button>
            <Button className="bg-error hover:bg-error/90" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
