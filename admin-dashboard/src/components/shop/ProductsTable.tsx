'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Package, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Product, ProductSearchParams } from '@/features/products/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProductsTableProps {
  shopId: string
  products: Product[]
  totalPages: number
  currentPage: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onFilterChange: (params: Partial<ProductSearchParams>) => void
  onDelete: (productId: string) => void
}

export function ProductsTable({
  shopId,
  products,
  totalPages,
  currentPage,
  isLoading,
  onPageChange,
  onFilterChange,
  onDelete,
}: ProductsTableProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleSearch = () => {
    onFilterChange({ keywords: searchKeyword || undefined, page: 1 })
  }

  const handleClearFilters = () => {
    setSearchKeyword('')
    onFilterChange({
      page: 1,
      limit: 20,
      shop_id: shopId,
      keywords: undefined,
      sort: undefined,
      price_min: undefined,
      price_max: undefined,
    })
  }

  const parseMedia = (media: string): string[] => {
    try {
      return JSON.parse(media)
    } catch {
      return []
    }
  }

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm theo tên..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-orange-vivid hover:bg-orange-deep">
                <Search className="h-4 w-4 mr-2" />
                Tìm
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Sort */}
              <Select onValueChange={(value) => onFilterChange({ sort: value, page: 1 })}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                  <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                  <SelectItem value="name_asc">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Giá từ"
                  className="w-32"
                  onChange={(e) =>
                    onFilterChange({
                      price_min: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Giá đến"
                  className="w-32"
                  onChange={(e) =>
                    onFilterChange({
                      price_max: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                />
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="table-container">
        <CardHeader className="border-b border-orange-peach/20">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-vivid" />
            Danh sách sản phẩm
            {products && (
              <Badge variant="processing" className="ml-2">
                {products.length} sản phẩm
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header bg-orange-apricot/20">
              <TableRow>
                <TableHead className="w-16">Hình ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead>Đã bán</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id} className="table-row-hover">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-orange-apricot shadow-sm">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-orange-peach" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {product.short_description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-semibold text-orange-vivid">
                          {formatCurrency(product.min_price)}
                        </p>
                        {product.min_price !== product.max_price && (
                          <p className="text-xs text-gray-500">
                            - {formatCurrency(product.max_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{product.total_sold || 0}</span>
                    </TableCell>
                    <TableCell>
                      {product.rating ? (
                        <div className="text-sm">
                          <span className="font-medium text-yellow-600">
                            ⭐ {product.rating.average_rating.toFixed(1)}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({product.rating.total_reviews})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.delete_status === 'Active' ? 'success' : 'error'}>
                        {product.delete_status === 'Active' ? 'Hoạt động' : 'Đã xóa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsDetailOpen(true)
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(product.id)}
                          className="text-orange-deep hover:text-orange-deep"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-3 text-orange-peach opacity-50" />
                      <p className="text-lg font-medium">Chưa có sản phẩm nào</p>
                      <p className="text-sm mt-1">Cửa hàng này chưa có sản phẩm</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-orange-peach/20">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>Thông tin chi tiết về sản phẩm</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex gap-4">
                <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-orange-apricot flex-shrink-0 shadow-md">
                  {selectedProduct.image ? (
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-orange-peach" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800">{selectedProduct.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {selectedProduct.short_description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <span className="text-sm text-gray-500">Giá:</span>
                      <span className="ml-2 font-bold text-lg text-orange-vivid">
                        {formatCurrency(selectedProduct.min_price)}
                        {selectedProduct.min_price !== selectedProduct.max_price && (
                          <span className="text-base">
                            {' '}
                            - {formatCurrency(selectedProduct.max_price)}
                          </span>
                        )}
                      </span>
                    </div>
                    <Badge
                      variant={selectedProduct.delete_status === 'Active' ? 'success' : 'error'}
                    >
                      {selectedProduct.delete_status === 'Active' ? 'Hoạt động' : 'Đã xóa'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Product Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Đã bán</p>
                  <p className="text-xl font-bold text-blue-700">
                    {selectedProduct.total_sold || 0}
                  </p>
                </div>
                {selectedProduct.rating && (
                  <>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Đánh giá TB</p>
                      <p className="text-xl font-bold text-yellow-700">
                        ⭐ {selectedProduct.rating.average_rating.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Số đánh giá</p>
                      <p className="text-xl font-bold text-purple-700">
                        {selectedProduct.rating.total_reviews}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500">ID sản phẩm:</span>
                  <p className="font-mono text-xs mt-1">{selectedProduct.id}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500">Mã sản phẩm:</span>
                  <p className="font-medium mt-1">{selectedProduct.key}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500">Tạo bởi:</span>
                  <p className="font-medium mt-1">{selectedProduct.create_by}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500">Ngày tạo:</span>
                  <p className="font-medium mt-1">{formatDate(selectedProduct.create_date)}</p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết:</p>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                  />
                </div>
              )}

              {/* Media Gallery */}
              {selectedProduct.media && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Hình ảnh sản phẩm:</p>
                  <div className="grid grid-cols-5 gap-3">
                    {parseMedia(selectedProduct.media).map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-orange-apricot shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Image src={url} alt={`Media ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
