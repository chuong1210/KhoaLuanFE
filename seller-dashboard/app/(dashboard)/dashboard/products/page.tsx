"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ProductTemp, Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("drafts");

  // Fetch product temps (drafts)
  const {
    data: productTemps = [],
    isLoading: isLoadingTemps,
    error: errorTemps,
  } = useQuery<ProductTemp[]>({
    queryKey: ["productTemps"],
    queryFn: () => productService.getProductTemps(),
  });

  // Fetch approved products
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
  });

  // Delete product temp mutation
  const deleteProductTempMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProductTemp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTemps"] });
      toast.success("Đã xóa sản phẩm draft");
    },
    onError: () => {
      toast.error("Không thể xóa sản phẩm");
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã xóa sản phẩm");
    },
    onError: () => {
      toast.error("Không thể xóa sản phẩm");
    },
  });

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã duyệt
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Quản lý Sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Quản lý sản phẩm draft và sản phẩm đã được duyệt
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/products/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Đăng sản phẩm mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="drafts">
            Sản phẩm Draft ({productTemps.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Sản phẩm đã duyệt ({products.length})
          </TabsTrigger>
        </TabsList>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm Draft</CardTitle>
              <CardDescription>
                Các sản phẩm đang chờ duyệt hoặc bị từ chối. Bạn có thể chỉnh
                sửa và gửi lại.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTemps ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : errorTemps ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>
                    Không thể tải danh sách sản phẩm draft
                  </AlertDescription>
                </Alert>
              ) : productTemps.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Thương hiệu</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productTemps.map((product: ProductTemp) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-12 w-12 overflow-hidden rounded border">
                            <img
                              src={
                                product.productTempImage[0] ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={product.productTempName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.productTempName}
                        </TableCell>
                        <TableCell>{product.productTempBrandId}</TableCell>
                        <TableCell>{product.productTempCategoryId}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/draft/${product.id}`
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/draft/${product.id}/edit`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteProductTempMutation.mutate(product.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    Chưa có sản phẩm draft nào
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => router.push("/dashboard/products/create")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo sản phẩm mới
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Products Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã duyệt</CardTitle>
              <CardDescription>
                Các sản phẩm đã được admin phê duyệt và đang được bán trên hệ
                thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : errorProducts ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>
                    Không thể tải danh sách sản phẩm
                  </AlertDescription>
                </Alert>
              ) : products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-12 w-12 overflow-hidden rounded border">
                            <img
                              src={
                                product.image ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={product.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.productName}
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/${product.id}`
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/products/${product.id}/edit`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteProductMutation.mutate(product.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    Chưa có sản phẩm nào được duyệt
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
