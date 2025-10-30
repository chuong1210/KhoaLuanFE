"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoriesAPI } from "@/lib/api/categories"

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAllCategories(),
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => categoriesAPI.createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => categoriesAPI.updateCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
