export interface Coupon {
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
  }