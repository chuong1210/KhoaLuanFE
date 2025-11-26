// components/ui/shop-select-advanced.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Store, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useShops } from "@/features/shops/hooks/useShops";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShopSelectAdvancedProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function ShopSelect({
  value,
  onValueChange,
  placeholder = "Chọn shop...",
  className,
}: ShopSelectAdvancedProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch shops based on search
  const { data: shopsData, isLoading } = useShops({
    pagenumber: 1,
    pagesize: 100,
    searchterm: debouncedSearchTerm || undefined,
    status: true,
  });

  const shops = shopsData?.result || [];

  // Separate query to fetch selected shop if not in list
  const { data: selectedShopData, isLoading: isLoadingSelected } = useShops(
    {
      pagenumber: 1,
      pagesize: 1,
      searchterm: value,
    },
    {
      enabled: !!value && !shops.find((s) => s.id === value),
    }
  );

  // Determine the display shop
  const displayShop = React.useMemo(() => {
    if (!value) return null;
    return shops.find((s) => s.id === value) || selectedShopData?.result?.[0];
  }, [value, shops, selectedShopData]);

  const handleSelect = React.useCallback(
    (shopId: string) => {
      onValueChange(shopId === value ? undefined : shopId);
      setOpen(false);
      setSearchTerm("");
    },
    [value, onValueChange]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange(undefined);
      setSearchTerm("");
    },
    [onValueChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isLoadingSelected ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : displayShop ? (
              <>
                <Store className="h-4 w-4 text-orange-vivid flex-shrink-0" />
                <span className="truncate">{displayShop.shopName}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {value && (
              <X
                className="h-3 w-3 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b">
            <Input
              placeholder="Tìm kiếm shop theo tên hoặc ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                {searchTerm ? (
                  <>
                    <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Không tìm thấy shop với từ khóa</p>
                    <p className="font-medium mt-1">{searchTerm}</p>
                  </>
                ) : (
                  <>
                    <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nhập tên hoặc ID shop để tìm kiếm</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-2">
                {/* Clear option */}
                {value && (
                  <button
                    onClick={() => handleSelect("")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-deep hover:bg-orange-apricot/20 rounded-md transition-colors border-b mb-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Bỏ chọn shop</span>
                  </button>
                )}

                {/* Shop list */}
                {shops.map((shop) => {
                  const isSelected = value === shop.id;
                  return (
                    <button
                      key={shop.id}
                      onClick={() => handleSelect(shop.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-orange-apricot/30 rounded-md transition-colors text-left",
                        isSelected && "bg-orange-apricot/50"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isSelected
                            ? "opacity-100 text-orange-vivid"
                            : "opacity-0"
                        )}
                      />
                      <Store className="h-4 w-4 text-orange-vivid flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium truncate",
                            isSelected && "text-orange-vivid"
                          )}
                        >
                          {shop.shopName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          ID: {shop.id}
                          {shop.shopEmail && ` • ${shop.shopEmail}`}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Footer hint */}
                {shops.length >= 100 && (
                  <div className="px-3 py-3 text-xs text-center text-gray-500 border-t mt-2">
                    <p>Hiển thị {shops.length} kết quả đầu tiên</p>
                    <p className="mt-1">
                      Nhập từ khóa cụ thể hơn để tìm shop khác
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
