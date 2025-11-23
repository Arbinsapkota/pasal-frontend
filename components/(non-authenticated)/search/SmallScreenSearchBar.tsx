"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoSearchSharp, IoClose, IoSearch } from "react-icons/io5";
import { Product } from "@/redux/slices/cartSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SmallScreenSearchBarProps {
  isSearchVisible: boolean;
  setIsSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SmallScreenSearchBar: React.FC<SmallScreenSearchBarProps> = ({
  isSearchVisible,
  setIsSearchVisible,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch products when searchQuery changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchProducts();
      } else {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search?productName=${searchQuery}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close search result when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {/* Search Icon for Small Screens */}
      <div className="md:hidden flex items-center justify-end">
        {!isSearchVisible && (
          <button
            onClick={() => setIsSearchVisible(true)}
            aria-label="Open search bar"
          >
            <IoSearch className="text-2xl hover:text-gray-800 text-primaryBlue" />
          </button>
        )}
      </div>

      {/* Search Bar Wrapper with External Padding */}
      <div className={`${isSearchVisible ? "px-4" : ""} md:px-4 w-full`}>
        <div
          className={`${
            isSearchVisible ? "flex" : "hidden"
          } md:flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-800 shadow-sm w-full max-w-[240px] sm:max-w-[300px] md:max-w-[400px] absolute top-1.5 left-0 md:static z-20 md:z-auto focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all ml-2`}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full h-8 outline-none text-sm placeholder-gray-500 bg-transparent"
          />
          <IoSearchSharp className="text-xl text-primaryBlue hidden md:block" />
          <IoClose
            className="text-xl text-gray-500 md:hidden cursor-pointer"
            onClick={() => {
              setIsSearchVisible(false);
              setSearchQuery("");
              setIsFocused(false);
            }}
            aria-label="Close search bar"
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && isSearchVisible && (
        <div className="absolute z-10 px-4 w-full max-w-[240px] sm:max-w-[300px] md:max-w-[400px] text-gray-800 bg-white shadow-lg border border-gray-200 rounded-md mt-1 max-h-64 overflow-y-auto top-12 left-0 md:top-auto md:mt-2 md:mx-auto md:px-4 ml-2">
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 animate-pulse max-h-64 flex gap-x-4 my-1 px-3 items-center py-2"
              >
                <div className="h-10 rounded-sm w-12 bg-gray-200 animate-pulse"></div>
                <div className="h-8 w-full">
                  <div className="h-4 w-1/2 rounded-sm bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-1/3 rounded-sm bg-gray-200 animate-pulse mt-1"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map(product => (
              <div
                key={product.productId}
                className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                onClick={() => {
                  setIsFocused(false);
                  setSearchQuery(product.name);
                  setIsSearchVisible(false);
                  router.push(`/homepage/products/${product.productId}`);
                }}
              >
                <Image
                  src={product.imageUrls?.[0] || "/product.png"}
                  alt={product.name || "Product image"}
                  className="h-10 w-10 rounded object-contain"
                  height={40}
                  width={40}
                />
                <p className="text-gray-700 line-clamp-3 text-wrap">
                  {product.name}
                </p>
              </div>
            ))
          ) : (
            <p className="p-3 text-sm text-gray-500">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SmallScreenSearchBar;
