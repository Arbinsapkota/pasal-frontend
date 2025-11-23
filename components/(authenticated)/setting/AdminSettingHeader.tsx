"use client";
import React, { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useUserData from "@/components/providers/UserProvider";
import Image from "next/image";

const AdminSettingHeader: React.FC = () => {
  const { user } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  // const handleMenuClose = () => setIsMenuOpen(false);

  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const handleLogout = async () => {
    try {
      removeCookie("token");
      toast.warning("Logging out");
    } catch (err) {
      toast.dismiss()
      toast.error("Logout Failed");
      console.log("Error occurred", err);
    } finally {
      router.push(`/`);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "ASSIGNMENT_DOER":
        return "Doer";
      case "ASSIGNMENT_CREATOR":
        return "Creator";
      case "ADMIN":
        return "Admin";
      default:
        return "Loading...";
    }
  };

  const formatName = (name: string) => {
    if (!name) return "Loading...";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleLogoutClick = () => {
    setIsModalOpen(true); // Open the confirmation modal
    setIsMenuOpen(false); // Close the menu
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpen(false); // Close the modal after logout
  };

  const cancelLogout = () => {
    setIsModalOpen(false); // Close the modal without logging out
  };

  return (
    <header className="bg-white shadow rounded-sm  w-full fixed">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xs font-bold sm:text-2xl text-primary-navy-blue">
            ETECH
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {formatName(user?.firstName || "Loading...")}
            </p>
            <p className="text-xs text-gray-600">
              {getUserTypeLabel(user?.userType || "USER")}
            </p>
          </div>
          <div className="relative">
            <button onClick={handleMenuClick} className="focus:outline-none">
              {user?.profileImageUrl ? (
                <Image
                  src={user?.profileImageUrl || "/default-avatar.jpg"} // Fallback to a default image if profileImageUrl is not available
                  alt={user?.firstName || "User"} // Fallback alt text
                  width={40} // Set a fixed width (e.g., 40px)
                  height={40} // Set a fixed height (e.g., 40px)
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
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Confirm Logout
            </h3>
            <p className="mb-4  text-black">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminSettingHeader;
