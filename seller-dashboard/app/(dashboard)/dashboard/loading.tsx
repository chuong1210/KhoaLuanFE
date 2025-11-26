// src/app/dashboard/loading.tsx
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-orange-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-gray-500 animate-pulse font-medium">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}
