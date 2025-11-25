'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ImageIcon,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks/useCategories'
import type { Category } from '@/features/categories/types'
import { cn } from '@/lib/utils'

// Helper function to format image URL
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null

  // If image path starts with http:// or https://, use it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Otherwise, use media API endpoint
  return `http://localhost:9001/v1/media/${imagePath}`
}

interface CategoryItemProps {
  category: Category
  level: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
}

function CategoryItem({
  category,
  level,
  onEdit,
  onDelete,
  expandedIds,
  toggleExpand,
}: CategoryItemProps) {
  const hasChildren = category.child?.valid && category.child.data && category.child.data.length > 0
  const isExpanded = expandedIds.has(category.category_id)
  const imagePath = category.image?.valid && category.image.data ? category.image.data : null
  const imageUrl = getImageUrl(imagePath)

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg hover:bg-orange-apricot/50 transition-colors group',
          level > 0 && 'ml-6 border-l-2 border-orange-peach/30'
        )}
        style={{ marginLeft: level > 0 ? `${level * 24}px` : 0 }}
      >
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.category_id)}
              className="p-1 hover:bg-orange-peach/30 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-orange-vivid" />
              ) : (
                <ChevronRight className="h-4 w-4 text-orange-vivid" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {imageUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-apricot/50">
              <Image
                src={imageUrl}
                alt={category.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-orange-apricot/50 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-orange-vivid" />
            </div>
          )}

          <div>
            <p className="font-medium text-gray-800">{category.name}</p>
            <p className="text-xs text-gray-500">{category.path}</p>
          </div>

          {hasChildren && (
            <Badge variant="info" className="ml-2">
              {category.child.data?.length} danh mục con
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4 text-orange-vivid" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.child.data?.map((child) => (
            <CategoryItem
              key={child.category_id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Form states
  const [categoryName, setCategoryName] = useState<string>('')
  const [parentId, setParentId] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categories, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setSelectedFiles(fileArray)
      const urls = fileArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setCategoryName('')
    setParentId('')
    setSelectedFiles([])
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setPreviewUrls([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCreate = () => {
    if (!categoryName.trim() || selectedFiles.length === 0) return

    createMutation.mutate(
      {
        name: categoryName,
        parent: parentId || undefined,
        media: selectedFiles,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          resetForm()
        },
      }
    )
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setCategoryName(category.name)
    setParentId(category.parent || '')
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedCategory || !categoryName.trim()) return

    updateMutation.mutate(
      {
        cate_id: selectedCategory.category_id,
        name: categoryName,
        parent: parentId || undefined,
        media: selectedFiles.length > 0 ? selectedFiles : undefined,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedCategory(null)
          resetForm()
        },
      }
    )
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!selectedCategory) return

    deleteMutation.mutate(selectedCategory.category_id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedCategory(null)
      },
    })
  }

  // Flatten categories for parent selection
  const flattenCategories = (cats: Category[], result: Category[] = []): Category[] => {
    cats.forEach((cat) => {
      result.push(cat)
      if (cat.child?.valid && cat.child.data) {
        flattenCategories(cat.child.data, result)
      }
    })
    return result
  }

  const allCategories = categories ? flattenCategories(categories) : []

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderTree className="h-7 w-7 text-orange-vivid" />
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý các danh mục sản phẩm trên sàn
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-sunrise hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Categories List */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-orange-vivid" />
            Danh sách Danh mục
            {categories && (
              <Badge variant="processing" className="ml-2">
                {allCategories.length} danh mục
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category.category_id}
                  category={category}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderTree className="h-16 w-16 mx-auto mb-4 text-orange-peach" />
              <p className="text-gray-500 text-lg">Chưa có danh mục nào</p>
              <p className="text-gray-400 text-sm mt-1">
                Nhấn "Thêm danh mục" để tạo danh mục đầu tiên
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-vivid" />
              Thêm danh mục mới
            </DialogTitle>
            <DialogDescription>
              Tạo danh mục mới cho sản phẩm. Nhập tên, chọn ảnh và danh mục cha (nếu có).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent">Danh mục cha (tùy chọn)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không có (danh mục gốc)</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="media">Ảnh danh mục *</Label>
              <div className="flex flex-col gap-3">
                <Input
                  id="media"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-orange-peach/30"
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!categoryName.trim() || selectedFiles.length === 0 || createMutation.isPending}
              className="bg-gradient-sunrise hover:opacity-90"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo danh mục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-orange-vivid" />
              Cập nhật danh mục
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho danh mục "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên danh mục *</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên danh mục"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-parent">Danh mục cha (tùy chọn)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không có (danh mục gốc)</SelectItem>
                  {allCategories
                    .filter((cat) => cat.category_id !== selectedCategory?.category_id)
                    .map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCategory?.image?.valid && selectedCategory.image.data && getImageUrl(selectedCategory.image.data) && (
              <div className="grid gap-2">
                <Label>Ảnh hiện tại</Label>
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-orange-peach/30">
                  <Image
                    src={getImageUrl(selectedCategory.image.data)!}
                    alt={selectedCategory.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-media">Ảnh mới (tùy chọn)</Label>
              <div className="flex flex-col gap-3">
                <Input
                  id="edit-media"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-orange-peach/30"
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setSelectedCategory(null)
                resetForm()
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!categoryName.trim() || updateMutation.isPending}
              className="bg-gradient-sunrise hover:opacity-90"
            >
              {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"?
              {selectedCategory?.child?.valid && selectedCategory.child.data && selectedCategory.child.data.length > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  Lưu ý: Danh mục này có {selectedCategory.child.data.length} danh mục con.
                  Việc xóa có thể ảnh hưởng đến các danh mục con.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
