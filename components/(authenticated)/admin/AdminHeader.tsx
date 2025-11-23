"use client";
import React, { useEffect, useState } from "react";
import { RiMenuUnfold3Line } from "react-icons/ri";
import { clearCookies, getUserFromCookies } from "@/components/cookie/cookie";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "./maxWidthWrapper";
import AdminModal from "../usermodal/AdminModal";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
function AdminHeader({
  isSidebarOpen,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const [user, setUser] = useState({});
  const userCookie = getUserFromCookies();
  const router = useRouter();

  useEffect(() => {
    if (userCookie) {
      axiosAuthInstance()
        .get("/api/auth/profile")
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching User Details", err));
    }
  }, []);

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
        toast.dismiss();
      toast.warning("Logged out successfully");
    } catch (err) {
        toast.dismiss();
      toast.error("Logout Failed");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  // console.log(user);

  return (
    <div
      className={`   shadow-lg ${
        isSidebarOpen ? "min-w-max sm:min-w-full overflow-hidden" : ""
      }`}
    >
      <MaxWidthWrapper
        className={`flex justify-between  items-center transition-all duration-300  ${
          isSidebarOpen ? "px-2.5 md:px-5 " : ""
        }`}
      >
        <div className="">
          <Button
            onClick={toggleSidebar}
            className={` transition-opacity  ${
              isSidebarOpen ? "opacity-0 " : "opacity-100 "
            }`}
          >
            <RiMenuUnfold3Line className="text-2xl" />
          </Button>
        </div>
        <div className="hidden sm:flex items-center mx-auto cursor-pointer ">
          <div className=" px-3">
            <h1 className="text-xs font-bold sm:text-2xl primary-navy-blue">
           ADMIN PANEL
            </h1>
          </div>
        </div>

        <div className=" p-1">
          {/* Conditionally render UserModal only if the user exists */}
          {user && <AdminModal />}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}

export default AdminHeader;
