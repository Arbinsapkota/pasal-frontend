import AdminHome from "@/components/(authenticated)/admin/AdminHome";
import React from "react";
import { CouponsProvider } from "@/components/(authenticated)/admin/context/CouponContext";
import { ProductProvider } from "@/components/(authenticated)/admin/context/ProductContext";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Admin Dashboard - Puja Pasal",
  description:
    "Access the ETECH Admin Dashboard to manage products, categories, users, and orders efficiently. Monitor activities and control your store operations in one place.",
};

function page() {
  
  return (
    <div>
      <ProductProvider>
        <CouponsProvider>
          <AdminHome />
        </CouponsProvider>
      </ProductProvider>
    </div>
  );
}

export default page;
