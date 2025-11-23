"use client";
import React, { useState } from "react";
import axios from "axios";
import { useCoupon } from "../providers/CouponProvider";

interface Coupon {
  couponId: string;
  code: string;
  discountAmount: number;
  validFrom: string;
  validUntil: string;
  minimumOrderAmount: number;
  maxDiscountAmount: number;
  isActive: boolean;
  discountType: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const CouponFetcher: React.FC = () => {
  const [couponId, setCouponId] = useState<string>("");
  const [coupons, setCoupons] = useState<Coupon[]>([]); // Adjusted to be an array
  const [error, setError] = useState<string | null>(null);
  const { setDiscountAmount } = useCoupon();

  const fetchCoupons = async () => {
    if (!couponId) {
      setError("Please enter a valid Coupon ID.");
      return;
    }
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEDND_URL}/api/coupon/?couponId=${couponId}`
      );
      const fetchedCoupons: Coupon[] = response.data; // Ensure response is typed correctly
      setCoupons(fetchedCoupons);
      if (fetchedCoupons.length > 0) {
        setDiscountAmount(fetchedCoupons[0].discountAmount); // Update context with the discount amount
      }
    } catch (err) {
      setError("Failed to fetch coupons. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Coupon Fetcher</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Enter Coupon ID"
          value={couponId}
          onChange={(e) => setCouponId(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchCoupons}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Fetch Coupons
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        {coupons.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Code</th>
                <th className="border border-gray-300 p-2 text-left">
                  Discount Amount
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Valid From
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Valid Until
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.couponId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{coupon.code}</td>
                  <td className="border border-gray-300 p-2">
                    {coupon.discountAmount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(coupon.validFrom).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(coupon.validUntil).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {coupon.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No coupons found.</p>
        )}
      </div>
    </div>
  );
};

export default CouponFetcher;
