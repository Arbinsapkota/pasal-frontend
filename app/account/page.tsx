import SettingPage from "@/components/(authenticated)/setting/SettingPage";
import { Metadata } from "next";
import React from "react";

export const metadata : Metadata = {
  title: "My Account - ETECH",
  description:
    "Manage your ETECH account details, view your orders, track shipments, and update your personal information all in one place.",
};


function page() {
  return (
    <div>
      <SettingPage />
    </div>
  );
}

export default page;
