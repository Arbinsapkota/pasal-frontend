"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { GoHeartFill } from "react-icons/go";
import { PiBagFill } from "react-icons/pi";
import { IoIosArrowRoundForward } from "react-icons/io";

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

// Helpers
const formatPrice = (price: number) => {
  const formatted = price.toFixed(2);
  return formatted.endsWith(".00") ? Math.floor(price).toString() : formatted;
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

const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const user = getUserFromCookies();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosAuthInstance().get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/?limit=20`
        );
        setProducts(res.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // CART HANDLERS
  const handleUpdateCart = (
    product: any,
    type: "ADD" | "INCREASE" | "DECREASE"
  ) => {
    if (!user) {
      toast.info("Please log in to manage your cart.");
      return;
    }

    const existingItem = items.find((i) => i.productId === product.productId);

    if (type === "ADD" || type === "INCREASE") {
      dispatch(addToCart(product));
      const newQty = existingItem?.quantities ? existingItem.quantities + 1 : 1;

      axiosAuthInstance()
        .post("/api/cart/add", {
          productId: product.productId,
          quantity: newQty,
        })
        .catch(() => {});
    }

    if (type === "DECREASE") {
      if (existingItem?.quantities && existingItem.quantities > 1) {
        dispatch(removeFromCart(product.productId));

        axiosAuthInstance()
          .post("/api/cart/add", {
            productId: product.productId,
            quantity: existingItem.quantities - 1,
          })
          .catch(() => {});
      } else {
        dispatch(deleteFromCart(product.productId));

        axiosAuthInstance()
          .delete("/api/cart/", { data: { productId: product.productId } })
          .catch(() => {});
      }
    }
  };

  // WISHLIST
  const toggleWishlist = (product: any, e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please log in first.");
      return;
    }

    const isLiked = wishlistItems.some(
      (i) => i.productId === product.productId
    );

    if (isLiked) {
      dispatch(removeFromWishlist(product.productId));
      axiosAuthInstance()
        .delete("/api/wishlist/", {
          params: { productId: product.productId },
        })
        .catch(() => {});
    } else {
      dispatch(addToWishlist(product));
      axiosAuthInstance()
        .post("/api/wishlist/", {
          product: { productId: product.productId },
        })
        .catch(() => {});
    }
  };

  // ----------------------
  //  REFINED PRODUCT CARD
  // ----------------------
  const ProductCard = ({ product }: any) => {
    const discount = calculateDiscount(
      product.price,
      product.discountedPrice,
      product.discountPercentage
    );

    const finalPrice = product.discountedPrice || product.price;

    const cartItem = items.find((c) => c.productId === product.productId);
    const qty = cartItem ? cartItem.quantities : 0;

    const isLiked = wishlistItems.some(
      (i) => i.productId === product.productId
    );

    return (
      <Link
  href={`/homepage/products/${product.productId}`}
  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 block border border-gray-100 hover:border-orange-100"
>
  {/* IMAGE CONTAINER */}
  <div className="relative w-full aspect-[5/5] overflow-hidden bg-gray-50">
    <Image
      src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}`}
      alt={product.name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
    />

    {/* DISCOUNT BADGE */}
    {discount > 0 && (
      <div className="absolute top-3 left-3">
        <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
          {discount}% OFF
        </span>
      </div>
    )}

    {/* WISHLIST BUTTON */}
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product, e); // now works properly
      }}
      className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
        isLiked
          ? "bg-red-500 text-white"
          : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
      }`}
    >
      <GoHeartFill className="text-lg" />
    </button>
  </div>

  {/* CONTENT */}
  <div className="p-4">
    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-700 transition-colors">
      {product.name}
    </h3>

    {/* PRICE */}
    <div className="flex items-center gap-2 mt-2">
      <span className="text-lg font-bold text-gray-900">
        NRS {formatPrice(finalPrice)}
      </span>
      {discount > 0 && (
        <span className="text-sm text-gray-500 line-through">
          NRS {formatPrice(product.price)}
        </span>
      )}
    </div>

    {/* CART CONTROLS */}
    {qty > 0 ? (
      <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl mt-3 px-3 py-2">
        
        {/* DECREASE */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUpdateCart(product, "DECREASE");
          }}
          className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
        >
          <RiSubtractFill className="text-lg" />
        </button>

        <span className="font-bold text-orange-700 min-w-[20px] text-center">
          {qty}
        </span>

        {/* INCREASE */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUpdateCart(product, "INCREASE");
          }}
          className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
        >
          <IoMdAdd className="text-lg" />
        </button>
      </div>
    ) : (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleUpdateCart(product, "ADD");
        }}
        className="w-full mt-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <PiBagFill className="text-lg" />
        Add to Cart
      </button>
    )}
  </div>
</Link>

    );
  };

  return (
    <section className="mx-auto  px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl sm:text-3xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Today's Best Deals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              For You
            </span>
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Discover amazing products at unbeatable prices
          </p>
        </div>

        <Link href="/homepage/products" className="flex-shrink-0">
          <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200">
            View All
            <IoIosArrowRoundForward className="text-xl" />
          </Button>
        </Link>
      </div>

      {/* PRODUCTS CAROUSEL */}
      {isLoading ? (
        <div className="bottom-20 flex gap-6 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="min-w-[280px] flex-shrink-0">
              <ProductCardLoading />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((p: any) => (
                <CarouselItem
                  key={p.productId}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                >
                  <div className="h-full">
                    <ProductCard product={p} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* CAROUSEL NAVIGATION */}
            <CarouselPrevious className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
            <CarouselNext className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default LatestProducts;
