"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/file-utils";
import type { Banner } from "@/features/banners/types/banner";

interface CompactBannerCarouselProps {
  banners: Banner[];
  isLoading?: boolean;
  height?: string;
}

export function CompactBannerCarousel({
  banners,
  isLoading,
  height = "h-[200px] md:h-[250px]",
}: CompactBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return (
      <Card
        className={cn(
          "relative w-full overflow-hidden bg-gradient-to-br from-orange-apricot/20 to-orange-warm/20 animate-pulse",
          height
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-orange-vivid text-sm">Đang tải banner...</div>
        </div>
      </Card>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  return (
    <Card
      className={cn("relative w-full overflow-hidden group shadow-lg", height)}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-in-out",
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            )}
          >
            <a
              href={banner.bannerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative group/link"
            >
              <Image
                src={getImageUrl(banner.bannerImage)}
                alt={banner.bannerName}
                fill
                className="object-cover transition-transform duration-300 group-hover/link:scale-105"
                priority={index === 0}
                sizes="100vw"
              />
              {/* Overlay with hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover/link:opacity-90 transition-opacity" />

              {/* Banner Title */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold drop-shadow-lg">
                      {banner.bannerName}
                    </h3>
                    {banner.targetId && (
                      <p className="text-xs opacity-80 mt-1">
                        Shop ID: {banner.targetId}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-5 w-5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next banner"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentIndex
                  ? "w-6 h-1.5 bg-orange-vivid"
                  : "w-1.5 h-1.5 bg-white/60 hover:bg-white/90"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter Badge */}
      {banners.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
          {currentIndex + 1}/{banners.length}
        </div>
      )}
    </Card>
  );
}
