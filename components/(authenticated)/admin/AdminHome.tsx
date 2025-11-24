"use client";
import { clearCookies } from "@/components/cookie/cookie";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RiMenuFold3Line } from "react-icons/ri";
import { toast } from "react-toastify";
import UserDetails from "../setting/UserDetails";
import AdminHeader from "./AdminHeader";
import AdminOrders from "./AdminOrder";
import CouponUpload from "./Coupon/CouponUpload";
import Dashboard from "./Dashboard";
import DeliveryOptions from "./DeliverOptions/DeliveryOptions";
// import GymMembers from "./GymMembers/GymMembers";
import { axiosAuthInstance } from "@/components/axiosInstance";
import CustomerList from "./Customer";
import HelpAndSupport from "./HelpAndSupport/HelpAndSupport";
import MaxWidthWrapper from "./maxWidthWrapper";
import ProductUpload from "./Products/ProductUpload";
import ChangePasswordDialog from "./TabContents/ChangePassword";
import TestimonialForm from "./Testimonials";
import UploadBanners from "./UploadImage/UploadBanners";
import UploadCarousel from "./UploadImage/UploadCarousel";
import UploadOffer from "./UploadImage/UploadOffers";
import UploadPopup from "./UploadImage/UploadPopup";
import SupperCategoryForm from "./AddCategory/AddSupperCategory";
import CategoryForm from "./AddCategory/Category";
import SubCategoryForm from "./AddCategory/AddSubCategory";

