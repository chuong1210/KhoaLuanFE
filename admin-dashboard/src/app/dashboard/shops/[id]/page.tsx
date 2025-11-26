'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Package,
  Search,
  Filter,
  Eye,
  Trash2,
  DollarSign,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useShop } from '@/features/shops/hooks/useShops'
import { useProducts, useDeleteProduct } from '@/features/products/hooks/useProducts'
import type { ProductSearchParams, Product } from '@/features/products/types'
import { formatCurrency, formatDate, truncateText } from '@/lib/utils'

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shopId } = use(params)

  const [activeTab, setActiveTab] = useState('overview')
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    page: 1,
    limit: 20,
    shop_id: shopId,
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: shop, isLoading: shopLoading } = useShop(shopId)
  const { data: productsData, isLoading: productsLoading } = useProducts(searchParams)
  const deleteProduct = useDeleteProduct()

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      keywords: searchKeyword || undefined,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (key: keyof ProductSearchParams, value: any) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct.mutate(productId)
    }
  }

  const parseMedia = (media: string): string[] => {
    try {
      return JSON.parse(media)
    } catch {
      return []
    }
  }

  // Calculate stats
  const stats = productsData
    ? {
        totalProducts: productsData.totalElements,
        activeProducts: productsData.data.filter((p) => p.delete_status === 'Active').length,
        totalValue: productsData.data.reduce((sum, p) => sum + p.max_price, 0),
        avgPrice:
          productsData.data.length > 0
            ? productsData.data.reduce((sum, p) => sum + p.min_price, 0) / productsData.data.length
            : 0,
      }
    : null

  return (
    <div className="space-y-6 animate-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shops">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Chi tiết cửa hàng</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin và sản phẩm của cửa hàng</p>
        </div>
      </div>

      {/* Shop Info Card */}
      {shopLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : shop ? (
        <Card className="border-orange-peach/30 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Shop Logo */}
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-apricot to-orange-peach flex-shrink-0 shadow-lg">
                {shop.shopLogo ? (
                  <Image src={shop.shopLogo} alt={shop.shopName} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Store className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>

              {/* Shop Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{shop.shopName}</h2>
                    <p className="text-gray-600 mt-1">{shop.shopDescription}</p>
                  </div>
                  <Badge variant={shop.shopStatus ? 'success' : 'error'} className="text-sm px-3 py-1">
                    {shop.shopStatus ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-orange-vivid" />
                    <span>{shop.shopEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-orange-vivid" />
                    <span>{shop.shopPhone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600 md:col-span-2">
                    <MapPin className="h-4 w-4 text-orange-vivid mt-0.5" />
                    <span>{shop.shopAddress}</span>
                  </div>
                </div>

                {shop.taxInfo && (
                  <div className="mt-4 p-3 bg-orange-apricot/20 rounded-lg">
                    <p className="text-xs font-medium text-gray-700">Thông tin thuế</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Mã số thuế:</span>
                        <span className="ml-2 font-medium">{shop.taxInfo.taxCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tên doanh nghiệp:</span>
                        <span className="ml-2 font-medium">{shop.taxInfo.taxNationalName}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span>Ngày tạo: {formatDate(shop.createdDate)}</span>
                  <span>•</span>
                  <span>{shop.followerCount} người theo dõi</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="products">
            Sản phẩm
            {productsData && (
              <Badge variant="processing" className="ml-2">
                {productsData.totalElements}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Tổng sản phẩm
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.totalProducts}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.activeProducts} đang hoạt động
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Giá trị tồn kho
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Tổng giá trị sản phẩm</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Giá trung bình
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">
                    {formatCurrency(stats.avgPrice)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Giá TB/sản phẩm</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Ví shop
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatCurrency(shop?.walletAmount || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Số dư hiện tại</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
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
                  <Select
                    value={searchParams.sort || 'newest'}
                    onValueChange={(value) => handleFilterChange('sort', value)}
                  >
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
                        handleFilterChange('price_min', e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Giá đến"
                      className="w-32"
                      onChange={(e) =>
                        handleFilterChange('price_max', e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchKeyword('')
                      setSearchParams({
                        page: 1,
                        limit: 20,
                        shop_id: shopId,
                      })
                    }}
                  >
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
                  {productsLoading ? (
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
                  ) : productsData?.data && productsData.data.length > 0 ? (
                    productsData.data.map((product) => (
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
                            <p className="font-medium text-gray-800 truncate">
                              {product.name}
                            </p>
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
                          <span className="text-sm text-gray-600">
                            {product.total_sold || 0}
                          </span>
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
                          <Badge
                            variant={product.delete_status === 'Active' ? 'success' : 'error'}
                          >
                            {product.delete_status === 'Active' ? 'Hoạt động' : 'Đã xóa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProduct(product)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
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
              {productsData && productsData.totalPages > 1 && (
                <div className="p-4 border-t border-orange-peach/20">
                  <Pagination
                    currentPage={productsData.currentPage}
                    totalPages={productsData.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  <p className="text-gray-600 text-sm mt-2">{selectedProduct.short_description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <span className="text-sm text-gray-500">Giá:</span>
                      <span className="ml-2 font-bold text-lg text-orange-vivid">
                        {formatCurrency(selectedProduct.min_price)}
                        {selectedProduct.min_price !== selectedProduct.max_price && (
                          <span className="text-base"> - {formatCurrency(selectedProduct.max_price)}</span>
                        )}
                      </span>
                    </div>
                    <Badge variant={selectedProduct.delete_status === 'Active' ? 'success' : 'error'}>
                      {selectedProduct.delete_status === 'Active' ? 'Hoạt động' : 'Đã xóa'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Product Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Đã bán</p>
                  <p className="text-xl font-bold text-blue-700">{selectedProduct.total_sold || 0}</p>
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
    </div>
  )
}
