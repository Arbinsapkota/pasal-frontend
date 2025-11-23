import React from "react";

const MyOrderListLoading = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-md animate-pulse"
        >
          {/* Top: Payment Method and Status */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-36 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Grid of 4 stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-28 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>

          {/* View Details Button */}
          <div className="flex gap-2">
            <div className="h-8 w-28 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrderListLoading;
