"use client";

import axios from "axios";
import { Menu } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserModal from "../(authenticated)/usermodal/UserModal";
import { clearCookies, getUserFromCookies } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

import { clearCart, Product } from "@/redux/slices/cartSlice";
import toast from "react-hot-toast";
import { BiLogOut } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { axiosAuthInstance, axiosInstance } from "../axiosInstance";
import Container from "../container";
import { useAuth } from "../providers/AuthProvider";
import { UserData } from "../types/user";
import CartModall from "./CartModall";
import FavoriteModal from "./FavoriteModal";
import LoginModal from "./LoginModal";
import RegistrationModal from "./RegistrationModal";
import SignupModal from "./SignupModal";
import UsedSearchBar from "./search/UsedSearchBar";
import MegaMenu from "../ui/MegaMenu";
import SmallScreenSearchBar from "./search/SmallScreenSearchBar";

export interface Plan {
  planId: string;
  planName: string;
  description: string;
  discount: number;
  durationInDays: number;
  price: number;
  createdAt: string; // Use `Date` if you want to parse it as a Date object
  updatedAt: string; // Use `Date` if you want to parse it as a Date object
}

interface Category {
  categoryId: string;
  name: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string | null; // Can be null if not updated yet
}

interface Subcategory {
  subcategoryId: string;
  category: Category;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

function Header() {
  const {
    isSignupModalOpen,
    isLoginModalOpen,
    closeSignupModal,
    openLoginModal,
    closeLoginModal,
    setIsLoginModalOpen,
    setIsMemberModalOpen,
    setPlan,
  } = useModal();
  const router = useRouter();
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const [isMembershipModalOpen, setIsMembershipModalOpen] =
    useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenLogout, setIsModalOpenLogout] = useState(false);
  const [isModalOpenSidebar, setIsModalOpenSideBar] = useState(false);
  const user = getUserFromCookies();

  const handleHomeClick = () => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
  };

  const pathname = usePathname();
  const searchParams = useSearchParams();
  // for the search bar visible
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Check if path is exactly "/homepage/products" AND query exists
  const hideSidebar =
    pathname === "/homepage/products" || searchParams.toString() !== "";
  const [userDetails, setUserDetails] = useState<UserData>();

  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/auth/profile")
        .then(res => {
          setUserDetails(res.data);
        })
        .catch(err => console.error("error fetching profile", err));
    }
  }, []);

  const handleSetting = () => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/account`);
  };

  const handleLogout = async () => {
    try {
      clearCookies();
      window.location.reload();
      logout();
      dispatch(clearCart());
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout Failed");
      console.error("Error occurred", err);
    } finally {
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
    }
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpenLogout(false);
  };

  const cancelLogout = () => {
    setIsModalOpenLogout(false);
  };
  return (
    <Container className="fixed z-30 h-20 w-full">
      <div className="w-full z-20 bg-white   shadow-md">
        <div className="flex items-center justify-between gap-5 sm:px-6 pl-2 py-2">
          <div
            className={`flex items-center cursor-pointer `}
            onClick={handleHomeClick}
          >
            <Image
              src="/newlogo.png"
              alt="ETECH Logo"
              height={400}
              width={400}
              className={`sm:h-10 h-8 w-28 sm:w-28 ${isSearchVisible ? "hidden" : ""}`}
            />
          </div>

{/* for the small screen */}
          <div className="flex items-center md:hidden space-x-4 mr-2 sm:mr-0">
            <SmallScreenSearchBar isSearchVisible={isSearchVisible}  setIsSearchVisible={setIsSearchVisible} />
            <div className={`${isSearchVisible ? "hidden" : ""}`}>
              <FavoriteModal />
            </div>
            <CartModall />

            {/* <CartModal /> */}
            <Sheet
              onOpenChange={setIsModalOpenSideBar}
              open={isModalOpenSidebar}
            >
              <SheetTrigger asChild>
                <Button className="hover:bg-blue-200 p-3" variant={"outline"}>
                  <Menu className="text-black " size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-4">
                <SheetTitle className="mb-4 text-lg font-semibold">
                  Menu
                </SheetTitle>
                <nav className="flex flex-col space-y-3 z-40">
                  <div className="mx-auto text- w-full">
                    {user ? (
                      // <UserModal />
                      <div className=" w-full flex flex-col gap-3">
                        <div className="flex items-center gap-2">
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
                                {userDetails?.firstName
                                  ?.charAt(0)
                                  .toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <p className="font-medium text-sm text-black">
                            {userDetails?.firstName || "unknown"}
                          </p>
                        </div>
                        <Button
                          variant={"outline"}
                          onClick={handleSetting}
                          className="text-gray-900 hover:bg-blue-300 cursor-pointer font-semibold  "
                        >
                          <BsPersonCircle /> Account
                        </Button>
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            setIsModalOpenLogout(true);
                            setIsModalOpenSideBar(false);
                          }}
                          className="text-white cursor-pointer bg-red-500 hover:bg-red-700 font-semibold  hover:text-white "
                        >
                          <BiLogOut className="font-semibold" /> Logout
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        onClick={openLoginModal}
                        className="font-semibold bg-primaryBlue hover:bg-primaryBlue text-white w-full text-start "
                      >
                        Log In
                      </Button>
                    )}
                  </div>
                </nav>
                {/* CAtegories with the supper category
                <div>
                  <p className="my-2 font-semibold underline ">Categories</p>
                  <MegaMenu />
                </div> */}
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center justify-between w-full">

            <div className="flex-grow mx-8 hidden md:block">
              {/* <NewSearchBar /> */}
              <UsedSearchBar />
            </div>

            <div className="flex items-center space-x-6 text-white">
              <div className="flex space-x-4 items-center">
                <FavoriteModal />
                <CartModall />
              </div>

              {user ? (
                <UserModal />
              ) : (
                <Button
                  // variant=""
                  className="font-semibold bg-white hover:bg-blue-200 text-black "
                  onClick={openLoginModal}
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
        </div>

        <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      {isModalOpenLogout && (
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
      {/*  */}
      {/* <div className="md:block hidden">{!hideSidebar && <MegaMenu />}</div> */}
    </Container>
  );
}

export default Header;
