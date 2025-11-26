import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-orange-100">
      {totalElements && pageSize && (
        <p className="text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-semibold text-[#FF6B35]">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-[#FF6B35]">
            {Math.min(currentPage * pageSize, totalElements)}
          </span>{" "}
          trong tổng số{" "}
          <span className="font-semibold text-[#FF6B35]">{totalElements}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-lg border-2 border-orange-200 hover:bg-orange-50 hover:border-[#FF6B35] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4 text-[#FF6B35]" />
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="h-9 w-9 flex items-center justify-center text-gray-400"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={
                  isActive
                    ? "h-9 w-9 rounded-lg font-bold text-white shadow-lg transition-all"
                    : "h-9 w-9 rounded-lg border-2 border-orange-200 hover:bg-orange-50 hover:border-[#FF6B35] font-semibold transition-all"
                }
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)",
                      }
                    : { color: "#FF6B35" }
                }
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-lg border-2 border-orange-200 hover:bg-orange-50 hover:border-[#FF6B35] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-4 w-4 text-[#FF6B35]" />
        </Button>
      </div>
    </div>
  );
}
