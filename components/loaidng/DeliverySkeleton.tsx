import React from "react";

export default function DeliveryOptionSkeleton() {
  return (
    <div className="">
      <div className="p-4 border border-gray-300 rounded-md shadow-sm animate-pulse bg-white">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-5 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-400 rounded w-24"></div>
      </div>
    </div>
  );
}
