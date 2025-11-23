"use client";

export default function WishListSkeleton() {
  return (
    <div className="border rounded-lg shadow-md sm:p-4 p-2 max-h-52 relative animate-pulse">
      {/* Product Image */}
      <div className="relative w-full h-20 cursor-pointer">
        <div className="w-full h-20 bg-gray-300 rounded"></div>
      </div>

      {/* Discount Badge */}
      <div className="absolute sm:top-1 top-1 -left-1 sm:left-0 z-10">
        <div className="h-5 w-16 bg-gray-300 rounded-r-full"></div>
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 flex flex-col">
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>

      {/* Title */}
      <div className="pt-2">
        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
      </div>

      {/* Price + Old Price */}
      <div className="flex items-baseline gap-2 mt-2">
        <div className="h-4 w-12 bg-gray-300 rounded"></div>
        <div className="h-3 w-10 bg-gray-300 rounded"></div>
      </div>

      {/* Add to Cart / Counter */}
      <div className="mt-1.5">
        <div className="h-9 w-full bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
}
