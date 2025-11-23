"use client";
import React, { useState, useRef, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import useUserData from "@/components/providers/UserProvider";
import { TbLogout2 } from "react-icons/tb";
import { useAuth } from "@/components/providers/AuthProvider";
import { clearCookies, getUserFromCookies } from "@/components/cookie/cookie";
import { axiosAuthInstance } from "@/components/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const AdminModal: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const userCookie = getUserFromCookies();
  const [user, setUser] = useState<any>();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from bubbling
    setIsMenuOpen(prev => !prev);
  };

  // const handleMenuClose = () => setIsMenuOpen(false);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching user details", err));
  }, []);

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
      toast.dismiss();
      toast.warning("Logout successful!");
    } catch (err) {
      toast.dismiss();
      toast.error("Logout Failed!!");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpen(false);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatName = (name: string) => {
    if (!name) return "Loading...";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="relative">
      {/* User Info Row */}
      {/* <DropdownMenu>
      <DropdownMenuTrigger asChild> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <button id="userdropdown" className="focus:outline-none">
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl || "/product.png"}
                  alt={user.firstName || "User Avatar"}
                  className="rounded-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="flex text-xl text-gray-500">
                    {user?.firstName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </button>
            <div className="text-right flex gap-2">
              <p className="font-medium text-sm text-gray-800">
                {formatName(user?.firstName || "")}
              </p>
              <ChevronDown />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white  rounded-lg  w-48">
          {/* <DropdownMenuItem onClick={handleHelp} className="text-gray-900">
              Help & Support
            </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <button className="text-white bg-red-500 text-center font-semibold hover:text-white hover:bg-red-600 cursor-pointer w-full rounded-lg flex py-1.5 items-center px-2 gap-2">
              <TbLogout2 /> Logout{" "}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* </DropdownMenuTrigger> */}

      {/* Dropdown Menu with Animation */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute mt-2 bg-white shadow-lg rounded-lg w-48 right-0 z-50 transform transition-all duration-200 ease-in-out opacity-100 scale-100"
        >
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}

      {/* Confirmation Modal with Animation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6 transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Confirm Logout
            </h3>
            <p className="mb-4 text-black">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModal;
