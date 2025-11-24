"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import { IoMdAdd, IoIosArrowRoundForward } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { GoHeartFill } from "react-icons/go";
import { MdOutlineStar } from "react-icons/md";
import { PiBagFill } from "react-icons/pi"; // Using a bag icon for the "Add" button


import { RootState } from "@/redux/store";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/redux/slices/wishlistSlice";
import ProductCardLoading from "../loaidng/ProductLoading";
import { Button } from "../ui/button";
import { axiosAuthInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { cn } from "@/lib/utils";

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allItems, setAllItems] = useState<any[]>([]);
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = getUserFromCookies();

  // Helper function to format price:
  // 1. Ensures it's a string representation of the number.
  // 2. Removes the trailing ".00" for whole numbers (e.g., 10.00 -> 10).
  const formatPrice = (price: number) => {
    const formatted = price.toFixed(2);
    if (formatted.endsWith('.00')) {
        return Math.floor(price).toString();
    }
    return formatted;
  };

  useEffect(() => {
    setAllItems(items);
  }, [items]);

  const fetchProducts = async () => {
    try {
      // Limiting to 15 products for a larger carousel display
      const res = await axiosAuthInstance().get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/?limit=15`); 
      setProducts(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCartHandler = (product: any) => {
    const existingItem = allItems.find((item) => item.productId === product.productId);
    let updatedItems;

    if (existingItem) {
      updatedItems = allItems.map((item) =>
        item.productId === product.productId
          ? { ...item, quantities: item.quantities + 1, totalPrice: item.totalPrice + product.price }
          : item
      );
    } else {
      updatedItems = [...allItems, { ...product, quantities: 1, totalPrice: product.price }];
    }

    setAllItems(updatedItems);
    dispatch(addToCart(product));

    if (user) {
      axiosAuthInstance()
        .post("/api/cart/add", { products: { productId: product.productId }, quantity: existingItem ? existingItem.quantities + 1 : 1 })
        .catch(() => toast.error("Failed to add to cart"));
    }
  };

  const toggleWishlist = (product: any) => {
    const isAdded = wishlistItems.some((item) => item.productId === product.productId);
    if (isAdded) {
      dispatch(removeFromWishlist(product.productId));
      if (user) {
        axiosAuthInstance().delete("/api/wishlist/", { params: { productId: product.productId } }).catch(() => {});
      }
    } else {
      dispatch(addToWishlist(product));
      if (user) {
        axiosAuthInstance().post("/api/wishlist/", { product: { productId: product.productId } }).catch(() => {});
      }
    }
  };

  const calculateDiscount = (price: number, discountedPrice?: number, discountPercentage?: number) => {
    if (discountPercentage) return discountPercentage;
    if (discountedPrice) return Math.round(((price - discountedPrice) / price) * 100);
    return 0;
  };
  
  // Helper to format category
  const formatCategory = (product: any) => {
      return product.category?.name || 'Fruits'; 
  }
  
  // Helper to format rating
  const formatRating = (product: any) => {
      return (product.rating || 4.8).toFixed(1);
  }

  // --- Layout and Functionality ---
  
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Products Header Section */}
      <div className="flex flex-col mb-6">
        <h3 className="text-xl font-medium text-gray-700">Products</h3>
        <div className="flex justify-between items-center mt-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Featured <span className="text-green-700">Products</span>
          </h2>
          <Link href="/homepage/products" passHref>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white rounded-full px-4 py-2 flex items-center gap-1"
            >
              View All Products <IoIosArrowRoundForward className="text-2xl" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Product Carousel Section */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[180px] sm:min-w-[240px] md:min-w-[200px] lg:min-w-[240px] xl:min-w-[20%] flex-shrink-0">
              <ProductCardLoading />
            </div>
          ))}
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
          }}

          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {products.map((product) => {
              const discount = calculateDiscount(product.price, product.discountedPrice, product.discountPercentage);
              const isInWishlist = wishlistItems.some((item) => item.productId === product.productId);

              return (
                // Displays 5 items per row on 'xl' screens (desktop)
                <CarouselItem 
                    key={product.productId} 
                    className="pl-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg transition-shadow duration-300 relative">
                    
                    {/* Image and Overlays */}
                    <div className="relative aspect-square w-full p-4 flex justify-center items-center">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}` || "/placeholder.png"}
                        alt={product.name}
                        className="object-contain w-full h-full"
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-4 left-4 bg-green-700 text-white px-3 py-1 text-sm font-semibold rounded-lg">
                          {discount}% off
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <Button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                        className={cn(
                          "absolute top-4 right-4 p-2 w-auto h-auto rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors",
                          isInWishlist ? "text-red-500" : "text-gray-400" 
                        )}
                      >
                        <GoHeartFill className="text-lg" />
                      </Button>
                    </div>

                    {/* Product Details Section */}
                    <div className="p-4 pt-0">
                      
                      {/* Category and Rating */}
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-green-700 font-medium">{formatCategory(product)}</span>
                        <div className="flex items-center gap-1">
                          <MdOutlineStar className="text-yellow-500 text-lg" />
                          <span className="font-semibold">{formatRating(product)}</span>
                        </div>
                      </div>

                      {/* Name (Title) */}
                      <h3 className="text-lg font-bold truncate text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      
                      {/* Price and Add Button */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                          {/* UPDATED: Changed ₹ to Rs. */}
                          <span className="text-xl font-bold text-gray-800">
                            Rs.{formatPrice(product.discountedPrice || product.price)}
                          </span>
                          {product.discountedPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              Rs.{formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        
                        {/* Add to Cart Button (Small size) */}
                        <Button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCartHandler(product); }}
                          className="w-auto h-auto p-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <PiBagFill className="text-base" />
                          <span className="text-xs font-semibold">Add</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {/* Carousel Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      )}
    </div>
  );
};

export default FeaturedProducts;