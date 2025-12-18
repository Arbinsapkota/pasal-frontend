"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import AdminHeader from "./AdminHeader";
import MaxWidthWrapper from "./maxWidthWrapper";
import Dashboard from "./Dashboard";
import CustomerList from "./Customer";
import AdminOrders from "./AdminOrder";
import CouponUpload from "./Coupon/CouponUpload";
import UploadOffer from "./UploadImage/UploadOffers";
import ProductUpload from "./Products/ProductUpload";
import DeliveryOptions from "./DeliverOptions/DeliveryOptions";
import CategoryForm from "./AddCategory/Category";
import SubCategoryForm from "./AddCategory/AddSubCategory";
import ChangePasswordDialog from "./TabContents/ChangePassword";
import UploadCarousel from "./UploadImage/UploadCarousel";
import UploadPopup from "./UploadImage/UploadPopup";
import UploadBanners from "./UploadImage/UploadBanners";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { clearCookies } from "@/components/cookie/cookie";

import {
  FaTachometerAlt,
  FaImages,
  FaBoxOpen,
  FaUsers,
  FaTags,
  FaGift,
  FaMoneyBillWave,
  FaKey,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const AdminHome: React.FC = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [processingOrder, setProcessingOrder] = useState(0);
  const [isOrderUpdated, setIsOrderUpdated] = useState(false);

  // Gallery dropdown state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallerySubPage, setGallerySubPage] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handlePageSelect = (selectedPage: string) => {
    router.push(`/ETECH-Admin/dashboard?page=${selectedPage}`);
    setPage(selectedPage);
    if (selectedPage !== "gallery") {
      setGallerySubPage(null);
      setIsGalleryOpen(false);
    } else {
      setIsGalleryOpen(prev => !prev);
    }
  };

  const handleGallerySubPage = (subPage: string) => {
    setGallerySubPage(subPage);
    router.push(`/ETECH-Admin/dashboard?page=gallery&subPage=${subPage}`);
  };

  const handleLogout = () => {
    clearCookies();
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    window.location.reload();
  };

  const sections: { [key: string]: { id: string; icon: JSX.Element } } = {
    Dashboard: { id: "dashboard", icon: <FaTachometerAlt /> },
    Gallery: { id: "gallery", icon: <FaImages /> }, // second
    Orders: { id: "orders", icon: <FaBoxOpen /> },
    Customers: { id: "customers", icon: <FaUsers /> },
    Product: { id: "product", icon: <FaBoxOpen /> },
    "Product Category": { id: "product-category", icon: <FaTags /> },
    "Product Sub Category": { id: "product-sub-category", icon: <FaTags /> },
    "Special Offers": { id: "offers", icon: <FaGift /> },
    Coupon: { id: "coupon", icon: <FaMoneyBillWave /> },
    "Delivery Options": { id: "delivery-options", icon: <FaMoneyBillWave /> },
    "Change Password": { id: "change-password", icon: <FaKey /> },
  };

  const gallerySubSections = [
    { label: "Carousel", id: "carousel" },
    { label: "Popup", id: "popup" },
    { label: "Banner", id: "banner" },
  ];

  useEffect(() => {
    const url = new URL(window.location.href);
    const pageParam = url.searchParams.get("page");
    const subPageParam = url.searchParams.get("subPage");

    if (pageParam) setPage(pageParam);
    if (subPageParam) setGallerySubPage(subPageParam);
  }, []);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/order/processing")
      .then(res => setProcessingOrder(res.data))
      .catch(err => console.error(err));
  }, [isOrderUpdated]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f9fc] via-[#fdfefe] to-[#eef2f7]">
      <Tabs.Root value={page} orientation="vertical" className="flex w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed z-50 h-full transition-all duration-300 flex flex-col bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]",
            isSidebarOpen ? "w-72" : "w-16"
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-4 border-b border-gray-200">
            {isSidebarOpen && (
              <Image
                src="/newlogo.png"
                alt="Logo"
                height={60}
                width={180}
                className="h-12 w-auto object-contain"
              />
            )}
          </div>

          <Tabs.List className="flex-1 flex flex-col gap-2 px-1 py-4 overflow-y-auto">
            {Object.entries(sections).map(([label, { id, icon }]) => {
              // Special render for Gallery to support dropdown
              if (label === "Gallery") {
                return (
                  <div key={id} className="relative">
                    <button
                      onClick={() => handlePageSelect(id)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-3 rounded-xl font-semibold w-full transition-all",
                        page === id
                          ? "bg-gradient-to-r from-primaryBlue to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">{icon}{isSidebarOpen && label}</div>
                      {isSidebarOpen &&
                        (isGalleryOpen ? <FaChevronUp /> : <FaChevronDown />)}
                    </button>

                    {/* Dropdown items */}
                    {isGalleryOpen && isSidebarOpen && (
                      <div className="ml-6 mt-2 flex flex-col gap-1">
                        {gallerySubSections.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleGallerySubPage(sub.id)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm font-medium",
                              gallerySubPage === sub.id
                                ? "bg-primaryBlue text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal tabs
              return (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  onClick={() => handlePageSelect(id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all",
                    page === id
                      ? "bg-gradient-to-r from-primaryBlue to-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {icon}
                  {isSidebarOpen && label}
                  {label === "Orders" && isSidebarOpen && (
                    <span className="ml-auto bg-white text-primaryBlue text-xs px-2 rounded-full">
                      {processingOrder}
                    </span>
                  )}
                </Tabs.Trigger>
              );
            })}

            {/* Logout */}
            <Button
              onClick={handleLogout}
              className="mt-auto mb-4 bg-red-600 text-white flex items-center gap-2 justify-center"
            >
              <FaSignOutAlt />
              {isSidebarOpen && "Logout"}
            </Button>
          </Tabs.List>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            isSidebarOpen ? "ml-72" : "ml-16"
          )}
        >
          <AdminHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <MaxWidthWrapper className="px-8 py-10">
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-[0_30px_80px_rgba(0,0,0,0.06)] p-8">
              <Tabs.Content value="dashboard"><Dashboard /></Tabs.Content>
              <Tabs.Content value="gallery">
                {gallerySubPage === "carousel" && <UploadCarousel />}
                {gallerySubPage === "popup" && <UploadPopup />}
                {gallerySubPage === "banner" && <UploadBanners />}
                {!gallerySubPage && (
                  <p className="text-center text-gray-400 py-10">
                    Select a Gallery sub-section from the sidebar
                  </p>
                )}
              </Tabs.Content>
              <Tabs.Content value="customers"><CustomerList /></Tabs.Content>
              <Tabs.Content value="coupon"><CouponUpload /></Tabs.Content>
              <Tabs.Content value="offers"><UploadOffer /></Tabs.Content>
              <Tabs.Content value="product"><ProductUpload /></Tabs.Content>
              <Tabs.Content value="orders">
                <AdminOrders setIsOrderUpdated={setIsOrderUpdated} />
              </Tabs.Content>
              <Tabs.Content value="delivery-options"><DeliveryOptions /></Tabs.Content>
              <Tabs.Content value="product-category"><CategoryForm /></Tabs.Content>
              <Tabs.Content value="product-sub-category"><SubCategoryForm /></Tabs.Content>
              <Tabs.Content value="change-password"><ChangePasswordDialog /></Tabs.Content>
            </div>
          </MaxWidthWrapper>
        </main>
      </Tabs.Root>
    </div>
  );
};

export default AdminHome;
