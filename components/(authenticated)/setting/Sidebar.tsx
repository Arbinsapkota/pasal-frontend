"use client";

import { clearCookies } from "@/components/cookie/cookie";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, ShoppingBag, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  onSelect: (view: string) => void;
};

export function AppSidebar({ onSelect }: Props) {
  const items = [
    {
      title: "My Profile",
      key: "profile",
      icon: <User className="w-4 h-4 mr-2" />,
    },
    {
      title: "My Order",
      key: "orders",
      icon: <ShoppingBag className="w-4 h-4 mr-2" />,
    },
    {
      title: "Logout",
      key: "logout",
      icon: <LogOut className="w-4 h-4 mr-2" />,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("profile");
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const handleLogout = async () => {
    try {
      clearCookies();
      removeCookie("user");
      toast.warning("Logging out...");
      router.push(`/`);
      window.location.reload();
    } catch (err) {
      toast.dismiss();
      toast.error("Logout Failed");
      console.log("Error occurred", err);
    }
  };

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    handleLogout();
    setIsModalOpen(false);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (pathname.includes("orders")) {
      setSelectedKey("orders");
    } else if (pathname.includes("profile")) {
      setSelectedKey("profile");
    }
  }, [pathname]);

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="sm:hidden  w-full flex justify-end ">
                {" "}
                <SidebarTrigger />
              </div>
              {/* for the small screen */}
              <SidebarMenu className="sm:mt-20 block sm:hidden">
                {items.map(item => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.key === "logout") {
                          handleLogoutClick();
                        } else {
                          setSelectedKey(item.key);
                          onSelect(item.key);
                          toggleSidebar();
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded transition-colors
                        ${
                          item.key === "logout"
                            ? "bg-red-500 hover:bg-red-700 hover:text-white  text-white font-semibold"
                            : selectedKey === item.key
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              {/* for the other screen not for the small screen */}
              <SidebarMenu className="sm:mt-20 sm:block hidden">
                {items.map(item => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.key === "logout") {
                          handleLogoutClick();
                        } else {
                          setSelectedKey(item.key);
                          onSelect(item.key);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded transition-colors
                        ${
                          item.key === "logout"
                            ? "bg-red-500 hover:bg-red-700 hover:text-white  text-white font-semibold"
                            : selectedKey === item.key
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Confirm Logout
            </h2>
            <p className="mb-6 text-black">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
