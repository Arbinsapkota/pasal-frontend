import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import Container from "@/components/container";

const TopNavBar = () => {
  return (
    <Container className=" bg-yellow-600 z-50 text-white sm:h-auto h-[25px]">
      <div className=" sm:px-5 px-3 py-0.5  flex  sm:flex-row justify-between items-center gap-3 ">
        {/* Left section: Location and Phone */}
        <div className="flex flex-row  sm:gap-12 gap-4 text-sm sm:text-base ">
          <div className="flex  items-center sm:gap-2 gap-1">
            <IoLocationOutline className="text-sm" />
            <span className="sm:text-[14px] text-[10px] truncate">
             GreenHill City , Mulpani , Nepal
            </span>
          </div>
          <div className="flex  items-center sm:gap-2 gap-1">
            <FiPhone className="text-sm" />
            <p className="flex  items-center ">
              <span className="sm:text-[14px] text-[10px]"> +977- 9851005370 /9869400864 /9841315184</span>
            </p>
          </div>
        </div>

        {/* Right section: Social Media */}
        <div className="flex items-center gap-3 text-sm sm:text-base">
          <span className="hidden sm:inline text-[14px]">Follow Us On:</span>
          <a
            target="_blank"
            href="https://www.facebook.com/etechinternational2015/"
          >
            <FaFacebook className="hover:text-gray-200 cursor-pointer text-sm" />
          </a>
          <a
            target="_blank"
            href="https://www.instagram.com/etechinternational2015/"
          >
            <FaInstagram className="hover:text-gray-200 cursor-pointer text-sm" />
          </a>
        </div>
      </div>
    </Container>
  );
};

export default TopNavBar;
