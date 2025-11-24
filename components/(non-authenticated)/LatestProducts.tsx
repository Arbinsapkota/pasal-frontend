"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { IoMdAdd, IoIosArrowRoundForward } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { GoHeartFill } from "react-icons/go";
import { MdOutlineStar } from "react-icons/md";
import { PiBagFill } from "react-icons/pi";

import { RootState } from "@/redux/store";
import {
  addToCart,
  removeFromCart,
  deleteFromCart,
} from "@/redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlistSlice";
import ProductCardLoading from "../loaidng/ProductLoading";
import { Button } from "../ui/button";
import { axiosAuthInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { cn } from "@/lib/utils";

// --- Custom Hooks/Helpers ---

const formatPrice = (price: number) => {
  const formatted = price.toFixed(2);
  if (formatted.endsWith(".00")) {
    return Math.floor(price).toString();
  }
  return formatted;
};

const calculateDiscount = (
  price: number,
  discountedPrice?: number,
  discountPercentage?: number
) => {
  if (discountPercentage) return discountPercentage;
  if (discountedPrice && price > discountedPrice)
    return Math.round(((price - discountedPrice) / price) * 100);
  return 0;
};

const formatCategory = (product: any) => {
  return product.category?.name || "Produce";
};

const formatRating = (product: any) => {
  return (product.rating || 4.9).toFixed(1);
};

// --- Main Component ---

const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = getUserFromCookies();

  const fetchProducts = async () => {
    try {
      // Fetch more products to fill the carousel nicely
      const res = await axiosAuthInstance().get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/?limit=20`
      );
      setProducts(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Cart Handlers ---

  // Note: The original implementation in the prompt was manual.
  // I'm simplifying the logic by using the Redux actions (assuming increaseQuantity/decreaseQuantity exist in cartSlice).

  const handleUpdateCart = (
    product: any,
    type: "ADD" | "INCREASE" | "DECREASE"
  ) => {
    if (!user) {
      toast.info("Please log in to manage your cart.");
      // Optionally, you might open a login modal here
      return;
    }

    const existingItem = items.find(
      (item) => item.productId === product.productId
    );

    if (type === "ADD" || type === "INCREASE") {
      dispatch(addToCart(product));
      const newQuantity = existingItem ? existingItem.quantities + 1 : 1;

      axiosAuthInstance()
        .post("/api/cart/add", {
          productId: product.productId,
          quantity: newQuantity,
        })
        .catch(() => toast.error("Failed to update cart (API error)."));
    } else if (type === "DECREASE") {
      if (existingItem && existingItem.quantities > 1) {
        dispatch(removeFromCart(product.productId));
        const newQuantity = existingItem.quantities - 1;

        axiosAuthInstance()
          .post("/api/cart/add", {
            productId: product.productId,
            quantity: newQuantity,
          })
          .catch(() => toast.error("Failed to update cart (API error)."));
      } else if (existingItem && existingItem.quantities === 1) {
        dispatch(deleteFromCart(product.productId));
        axiosAuthInstance()
          .delete("/api/cart/", { data: { productId: product.productId } })
          .catch(() => toast.error("Failed to remove from cart (API error)."));
      }
    } else if (type === "REMOVE") {
      dispatch(deleteFromCart(product.productId));
      axiosAuthInstance()
        .delete("/api/cart/", { data: { productId: product.productId } })
        .catch(() => toast.error("Failed to remove from cart (API error)."));
    }
  };

  const toggleWishlist = (product: any) => {
    if (!user) {
      toast.info("Please log in to manage your wishlist.");
      return;
    }

    const isAdded = wishlistItems.some(
      (item) => item.productId === product.productId
    );
    if (isAdded) {
      dispatch(removeFromWishlist(product.productId));
      axiosAuthInstance()
        .delete("/api/wishlist/", { params: { productId: product.productId } })
        .catch(() => {});
    } else {
      dispatch(addToWishlist(product));
      axiosAuthInstance()
        .post("/api/wishlist/", { product: { productId: product.productId } })
        .catch(() => {});
    }
  };

  // --- Premium Product Card Renderer ---
  const renderPremiumProductCard = (product: any) => {
    const discount = calculateDiscount(
      product.price,
      product.discountedPrice,
      product.discountPercentage
    );
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === product.productId
    );
    const cartItem = items.find((item) => item.productId === product.productId);
    const currentQuantity = cartItem ? cartItem.quantities : 0;
    const finalPrice = product.discountedPrice || product.price;

    return (
      <Link
        href={`/homepage/products/${product.productId}`}
        key={product.productId}
        // Premium Styling: Shadow lift on hover, slightly darker background
        className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative block h-full"
      >
        {/* Image and Overlays */}
        <div className="relative aspect-square w-full p-4 flex justify-center items-center overflow-hidden">
          <Image
            src={
              `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}` ||
              "/placeholder.png"
            }
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full z-10">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist Button (Sleek, subtle design) */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={cn(
              "absolute top-4 right-4 p-2 w-auto h-auto rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 transition-opacity duration-300 z-10",
              isInWishlist ? "text-red-500" : "text-gray-500 hover:text-red-500"
            )}
          >
            <GoHeartFill className="text-lg" />
          </Button>
        </div>

        {/* Product Details Section */}
        <div className="p-4 pt-0">

          {/* Name (Title) */}
          <h3 className="text-xl ">
            {product.name}
          </h3>

          {/* Price and Action */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-2xl">
                Rs.{formatPrice(finalPrice)}
              </span>
           
            </div>

            {/* Add/Quantity Control (Sleek, conditional display) */}
            {currentQuantity > 0 ? (
              <div className="flex items-center border border-teal-600 rounded-lg overflow-hidden h-9">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUpdateCart(product, "DECREASE");
                  }}
                  className="p-1 w-8 h-8 bg-white text-teal-600 hover:bg-teal-50 rounded-r-none"
                >
                  <RiSubtractFill className="text-sm" />
                </Button>
                <span className="w-6 text-center text-sm font-bold text-teal-700">
                  {currentQuantity}
                </span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUpdateCart(product, "INCREASE");
                  }}
                  className="p-1 w-8 h-8 bg-white text-teal-600 hover:bg-teal-50 rounded-l-none"
                  // Assuming stock check is needed
                  disabled={currentQuantity >= (product.stock || 999)}
                >
                  <IoMdAdd className="text-sm" />
                </Button>
              </div>
            ) : (
              // Default Add to Cart button
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpdateCart(product, "ADD");
                }}
                className="w-auto h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
              >
                <PiBagFill className="text-base" />
                <span className="text-sm">Add</span>
              </Button>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="mx-auto px-4 py-14">
      {/* Section Header */}
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-sm font-medium text-purple-500 tracking-widest uppercase">
          Featured Picks
        </span>

        <div className="flex justify-between items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Today’s Best Deals <span className="text-teal-600">For You</span>
          </h2>

          <Link href="/homepage/products">
            <Button
              className="rounded-xl
          hover:opacity-90 text-white px-6 py-2.5 text-sm font-medium shadow-md transition flex items-center gap-1"
            >
              View All Products
              <IoIosArrowRoundForward className="text-2xl" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[48%] sm:min-w-[30%] md:min-w-[22%] lg:min-w-[18%]"
            >
              <ProductCardLoading />
            </div>
          ))}
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
            loop: true,
            breakpoints: {
              "(min-width: 640px)": { slidesToScroll: 2 },
              "(min-width: 1024px)": { slidesToScroll: 3 },
              "(min-width: 1280px)": { slidesToScroll: 4 },
            },
          }}
          className="w-full"
        >
          <CarouselContent className="py-2">
            {products.map((product) => (
              <CarouselItem
                key={product.productId}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition p-3">
                  {renderPremiumProductCard(product)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex left-3 bg-white border border-gray-300 rounded-full w-10 h-10 shadow-sm hover:bg-gray-100 text-purple-600" />
          <CarouselNext className="hidden md:flex right-3 bg-white border border-gray-300 rounded-full w-10 h-10 shadow-sm hover:bg-gray-100 text-purple-600" />
        </Carousel>
      )}
    </div>
  );
};

export default LatestProducts;
