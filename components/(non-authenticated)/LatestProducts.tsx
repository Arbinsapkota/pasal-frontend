"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { GoHeartFill } from "react-icons/go";
import { PiBagFill } from "react-icons/pi";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoStar } from "react-icons/io5";
import { FaTag } from "react-icons/fa";

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
import { useRouter } from "next/navigation";

// -------------------- HOOK FOR CART & WISHLIST --------------------
const useCartWishlist = () => {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = getUserFromCookies();

  // CART HANDLER
  const updateCart = async (
    product: any,
    type: "ADD" | "INCREASE" | "DECREASE"
  ) => {
    if (!user) return toast.info("Please log in to manage your cart.");
    if (product.stock === 0) return toast.error("Product is out of stock!");

    const existingItem = items.find((i) => i.productId === product.productId);
    const currentQty = existingItem?.quantities || 0;
    const newQty =
      type === "ADD"
        ? 1
        : type === "INCREASE"
        ? currentQty + 1
        : currentQty - 1;

    if (newQty > product.stock)
      return toast.error(`Only ${product.stock} items available!`);

    try {
      const productForCart = {
        productId: product.productId,
        name: product.name,
        description: product.description || "",
        price: product.price,
        discountedPrice: product.discountedPrice || product.price,
        discountPercentage: product.discountPercentage || 0,
        imageUrls: product.imageUrls || [],
        rating: product.rating || 4.0,
        stock: product.stock,
        quantities: 1,
        wishlistId: product.wishlistId || null,
        variableNo: product.variableNo,
      };

      // REDUX UPDATE
      if (type === "ADD" || type === "INCREASE")
        dispatch(addToCart(productForCart));
      if (type === "DECREASE") {
        if (newQty <= 0) dispatch(deleteFromCart(product.productId));
        else dispatch(removeFromCart(product.productId));
      }

      // BACKEND CALL
      if (type === "ADD" || type === "INCREASE") {
        await axiosAuthInstance().post("/api/cart/add", {
          products: { productId: product.productId },
          quantity: 1,
        });
      }
      if (type === "DECREASE" && existingItem?.itemId) {
        if (newQty > 0) {
          await axiosAuthInstance().post("/api/cart/update", {
            itemId: existingItem.itemId,
            quantity: newQty,
          });
        } else {
          await axiosAuthInstance().delete("/api/cart/remove", {
            params: { productId: product.productId },
          });
        }
      }
    } catch (error) {
      console.error("Cart update error:", error);
      toast.error("Failed to update cart. Please try again.");
    }
  };

  // WISHLIST HANDLER
  const toggleWishlist = async (product: any) => {
    if (!user) return toast.info("Please log in first.");
    const isLiked = wishlistItems.some(
      (i) => i.productId === product.productId
    );

    try {
      if (isLiked) {
        dispatch(removeFromWishlist(product.productId));
        await axiosAuthInstance().delete("/api/wishlist/", {
          params: { productId: product.productId },
        });
        toast.success("Removed from wishlist");
      } else {
        dispatch(addToWishlist(product));
        await axiosAuthInstance().post("/api/wishlist/", {
          product: { productId: product.productId },
        });
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist.");
    }
  };

  return { items, wishlistItems, updateCart, toggleWishlist };
};

// -------------------- PRODUCT CARD --------------------
interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { items, wishlistItems, updateCart, toggleWishlist } =
    useCartWishlist();

  const cartItem = items.find((c) => c.productId === product.productId);
  const qty = cartItem ? cartItem.quantities : 0;

  // ---- FIXED DISCOUNT LOGIC ----
  const discountAmount =
    product.discountPercentage && product.discountPercentage > 0
      ? (product.price * product.discountPercentage) / 100
      : product.discountedPrice && product.discountedPrice < product.price
      ? product.price - product.discountedPrice
      : 0;

  const priceAfterDiscount = product.price - discountAmount;
  const totalPrice = qty * priceAfterDiscount;

  const discountPercentDisplay =
    product.discountPercentage && product.discountPercentage > 0
      ? product.discountPercentage
      : discountAmount > 0
      ? Math.round((discountAmount / product.price) * 100)
      : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <IoStar
          key={i}
          className={`w-3 h-3 ${
            i < fullStars ? "text-orange-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const isLiked = wishlistItems.some((i) => i.productId === product.productId);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-100">
      <Link href={`/homepage/products/${product.productId}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50 h-40">
          {product.imageUrls?.[0] ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}`}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {discountPercentDisplay > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-md shadow-md">
                Save {discountPercentDisplay}%
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-sm mb-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <FaTag className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 ml-1">
                {product.subcategoryName || "General"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(product.rating || 4.0)}
              <span className="text-xs text-gray-500 ml-1">
                ({(product.rating || 4.0).toFixed(1)})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              Rs {Math.round(priceAfterDiscount)}
            </span>
            {discountAmount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                Rs {Math.round(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-lg z-10 transition-all duration-200 ${
          isLiked
            ? "bg-red-500 text-white"
            : "bg-white text-gray-600 hover:text-red-500"
        }`}
      >
        <GoHeartFill className="text-lg" />
      </button>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCart(product, "DECREASE")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            >
              <RiSubtractFill className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">
              {qty}
            </span>
            <button
              onClick={() => updateCart(product, "INCREASE")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            >
              <IoMdAdd className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-base font-bold text-gray-900">
              Rs {Math.round(totalPrice)}
            </span>
          </div>
        </div>

        <button
          onClick={() => updateCart(product, "ADD")}
          className="w-full py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-sm hover:shadow-md"
        >
          <PiBagFill className="text-lg" /> Add To Cart
        </button>
      </div>
    </div>
  );
});

// -------------------- MAIN COMPONENT --------------------
const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosAuthInstance().get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/?limit=5`
        );
        setProducts(res.data);
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const handleClick = () => {
    router.push("/homepage/products");
  };
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Today's Best Deals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              For You
            </span>
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Discover amazing products at unbeatable prices
          </p>
        </div>
        <div onClick={handleClick}>
          <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200">
            View All
            <IoIosArrowRoundForward className="text-xl" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="min-w-[280px] flex-shrink-0">
              <ProductCardLoading />
            </div>
          ))}
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.slice(0, 5).map((p) => (
              <CarouselItem
                key={p.productId}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
          <CarouselNext className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
        </Carousel>
      )}
    </section>
  );
};

export default LatestProducts;
