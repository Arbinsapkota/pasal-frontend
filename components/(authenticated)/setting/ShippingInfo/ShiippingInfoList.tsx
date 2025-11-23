"use client";
import { axiosAuthInstance } from "@/components/axiosInstance";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ShippingInfo {
  shippingId: string;
  address: string;
  phoneNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  createdAt: string;
  updatedAt: string;
}

const ShippingInfoList = ({
  isAdded,
  onEdit, // NEW: callback passed from Header
}: {
  isAdded: boolean;
  onEdit: (info: ShippingInfo) => void;
}) => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState<boolean>(true);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/shipping/info/by-user")
      .then(res => {
        setShippingInfo(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching shipping info", err);
        setIsLoading(false);
      });
  }, [isUpdated, isAdded]);

  const handleDelete = (id: string) => {
    setIsLoadingDelete(true);
    setDeletingId(id);
    axiosAuthInstance()
      .delete(`/api/shipping/info/`, {
        params: { id },
      })
      .then(() => {
        setIsUpdated(prev => !prev);
        toast.dismiss();
        toast.success("Deleted Successfully.");
        setIsLoadingDelete(false);
      })
      .catch(err => {
        console.error("Error deleting shipping info", err);
        toast.dismiss();
        toast.error("Failed to Delete Address.");
        setIsLoadingDelete(false);
      });
  };

  return (
    <div className="w-full mx-auto p-6 rounded-xl">
      <ul className="space-y-6">
        {shippingInfo.map(shipping => (
          <li
            key={shipping.shippingId}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              {isLoading ? (
                <LoadingContent className="h-[25px] w-[200px]" />
              ) : (
                <h3 className="text-lg font-semibold">
                  {shipping.addressType} Address
                </h3>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-gray-600">
              <div>
                <p className="text-sm text-gray-500 sm:mb-1 -mb-1">Address</p>
                <div>
                  {isLoading ? (
                    <LoadingContent className="h-[20px] w-[200px]" />
                  ) : (
                    <p className="font-medium mt-1">{shipping.address}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 sm:mb-1 -mb-1">Phone</p>
                <div>
                  {isLoading ? (
                    <LoadingContent className="h-[20px] w-[140px]" />
                  ) : (
                    <p className="font-medium">{shipping.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 sm:mb-1 -mb-1">City</p>
                <div>
                  {isLoading ? (
                    <LoadingContent className="h-[20px] w-[140px]" />
                  ) : (
                    <p className="font-medium">{shipping.city}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 sm:mb-1 -mb-1">State</p>
                <div>
                  {isLoading ? (
                    <LoadingContent className="h-[20px] w-[140px]" />
                  ) : (
                    <p className="font-medium">{shipping.state}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              {/* EDIT BUTTON */}
              <Button
                variant="outline"
                className="px-4 py-2 text-sm font-semibold shadow-sm hover:scale-105 transition-transform duration-200"
                onClick={() => onEdit(shipping)}
              >
                Edit
              </Button>

              {/* DELETE BUTTON */}
              <Button
                key={shipping.shippingId}
                disabled={deletingId === shipping.shippingId}
                variant="destructive"
                className="px-4 py-2 text-sm font-semibold shadow-sm hover:scale-105 transition-transform duration-200"
                onClick={() => handleDelete(shipping.shippingId)}
              >
                {isLoadingDelete && deletingId === shipping.shippingId
                  ? "Deleting"
                  : "Delete"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShippingInfoList;
