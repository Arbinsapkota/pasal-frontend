"use client";
import Header from "@/components/(non-authenticated)/Header";
import ProductbyCatagories from "@/components/(non-authenticated)/Productbycatagories";
import React from "react";
// import { useRouter } from "next/router";

function Page() {
  // const router = useRouter();

  // const handleBackClick = () => {
  //   router.back();
  // };

  return (
    <div className="w-full ">
      <Header />
      {/* <button
        onClick={handleBackClick}
        className="m-4 primary-btn rounded-sm px-3 py-1 text-white transition-transform duration-300 ease-in-out hover:scale-105"
      >
        Back
      </button> */}
      <ProductbyCatagories />
      {/* <Products /> */}
    </div>
  );
}

export default Page;
