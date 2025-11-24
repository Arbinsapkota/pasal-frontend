"use client";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { clearCookies, getUserFromCookies } from "@/components/cookie/cookie";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserData } from "@/components/types/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface HeaderProps {
  toggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const user = getUserFromCookies();
  const [userDetails, setUserDetails] = useState<UserData>();
  const { logout } = useAuth();

  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/auth/profile")
        .then((res) => {
          setUserDetails(res.data);
        })
        .catch((err) => console.error("error fetching profile", err));
    }
  }, []);

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
      logout();
      toast.warning("Logged out successfully");
    } catch (err) {
      toast.error("Logout Failed");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpen(false); // Close the modal after logout
  };

  const cancelLogout = () => {
    setIsModalOpen(false); // Close the modal without logging out
  };

  const formatName = (name: string) => {
    if (!name) return "Loading...";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <header className="bg-white shadow-sm rounded-sm flex w-full">
      <div className="flex justify-between items-center w-full p-4">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push("/homepage")}
        >
          <Image
            src="/newlogo.png"
            alt="logo"
            className="sm:h-14 h-8 w-20 sm:w-44"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {formatName(userDetails?.firstName || "Loading...")}
              </p>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  {userDetails?.profileImageUrl ? (
                    <Image
                      src={
                        userDetails?.profileImageUrl || "/default-avatar.jpg"
                      }
                      alt={userDetails?.firstName || "User"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl text-gray-600">
                        {userDetails?.firstName?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setIsModalOpen(true)}
                  className="text-red-500"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden block text-gray-600 hover:text-gray-800"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelLogout}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
