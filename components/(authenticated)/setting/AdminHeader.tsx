"use client";
import React, { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserData from "@/components/providers/UserProvider";
import Image from "next/image";

const Header: React.FC = () => {
  const { user } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent click from bubbling
    setIsMenuOpen(prev => !prev);
  };

  // const handleMenuClose = () => setIsMenuOpen(false);

  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const handleLogout = async () => {
    try {
      removeCookie("token");
      toast.dismiss()
      toast.warning("Logging out");
    } catch (err) {
      toast.dismiss()
      toast.error("Logout Failed");
      console.log("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  const formatName = (name: string) => {
    if (!name) return "Loading...";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <header className="bg-white shadow rounded-sm">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xs font-bold sm:text-2xl text-primary-navy-blue">
            ETECH ADMIN
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {formatName(user?.firstName || "Loading...")}
            </p>
          </div>
          <div className="relative">
            <button onClick={handleMenuClick} className="focus:outline-none">
              {user?.profileImageUrl ? (
                <Image
                  src={user?.profileImageUrl || "/path/to/default/image.jpg"} // Fallback if no image is available
                  alt={user?.firstName || "User"}
                  width={40} // Specify width (h-10 corresponds to 40px)
                  height={40} // Specify height (w-10 corresponds to 40px)
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl text-gray-600">
                    {user?.firstName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
