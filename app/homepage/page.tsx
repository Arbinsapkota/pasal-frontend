"use client";
import Header from "@/components/(non-authenticated)/Header";
import Homepage from "@/components/(non-authenticated)/Homepage";
import ProductbyCatagories from "@/components/(non-authenticated)/Productbycatagories";
import React from "react";
// import { useRouter } from "next/router";

function Page() {
  // const router = useRouter();

  // const handleBackClick = () => {
  //   router.back();
  // };

  return (
    <div className="w-full">
      <Homepage />
    </div>
  );
}

export default Page;
