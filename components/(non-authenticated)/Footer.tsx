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
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        );
        setCategories(response.data.slice(0, 7));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProducts = () => {
      axiosInstance()
        .get("/api/product/")
        .then(res => {
          setProducts(res.data);
        })
        .catch(err => console.error("Err", err));
    };

    fetchCategories();
    fetchProducts();
  }, []);

  return (
    // 1. Deep, dark background color for a premium, contrasting look
    <footer className="bg-slate-900 text-gray-300 py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 border-b border-gray-700 pb-12">
          
          {/* Column 1: ABOUT US & Contact Info (Expanded) */}
          <div className="col-span-2 lg:col-span-1">
            {/* Replace with a logo/brand element for a complete look */}
            <h2 className="text-2xl font-extrabold text-white tracking-wider mb-6">
              Puja Pasal
            </h2>
            <div className="space-y-4 text-sm font-light">
              <p className="flex items-start transition-colors duration-200">
                <MapPin className="mr-3 h-5 w-5 text-cyan-400 mt-0.5" />
                <span>Green Hill City , Mulpani , Nepal</span>
              </p>
              <p className="flex items-center transition-colors duration-200">
                <Phone className="mr-3 h-5 w-5 text-cyan-400" /> 
                 +977-9851005370 / 9869400864 
              </p>
              <a
                target="_blank"
                href="mailto:info@pujapasal.com.np"
                className="flex items-center hover:text-cyan-400 transition-colors duration-200"
              >
                <IoMdMail className="mr-3 h-5 w-5 text-cyan-400" />
                info@pujapasal.com.np
              </a>
            </div>
            
            {/* Social Media (Visible on all sizes) */}
            <div className="mt-8">
              <p className="text-gray-400 text-sm mb-3 font-semibold uppercase tracking-wider">
                Connect With Us
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/etechinternational2015/"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/etechinternational2015/"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                {/* Add more icons (e.g., LinkedIn, X/Twitter) for a modern approach */}
              </div>
            </div>
          </div>

          {/* Column 2: CATEGORIES (Data-driven section) */}
          <div>
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Popular Categories
            </h2>
            <ul className="space-y-3 text-sm font-light">
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    // 2. Use a better loader for a premium feel (e.g., a subtle dark skeleton)
                    <LoadingContent key={index} className="h-4 w-4/5 bg-gray-700 rounded" />
                  ))
                : categories
                    ?.filter(category =>
                      products?.some(
                        product => product.category == category.categoryId
                      )
                    )
                    ?.map((category, index) => (
                      <li key={index}>
                        <Link
                          href={`/products?category=${category?.categoryId}`}
                          className="hover:text-cyan-400 transition-colors duration-200 block"
                        >
                          {capitalizeFirstLetter(category?.name)}
                        </Link>
                      </li>
                    ))}
            </ul>
          </div>

          {/* Column 3: MY ACCOUNT / QUICK LINKS */}
          <div>
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Customer Links
            </h2>
            <ul className="space-y-3 text-sm font-light">
              <li>
                {user ? (
                  <Link href={"/account"} className="hover:text-cyan-400 transition-colors duration-200">
                    My Account
                  </Link>
                ) : (
                  <p
                    className="hover:text-cyan-400 cursor-pointer transition-colors duration-200"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Login / Register
                  </p>
                )}
              </li>
              <li>
                <Link 
                  href="/track-order" // Placeholder for an E-commerce essential link
                  className="hover:text-cyan-400 transition-colors duration-200"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <a
                  target="_blank"
                  href="/PrivacyPolicy.pdf"
                  className="hover:text-cyan-400 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              {/* Add more essential links */}
              <li>
                <Link 
                  href="/shipping-info" // Placeholder for an E-commerce essential link
                  className="hover:text-cyan-400 transition-colors duration-200"
                >
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Newsletter/Brand Statement (Added for premium feel) */}
          <div className="col-span-2 md:col-span-1">
             <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Our Vision
            </h2>
            <p className="text-sm font-light mb-6">
              We are dedicated to providing the latest technology products with unmatched service and reliability. ETECH is your trusted partner for innovation.
            </p>
            {/* Adding a newsletter/callout for advanced design */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-md font-semibold text-cyan-400 mb-2">Subscribe to our Newsletter</p>
                <p className="text-xs text-gray-500 mb-3">Get exclusive discounts and product updates.</p>
                <form className="flex">
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      className="w-full px-3 py-2 text-white bg-gray-700 border-none rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 text-gray-900 px-4 py-2 rounded-r-md font-semibold hover:bg-cyan-400 transition-colors duration-200 text-sm"
                    >
                      Subscribe
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar (Copyright) */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 sm:flex justify-between items-center">
          <p className="order-2 sm:order-1 mb-2 sm:mb-0">
            Copyright © {new Date().getFullYear()} ETECH. All rights reserved. 
            <Link
              className={"hover:text-cyan-400 pl-1 font-medium transition-colors duration-200"}
              target="_blank"
              href={"https://maps.app.goo.gl/CvJc6hDeaYuHbSYGA"}
            >
              ETech International Pvt. Ltd.
            </Link>
          </p>
          <p className="order-1 sm:order-2">
            Developed by:
            <Link
              className={"hover:text-cyan-400 pl-1 font-medium transition-colors duration-200"}
              target="_blank"
              href={"https://www.mspsolution.com.np/"}
            >
              MSP Solution Pvt. Ltd.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}