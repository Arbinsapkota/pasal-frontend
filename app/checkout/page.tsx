"use client";
import { CouponsProvider } from "@/components/(authenticated)/admin/context/CouponContext";
import BuyNowCheckout from "@/components/(non-authenticated)/BuyNowCheckout";
import Checkout from "@/components/(non-authenticated)/Checkout";
import Header from "@/components/(non-authenticated)/Header";
import { usePathname, useSearchParams } from "next/navigation";

function Page() {

  const searchParams = useSearchParams();
  const items = searchParams.get("items");
  return (
    <div>
      <Header />

      <CouponsProvider>
        {items ? <BuyNowCheckout /> : <Checkout />}
      </CouponsProvider>
    </div>
  );
}

export default Page;
