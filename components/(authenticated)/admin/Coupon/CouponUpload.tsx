import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import { CouponData } from "@/components/types/couponData";
import { useCoupons } from "../context/CouponContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CouponList from "./CouponList";

const CouponUpload: React.FC = () => {
  const { fetchCoupons } = useCoupons();
  const [couponData, setCouponData] = useState<CouponData>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountAmount: 0,
    isActive: true,
    maxDiscountAmount: 0,
    minimumOrderAmount: 0,
    validFrom: "",
    validUntil: "",
  });
  const [isUpdated, setIsUpdated] = useState<boolean>(true);

  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // Ensure client-side logic runs only on the client

  // Handle client-side logic
  useEffect(() => {
    setIsClient(true); // Set to true when component mounts
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCouponData({ ...couponData, [name]: value });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const isoString = date.toISOString();
    return isoString.split(".")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedCouponData = {
      ...couponData,
      validFrom: formatDateTime(couponData.validFrom),
      validUntil: formatDateTime(couponData.validUntil),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupon/`,
        formattedCouponData,
        {
          headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        fetchCoupons();
        toast.success("Coupon added successfully");
        handleClose();
      }
      setIsUpdated((prev) => !prev);
    } catch (error) {
        toast.dismiss();
      toast.error("Error uploading coupon");
      console.error("Error uploading coupon:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCouponData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountAmount: 0,
      isActive: true,
      maxDiscountAmount: 0,
      minimumOrderAmount: 0,
      validFrom: "",
      validUntil: "",
    });
  };

  if (!isClient) {
    return null; // Prevent hydration errors during SSR
  }

  return (
    <div>
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2  mb-2">
              <i className="fa-solid fa-upload mr-2"></i> Upload Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>
                <i className="fa-solid fa-ticket mr-2"></i> Upload New Coupon
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={couponData.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={couponData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  required
                ></textarea>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={couponData.discountType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Amount
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={couponData.discountAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Valid From */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valid From
                </label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={couponData.validFrom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valid Until
                </label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={couponData.validUntil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  className="w-full mt-2"
                  type="submit"
                  // className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Coupon List */}
      <CouponList setIsUpdated={setIsUpdated} isUpdated={isUpdated} />
    </div>
  );
};

export default CouponUpload;
