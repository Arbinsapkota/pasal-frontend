"use client";

import { capitalizeFirstLetter } from "@/lib/capital";
import { Product } from "@/redux/slices/cartSlice";
import axios from "axios";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoMdMail } from "react-icons/io";
import { toast } from "react-toastify";
import { axiosInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import LoadingContent from "./LoadingContent";

interface Category {
  categoryId: string;
  name: string;
}
export default function Footer() {
  const { setIsLoginModalOpen } = useModal();
  const user = getUserFromCookies();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // setIsLoading(true);
    const fetchCategories = async () => {
      try {
        // setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        );
        setCategories(response.data.slice(0, 7));
        // fetchAllProducts(response.data);
        // setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // toast.error("Failed to load categories.");
        // setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
    axiosInstance()
      .get("/api/product/")
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => console.error("Err", err));
  }, []);

  return (
    <footer className="bg-[#492abc] text-white py-8 px-4 md:px-8 mt-8">
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-lg font-bold sm:mb-4 mb-2">ABOUT US</h2>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="flex items-center">
                <Phone className="mr-2 h-5 w-5" /> 01-4016520 / +977-9762111788
              </p>
              <a
                target="_blank"
                href="mailto:info@etechintl.com.np"
                className="flex items-center"
              >
                <IoMdMail className="mr-2 h-5 w-5" />
                info@etechintl.com.np
              </a>
              <a
                target="_blank"
                href="https://maps.app.goo.gl/CvJc6hDeaYuHbSYGA"
                className="flex items-start"
              >
                <MapPin className="mr-2 h-5 w-5 mt-1" />
                <span>Kathmandu, Nepal</span>
              </a>
              {/* <p className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 mt-1" />
                <span>701 East Pioneer Pkwy. Arlington, TX 76010</span>
              </p> */}
            </div>
            <div className=" hidden lg:block">
              <p className="mb-2 ">Follow us On</p>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/etechinternational2015/"
                  className="text-white hover:text-blue-400 transition-colors duration-200"
                >
                  <Facebook className="h-8 w-8" />
                </a>
                <a
                  href="https://www.instagram.com/etechinternational2015/"
                  className="text-white hover:text-pink-400 transition-colors duration-200"
                >
                  <Instagram className="h-8 w-8" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:mx-auto">
          <h2 className="text-lg font-bold sm:mb-4 mb-2">MY ACCOUNT</h2>
          <ul className="space-y-2">
            <li>
              {user ? (
                <a href={"/account"} className="hover:underline">
                  My Account
                </a>
              ) : (
                <p
                  className="hover:underline cursor-pointer"
                  onClick={() => {
                    if (!user) {
                      setIsLoginModalOpen(true);
                    }
                  }}
                >
                  My Account
                </p>
              )}
            </li>

            <li>
              <a
                target="_blank"
                href="/PrivacyPolicy.pdf"
                className="hover:underline"
              >
                Privacy Policy
              </a>
            </li>
            {/* <li>
              <a href="/policies/privacy-policy" className="hover:underline">
                Privacy Policy
              </a>
            </li> */}
            {/* <li>
              <a href="/policies/returns" className="hover:underline">
                Returns
              </a>
            </li>
            <li>
              <a
                href="/policies/terms-and-conditions"
                className="hover:underline"
              >
                Terms & Conditions
              </a>
            </li> */}
          </ul>
        </div>
        <div className="lg:mx-auto">
          <h2 className="text-lg font-bold sm:mb-4 mb-2">CATEGORIES</h2>
          <ul className="sm:space-y-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => {
                  return <LoadingContent key={index} className="h-5 w-full " />;
                })
              : categories
                  ?.filter(category =>
                    products?.some(
                      product => product.category == category.categoryId
                    )
                  )
                  ?.map((category, index) => {
                    return (
                      <li key={index}>
                        <p
                          // href={`/homepage/products?category=${category?.categoryId}`}
                          className="hover:underline"
                        >
                          {capitalizeFirstLetter(category?.name)}
                        </p>
                      </li>
                    );
                  })}
          </ul>
        </div>
        <div>
          {/* <h2 className="text-lg font-bold mb-4">NEWSLETTER SIGNUP</h2> */}
          {/* <form className="mb-4">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-full px-3 py-2 text-indigo-900 bg-white rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </form> */}
          <div className=" block lg:hidden">
            <p className="mb-2 ">Follow us On</p>
            <div className="flex space-x-3">
              <a
                target="_blank"
                href="https://www.facebook.com/etechinternational2015/"
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                <Facebook className="h-8 w-8" />
              </a>
              <a
                target="_blank"
                href="https://www.instagram.com/etechinternational2015/"
                className="text-white hover:text-pink-400 transition-colors duration-200"
              >
                <Instagram className="h-8 w-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t border-white mt-8" />
      <div className="mt-4 text-center text-sm text-gray-100 sm:flex justify-between">
        <p>
          Copyright © 2025 ETECH. All rights reserved. Powered by
          <Link
            className={"hover:underline pl-1"}
            target="_blank"
            href={"https://maps.app.goo.gl/CvJc6hDeaYuHbSYGA"}
          >
            ETech International Pvt. Ltd.
          </Link>
        </p>
        <p>
          Developed by:
          <Link
            className={"hover:underline pl-1"}
            target="_blank"
            href={"https://www.mspsolution.com.np/"}
          >
            MSP Solution Pvt. Ltd.
          </Link>
        </p>
      </div>
    </footer>
  );
}
