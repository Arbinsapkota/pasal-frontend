"use client";

import axios from "axios";
import { Menu, Heart, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { clearCookies, getUserFromCookies } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { clearCart } from "@/redux/slices/cartSlice";

import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { axiosAuthInstance } from "../axiosInstance";
import Container from "../container";
import { useAuth } from "../providers/AuthProvider";
import { UserData } from "../types/user";

import CartModall from "./CartModall";
import FavoriteModal from "./FavoriteModal";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import RegistrationModal from "./RegistrationModal";
import UsedSearchBar from "./search/UsedSearchBar";
import SmallScreenSearchBar from "./search/SmallScreenSearchBar";
import UserModal from "../(authenticated)/usermodal/UserModal";

function Header() {
  const {
    isSignupModalOpen,
    isLoginModalOpen,
    closeSignupModal,
    closeLoginModal,
    openLoginModal,
  } = useModal();

  const router = useRouter();
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const user = getUserFromCookies();
  const [userDetails, setUserDetails] = useState<UserData>();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideSidebar =
    pathname === "/homepage/products" || searchParams.toString() !== "";

  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/auth/profile")
        .then(res => setUserDetails(res.data))
        .catch(() => {});
    }
  }, []);

  const handleHomeClick = () => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
  };

  const handleLogout = () => {
    clearCookies();
    logout();
    dispatch(clearCart());
    toast.success("Logged out");
    router.push("/homepage");
    setLogoutConfirm(false);
  };

  return (
    <Container className="fixed top-0 w-full z-50">
      {/* GLASS HEADER */}
      <div className="backdrop-blur-md bg-white/70 shadow-sm border-b border-black/5">
        <div className="flex items-center justify-between px-4 md:px-10 h-20">
          
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenu} onOpenChange={setIsMobileMenu}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" className="p-2 hover:bg-gray-100">
                  <Menu size={26} className="text-gray-700" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="p-5 w-72">
                <SheetTitle className="text-lg font-semibold">
                  Menu
                </SheetTitle>

                <div className="mt-6 space-y-6">

                  {user ? (
                    <>
                      {/* USER AVATAR */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={userDetails?.profileImageUrl || "/product.png"}
                          alt="User"
                          width={45}
                          height={45}
                          className="rounded-full object-cover"
                        />
                        <p className="font-semibold text-gray-800 text-sm">
                          {userDetails?.firstName}
                        </p>
                      </div>

                      <Button
                        className="w-full bg-blue-600 text-white"
                        onClick={() =>
                          router.push(
                            `${process.env.NEXT_PUBLIC_FRONTEND_URL}/account`
                          )
                        }
                      >
                        <User size={18} /> My Account
                      </Button>

                      <Button
                        className="w-full bg-red-500 text-white"
                        onClick={() => setLogoutConfirm(true)}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={openLoginModal}
                      className="w-full bg-blue-600 text-white"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* LOGO */}
            <Image
              onClick={handleHomeClick}
              src="/newlogo.png"
              alt="logo"
              width={500}
              height={500}
              className=" h-12 w-20 cursor-pointer transition-transform hover:scale-[1.03]"
            />
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-10">
            <UsedSearchBar />
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center space-x-5">
            <div className="md:hidden">
              <SmallScreenSearchBar
                isSearchVisible={isSearchVisible}
                setIsSearchVisible={setIsSearchVisible}
              />
            </div>

            <FavoriteModal />

            <CartModall />

            {user ? (
              <UserModal />
            ) : (
              <Button
                onClick={openLoginModal}
                className="font-semibold bg-white border hover:bg-gray-100 text-black"
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {logoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h2 className="font-semibold text-lg mb-3">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">Do you want to logout?</p>

            <div className="flex justify-end gap-4">
              <Button
                className="bg-red-500 text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Button variant="outline" onClick={() => setLogoutConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <RegistrationModal isOpen={false} onClose={() => {}} />
    </Container>
  );
}

export default Header;
