"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";

interface HealthComponent {
  database: string;
  redis: string;
}

interface HealthResponse {
  status: "healthy" | "degraded";
  components: HealthComponent;
}

export function AIHealthStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-health"],
    queryFn: async () => {
      const response = await aiApi.get<HealthResponse>("/health");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertTriangle className="h-5 w-5 text-gray-400" />;

    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="inactive">Unknown</Badge>;

    const variants: Record<string, { variant: any; label: string }> = {
      healthy: { variant: "success", label: "Healthy" },
      degraded: { variant: "warning", label: "Degraded" },
      unhealthy: { variant: "destructive", label: "Unhealthy" },
    };

    const config = variants[status] || variants.unhealthy;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            System Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">
            Unable to connect to AI service. Please check your connection.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = data?.status || "unhealthy";
  const isHealthy = overallStatus === "healthy";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isHealthy
          ? "border-green-200 bg-green-50/50"
          : "border-yellow-200 bg-yellow-50/50"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity
              className={cn(
                "h-5 w-5",
                isHealthy ? "text-green-600" : "text-yellow-600"
              )}
            />
            AI System Health
          </CardTitle>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall Status */}
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-lg",
            isHealthy ? "bg-green-100" : "bg-yellow-100"
          )}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <p className="font-semibold text-sm">Overall System</p>
              <p className="text-xs text-gray-600">Main AI Service</p>
            </div>
          </div>
          <span
            className={cn(
              "text-sm font-bold uppercase",
              isHealthy ? "text-green-700" : "text-yellow-700"
            )}
          >
            {overallStatus}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white border">
          <div className="flex items-center gap-3">
            {getStatusIcon(data?.components.database)}
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-semibold text-sm">Database</p>
                <p className="text-xs text-gray-600">PostgreSQL</p>
              </div>
            </div>
          </div>
          {getStatusBadge(data?.components.database)}
        </div>

        {/* Redis Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white border">
          <div className="flex items-center gap-3">
            {getStatusIcon(data?.components.redis)}
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              <div>
                <p className="font-semibold text-sm">Cache System</p>
                <p className="text-xs text-gray-600">Redis</p>
              </div>
            </div>
          </div>
          {getStatusBadge(data?.components.redis)}
        </div>

        {/* Last Check */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 text-center">
            Last checked: {new Date().toLocaleTimeString("vi-VN")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
