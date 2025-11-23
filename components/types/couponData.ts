export interface CouponData {
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountAmount: number;
    isActive: boolean;
    maxDiscountAmount: number;
    minimumOrderAmount: number;
    validFrom: string;
    validUntil: string;
  }