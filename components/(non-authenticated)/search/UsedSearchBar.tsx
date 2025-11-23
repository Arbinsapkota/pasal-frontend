"use client";
import { Product } from "@/redux/slices/cartSlice";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";

const UsedSearchBar: React.FC = () => {
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
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto ">
      <div className="flex items-center gap-2 border rounded-xl px-3 py-1 bg-white text-black shadow-sm">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full h-7 outline-none text-md"
        />
        <IoSearchSharp className="text-2xl text-primaryBlue" />
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && (
        <div
          className={`absolute z-10 w-full text-black bg-white shadow-md border mt-1 rounded-md max-h-64 overflow-y-auto `}
        >
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 animate-pulse   max-h-64 flex gap-x-4 my-1 mx-1 px-4 items-center py-1"
              >
                <div className="h-10 rounded-sm w-12 bg-gray-300 animate-pulse"></div>
                <div className="h-8 w-full ">
                  <div className="h-4 w-1/2 rounded-sm bg-gray-300 animate-pulse"></div>
                  <div className="h-4 w-1/3 rounded-sm bg-gray-300 animate-pulse mt-1"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map(product => (
              <div
                key={product.productId}
                className="flex items-center gap-3 px-3  border-b mx-1 hover:bg-blue-100 my-1 rounded-sm cursor-pointer text-sm"
                onClick={() => {
                  setIsFocused(false);
                  setSearchQuery(product.name);
                  router.push(`/homepage/products/${product.productId}`);
                }}
              >
                <Image
                  src={product.imageUrls?.[0] || "/product.png"}
                  alt={product.name || "Product image"}
                  className="h-12 w-12 rounded object-contain"
                  height={48}
                  width={48}
                />
                <div>{product.name}</div>
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

export default UsedSearchBar;
