"use client";
import CartModal from "@/components/(non-authenticated)/CartModall";
import FavoriteModal from "@/components/(non-authenticated)/FavoriteModal";
import SmallScreenSearchBar from "@/components/(non-authenticated)/search/SmallScreenSearchBar";
import UsedSearchBar from "@/components/(non-authenticated)/search/UsedSearchBar";
// import UsedSearchBar from "@/components/(non-authenticated)/search/UsedSearchBar";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { getUserFromCookies } from "@/components/cookie/cookie";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
import { UserData } from "@/components/types/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export interface Plan {
  planId: string;
  planName: string;
  description: string;
  discount: number;
  durationInDays: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

const Header = () => {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserData>();
  const handleHomeClick = () => {
    router.push("/");
  };
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const user = getUserFromCookies();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
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
  return (
    <header className="fixed z-50 bg-white h-20 w-full">
      <div className="w-full z-20  shadow-md text-white px-2">
        <div className="flex items-center justify-between gap-5 sm:px-6 py-2">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer"
            onClick={handleHomeClick}
          >
            <Image
              src="/etech-logo.jpg"
              alt="ETECH Logo"
              height={400}
              width={400}
              className={`sm:h-12 h-8 w-32 sm:w-44 rounded-lg ${
                isSearchVisible ? "hidden" : ""
              }`}
            />
          </div>

          {/* Middle Section */}
          <div className="flex items-center justify-between w-full">
            <nav className="flex items-center lg:gap-6">
              {/* Future nav items can go here */}
            </nav>

            {/* Search Bar */}
            <div className="flex-grow mx-8 hidden md:block">
              <UsedSearchBar />
            </div>

           

            {/* Action Icons */}
            <div className="flex items-center space-x-3">
               <div className="flex-grow md:hidden block">
              <SmallScreenSearchBar
                isSearchVisible={isSearchVisible}
                setIsSearchVisible={setIsSearchVisible}
              />
            </div>
              <div className="flex space-x-3">
                <div className={`mt-1 ${isSearchVisible ? "hidden" : ""}`}>
                  <FavoriteModal />
                </div>
                <div className="mt-2">
                  <CartModal />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userDetails?.profileImageUrl ? (
                  <Image
                    src={userDetails.profileImageUrl}
                    alt={userDetails.firstName || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xl ">
                      {userDetails?.firstName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div className="hidden sm:block text-sm font-medium text-gray-800">
                  {loading ? (
                    <LoadingContent className="h-[20px] w-[100px]" />
                  ) : (
                    <p>{firstName || "Unknown"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
