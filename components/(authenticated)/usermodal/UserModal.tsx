"use client";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { clearCookies, getUserFromCookies } from "@/components/cookie/cookie";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserData } from "@/components/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import ShadcnUI components
import { clearCart } from "@/redux/slices/cartSlice";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { BsPersonCircle } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
const UserModal: React.FC = () => {
  const { logout } = useAuth();
  const user = getUserFromCookies();
  const [userDetails, setUserDetails] = useState<UserData>();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/auth/profile")
        .then(res => {
          setUserDetails(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("error fetching profile", err);
          setLoading(false);
        });
    }
  }, []);

  const fullName = userDetails?.firstName || "";
  const firstName = fullName.includes(" ") ? fullName.split(" ")[0] : fullName;

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
      logout();
      dispatch(clearCart());
      toast.warning("Logged out successfully");
    } catch (err) {
      toast.error("Logout Failed");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  const handleSetting = () => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/account`);
  };

  const handleHelp = () => {
    router.push(`/homepage/helpandsupport`);
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpen(false);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  const formatName = (name: string) => {
    if (!name) return "Loading...";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="relative">
      {/* User Info Row */}
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <button id="userdropdown" className="focus:outline-none">
                {userDetails?.profileImageUrl ? (
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
                      {userDetails?.firstName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </button>
              <div className="text-right flex gap-2">
                <div className="font-medium text-sm text-black">
                  {loading ? (
                    <LoadingContent className="h-[20px] w-[100px]" />
                  ) : (
                    <p>{firstName || "unknown"}</p>
                  )}
                </div>
                <ChevronDown className="text-black" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white shadow-lg rounded-lg p-2 w-48">
            <DropdownMenuItem
              onClick={handleSetting}
              className="text-gray-900 cursor-pointer border mb-1 hover:bg-blue-200"
            >
              <BsPersonCircle /> Account
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={handleHelp} className="text-gray-900">
              Help & Support
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => {
                setIsModalOpen(true);
              }}
              className=" cursor-pointer bg-red-500 hover:bg-red-600 text-white"
            >
              <BiLogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Confirmation Modal */}
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

export default UserModal;
