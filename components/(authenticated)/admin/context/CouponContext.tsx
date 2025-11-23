"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { getCookie } from "@/components/cookie/cookie";
import { Coupon } from "@/components/types/coupon";

interface CouponsContextProps {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  fetchCoupons: () => void;
}

const CouponsContext = createContext<CouponsContextProps | undefined>(
  undefined
);

export const CouponsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupon/`
      );
      setCoupons(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      // setError("Failed to fetch coupons. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <CouponsContext.Provider value={{ coupons, loading, error, fetchCoupons }}>
      {children}
    </CouponsContext.Provider>
  );
};

export const useCoupons = () => {
  const context = useContext(CouponsContext);
  if (!context) {
    throw new Error("useCoupons must be used within a CouponsProvider");
  }

  return context;
};
