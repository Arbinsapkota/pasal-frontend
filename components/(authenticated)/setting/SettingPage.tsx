"use client";

import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MyProfile from "@/components/(authenticated)/setting/MyProfile";
import { AppSidebar } from "./Sidebar";
import MyOrders from "./MyOrders";
import NewSideBarHeader from "./NewSideBarHeader";
export default function Layout() {
  const [activeView, setActiveView] = useState("profile");

  const renderView = () => {
    switch (activeView) {
      case "profile":
        return <MyProfile />;
      case "orders":
        return <div><MyOrders /></div>;
      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <SidebarProvider>
      <NewSideBarHeader />
      <div className="flex w-full mt-16">
        <AppSidebar onSelect={setActiveView} />
        <main className="w-full   p-4">
          <SidebarTrigger />
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
}
