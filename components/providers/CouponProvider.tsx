"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface CouponContextType {
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  return (
    <CouponContext.Provider value={{ discountAmount, setDiscountAmount }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = (): CouponContextType => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCoupon must be used within a CouponProvider");
  }
  return context;
};
