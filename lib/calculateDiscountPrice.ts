// utils/calcDiscount.ts
export type DiscountResult = {
  discountedPrice: number;
  discountAmount: number;
};

export function calcDiscount(
  price: number,
  discountPercent: number,
  rounding: "none" | "round" | "floor" | "ceil" = "none"
): DiscountResult {
  if (price < 0 || discountPercent < 0) throw new Error("Values must be ≥ 0");
  if (discountPercent > 100) throw new Error("Discount cannot exceed 100%");

  const discountAmount = price * (discountPercent / 100);
  const discountedPrice = price - discountAmount;

  const apply = (v: number) =>
    rounding === "round"
      ? Math.round(v)
      : rounding === "floor"
      ? Math.floor(v)
      : rounding === "ceil"
      ? Math.ceil(v)
      : v;

  return {
    discountedPrice: apply(discountedPrice),
    discountAmount: apply(discountAmount),
  };
}
