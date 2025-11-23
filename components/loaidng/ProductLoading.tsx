import React from "react";
import { cn } from "@/lib/utils"; // if you're using classnames utility

export default function ProductCardLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-2 sm:p-3 md:p-4 rounded-lg border shadow-md bg-white animate-pulse space-y-3",
        className
      )}
    >
      {/* Image Placeholder */}
      <div className="w-full aspect-square sm:h-[130px] bg-gray-200 rounded-md" />

      {/* Title Placeholder */}
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />

      {/* Price and Stock */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-10" />
      </div>

      {/* Add to Cart Button Placeholder */}
      <div className="h-8 bg-gray-200 rounded w-full" />
    </div>
  );
}