const AdminHome: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const router = useRouter();
  const [page, setPage] = useState<string>("dashboard");
  const [subCat, setSubCat] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<number>(0);
  const [isOrderUpdated, setIsOrderUpdated] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
      toast.warning("Logged out successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Logout Failed");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const pageParam = url.searchParams.get("page");
    const subCatParam = url.searchParams.get("subCat");

    if (pageParam) {
      setPage(pageParam); // Set the page state with the value from the URL
    } else {
      setPage("dashboard");
    }
    setSubCat(subCatParam);
  }, []);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/order/processing")
      .then((res) => {
        setProcessingOrder(res.data);
      })
      .catch((err) => console.error("Error fetching order number", err));
  }, [isOrderUpdated]);

  const section = {
    Dashboard: "dashboard",
  };

  const sections = {
    Orders: "orders",
    Customers: "customers",
    Product: "product",
    // "Product Super Category": "product-supper-category",
    "Product Category": "product-category",
    "Product sub Category": "product-sub-category",
    "Special Offers": "offers",
    Coupon: "coupon",
    // "Gym Members": "gym-members",
    "Delivery Options": "delivery-options",
    // "Membership Plans": "membership-plans",
    // Testimonials: "testimonials",
    // Setting: "setting",
    "Change Password": "change-password",
    // "Help and Support": "help-and-support",
  };

  const subCategorySections = {
    Carousel: "carousel",
    // Video: "video",
    PopUp: "popup",
    // Offers: "offers",
    Banner: "banner",
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleGalleryClick = () => {
    setPage("gallery");
  };

  const handleGallerySubcategoryClick = (subcategory: string) => {
    router.push(`/ETECH-Admin/dashboard?page=gallery&subCat=${subcategory}`);
    setSubCat(subcategory);
  };

  const handlePageSelect = (selectedPage: string) => {
    router.push(`/ETECH-Admin/dashboard?page=${selectedPage}`);
    setPage(selectedPage);
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <Tabs.Root value={page} orientation="vertical" className="flex w-full">
        {/* Sidebar */}
        <aside
          className={`fixed z-50 bg-white  h-full overflow-y-auto scrollbar-thin ${
            isSidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 ease-in-out shadow-lg`}
        >
          <Tabs.List className="flex flex-col gap-3 px-4 pt-4 pb-10">
            <div className="flex items-center justify-between gap-2">
              <div
                className="font-bold text-sm sm:text-sm md:text-lg text-white text-center flex items-center justify-center  w-full rounded-md bg-white cursor-pointer"
                onClick={() => {
                  router.push(`/ETECH-Admin/dashboard?page=dashboard`);
                  window.location.reload();
                }}
              >
                <Image
                  src="/newlogo.png"
                  alt=" Logo"
                  height={400}
                  width={400}
                  className="h-16  w-40  rounded-lg "
                />
              </div>
              <Button onClick={toggleSidebar} className="lg:hidden">
                <RiMenuFold3Line className="text-2xl" />
              </Button>
            </div>
            {/* <Image
              src="/adminsidebarbaner.png"
              alt="Total doers"
              width={250}
              height={150}
              className="m-1 w-full h-[130px] object-fill border-b-2
              "
            /> */}
            {Object.entries(section).map(([displayName, id]) => {
              return (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className={cn(
                    "p-2.5 cursor-pointer rounded-md text-left flex items-center justify-between",
                    "hover:bg-primaryBlue/90 hover:text-white",
                    page == id
                      ? "bg-primaryBlue text-white"
                      : "bg-gray-200 text-black"
                  )}
                  onClick={() => handlePageSelect(id)}
                >
                  {displayName}
                </Tabs.Trigger>
              );
            })}
            <Tabs.Trigger
              value="gallery"
              className={cn(
                "p-2.5 cursor-pointer rounded-md text-left flex items-center justify-between",
                "hover:bg-primaryBlue/90 hover:text-white",
                page === "gallery"
                  ? "bg-primaryBlue text-white"
                  : "bg-gray-200 text-black"
              )}
              onClick={handleGalleryClick}
            >
              Gallery
            </Tabs.Trigger>
            {page === "gallery" && (
              <div className=" ml-4">
                {Object.entries(subCategorySections).map(
                  ([displayName, id]) => {
                    return (
                      <Button
                        key={displayName}
                        className={cn(
                          "w-full text-left p-2 hover:bg-gray-300 my-1",
                          "hover:bg-primaryBlue/90 hover:text-white",
                          subCat === displayName
                            ? "bg-primaryBlue text-white"
                            : "bg-gray-200 text-black"
                        )}
                        onClick={() => handleGallerySubcategoryClick(id)}
                      >
                        {displayName}
                      </Button>
                    );
                  }
                )}
              </div>
            )}
            {Object.entries(sections).map(([displayName, id]) => {
              return (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className={cn(
                    "p-2.5 cursor-pointer  rounded-md text-left flex items-center justify-between",
                    "hover:bg-primaryBlue/90 hover:text-white",
                    page == id
                      ? "bg-primaryBlue text-white"
                      : "bg-gray-200 text-black"
                  )}
                  onClick={() => handlePageSelect(id)}
                >
                  <p>{displayName}</p>

                  {displayName == "Orders" && (
                    <p className="bg-white text-blue-500 font-semibold  text-sm py-0.5 px-2 rounded-full">
                      {processingOrder}{" "}
                    </p>
                  )}
                </Tabs.Trigger>
              );
            })}
            <Button
              onClick={() => handleLogout()}
              variant={"outline"}
              className="p-2.5  border border-gray-300 rounded  w-full  text-white  text-left bg-red-600 font-semibold hover:bg-red-800/90 hover:text-white"
            >
              Logout
            </Button>
          </Tabs.List>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-grow transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <AdminHeader
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
          <MaxWidthWrapper className="pt-8 px-5">
            <Tabs.Content value="dashboard">
              {page === "dashboard" && <Dashboard />}
            </Tabs.Content>
            {/* <Tabs.Content value="gym-members">
              {page === "gym-members" && <GymMembers />}
            </Tabs.Content> */}
            <Tabs.Content value="customers">
              {page === "customers" && <CustomerList />}
            </Tabs.Content>
            <Tabs.Content value="coupon">
              {page === "coupon" && (
                <>
                  <CouponUpload />
                </>
              )}
            </Tabs.Content>
            <Tabs.Content value="offers">
              {page === "offers" && (
                <>
                  <UploadOffer />
                </>
              )}
            </Tabs.Content>
            <Tabs.Content value="product">
              {page === "product" && (
                <>
                  <ProductUpload />
                </>
              )}
            </Tabs.Content>
            <Tabs.Content value="orders">
              {page === "orders" && (
                <AdminOrders setIsOrderUpdated={setIsOrderUpdated} />
              )}
            </Tabs.Content>
            <Tabs.Content value="membership-plans">
              {/* {page === "membership-plans" && <CreatePlan />} */}
            </Tabs.Content>
            <Tabs.Content value="delivery-options">
              {page === "delivery-options" && <DeliveryOptions />}
            </Tabs.Content>
            {/* <Tabs.Content value="product-supper-category">
              {page === "product-supper-category" && <SupperCategoryForm />}
            </Tabs.Content> */}
            <Tabs.Content value="product-category">
              {page === "product-category" && <CategoryForm />}
            </Tabs.Content>
            <Tabs.Content value="product-sub-category">
              {page === "product-sub-category" && <SubCategoryForm />}
            </Tabs.Content>
            <Tabs.Content value="testimonials">
              {page === "testimonials" && <TestimonialForm />}
            </Tabs.Content>
            <Tabs.Content value="help-and-support">
              {page === "help-and-support" && <HelpAndSupport />}
            </Tabs.Content>
            <Tabs.Content value="setting">
              {page === "setting" && <UserDetails />}
            </Tabs.Content>
            <Tabs.Content value="change-password">
              {page === "change-password" && <ChangePasswordDialog />}
            </Tabs.Content>
            <Tabs.Content value="gallery">
              {subCat === "carousel" && <UploadCarousel />}
              {/* {subCat === "video" && <UploadVideo />} */}
              {subCat === "popup" && <UploadPopup />}
              {/* {subCat === "offers" && <UploadOffer />} */}
              {subCat === "banner" && <UploadBanners />}
              {!subCat && (
                <p className="text-center text-xl text-gray-500 font-semibold py-8">
                  Select a subcategory from the sidebar.
                </p>
              )}
            </Tabs.Content>
          </MaxWidthWrapper>
        </main>
      </Tabs.Root>
    </div>
  );
};

export default AdminHome;
