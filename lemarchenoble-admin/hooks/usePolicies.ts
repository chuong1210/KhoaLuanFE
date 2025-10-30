"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { policiesAPI } from "@/lib/api/policies"

export const usePolicies = (
  pageNumber = 1,
  pageSize = 10,
  policyType?: string,
  isActive?: boolean,
  shopId?: string,
) => {
  return useQuery({
    queryKey: ["policies", pageNumber, pageSize, policyType, isActive, shopId],
    queryFn: () => policiesAPI.getAllPolicies(pageNumber, pageSize, policyType, isActive, shopId),
  })
}

export const useActivePolicies = (shopId?: string) => {
  return useQuery({
    queryKey: ["activePolicies", shopId],
    queryFn: () => policiesAPI.getActivePolicies(shopId),
  })
}

export const usePolicyById = (id: string) => {
  return useQuery({
    queryKey: ["policy", id],
    queryFn: () => policiesAPI.getPolicyById(id),
    enabled: !!id,
  })
}

export const useCreatePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => policiesAPI.createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] })
    },
  })
}

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => policiesAPI.updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] })
    },
  })
}

export const useDeletePolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => policiesAPI.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] })
    },
  })
}

export const usePublishPolicy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => policiesAPI.publishPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] })
    },
  })
}
