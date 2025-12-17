"use client";

import {
  addToCart,
  CartItem,
  clearCart,
  deleteFromCart,
  Product,
  removeFromCart,
  setCartData,
} from "@/redux/slices/cartSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosAuthInstance } from "../axiosInstance";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { getUserFromCookies } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import { Button, buttonVariants } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import LoadingContent from "./LoadingContent";
import { IoAdd } from "react-icons/io5";
import { GrFormSubtract } from "react-icons/gr";
import { DialogTitle } from "@radix-ui/react-dialog";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";

/* ===================== HELPERS ===================== */
const round2 = (num: number) => Math.round(num * 100) / 100;

/* ===================== COMPONENT ===================== */
const CartModal: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { setIsLoginModalOpen } = useModal();
  const [isLoading, setIsLoading] = useState(true);

  const items = useSelector((state: RootState) => state.cart.items);
  const user = getUserFromCookies();

  /* ===================== FETCH CART ===================== */
  const fetchCartData = () => {
    if (!user) return setIsLoading(false);

    setIsLoading(true);
    axiosAuthInstance()
      .get("/api/cart/")
      .then(res => dispatch(setCartData(res.data)))
      .catch(err => console.error("Error fetching cart", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  /* ===================== UPDATE QUANTITY ===================== */
  const updateQuantity = async (item: CartItem, newQty: number) => {
    if (!user) {
      toast.info("Please log in to manage your cart.");
      return;
    }

    if (item.stock !== undefined && newQty > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    const existingItem = items.find(i => i.productId === item.productId);

    /* ===== REMOVE ===== */
    if (newQty <= 0) {
      dispatch(deleteFromCart(item.productId));

      try {
        await axiosAuthInstance().delete("/api/cart/remove", {
          params: { productId: item.productId },
        });
      } catch {
        toast.error("Failed to remove item");
      }
      return;
    }

    /* ===== REDUX DIFF UPDATE ===== */
    const diff = newQty - item.quantities;

    if (diff > 0) {
      const productForCart: Product = {
        productId: item.productId,
        name: item.names,
        description: "",
        price: round2(item.prices),
        discountedPrice: round2(item.prices),
        discountPercentage: item.discountPercentage,
        discountPrice: round2(item.discountPrice),
        imageUrls: item.imageUrls || [],
        rating: item.rating,
        stock: item.stock,
        quantities: diff,
        wishlistId: null,
      };
      dispatch(addToCart(productForCart));
    }

    if (diff < 0) {
      dispatch(removeFromCart(item.productId));
    }

    /* ===== BACKEND ===== */
    try {
      if (existingItem?.itemId) {
        await axiosAuthInstance().post("/api/cart/update", {
          itemId: existingItem?.itemId,
          quantity: newQty,
        });
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  /* ===================== REMOVE ITEM ===================== */
  const removeItem = async (productId: string) => {
    dispatch(deleteFromCart(productId));
    try {
      await axiosAuthInstance().delete("/api/cart/remove", {
        params: { productId },
      });
    } catch {
      toast.error("Failed to remove item");
    }
  };

  /* ===================== CLEAR CART ===================== */
  const clearCartItems = async () => {
    dispatch(clearCart());
    try {
      await axiosAuthInstance().post("/api/cart/clear");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  /* ===================== PRICE LOGIC ===================== */
  const formatPrice = (price: number) => round2(price).toFixed(0);

  const discountedPrice = (item: CartItem) =>
    round2(item.prices - ((item.discountPercentage || 0) * item.prices) / 100);

  const subtotal = (item: CartItem) =>
    round2(discountedPrice(item) * item.quantities);

  const total = () =>
    round2(items.reduce((sum, item) => sum + subtotal(item), 0));

  /* ===================== UI ===================== */
  return (
    <div>
      <Sheet>
        {user ? (
          <SheetTrigger asChild>
            <div className="relative cursor-pointer" onClick={fetchCartData}>
              <FaCartShopping className="size-6 text-blue-600" />
              {items.length > 0 && (
                <span className="absolute w-5 h-5 bg-white border rounded-full text-xs -top-3 -right-3 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </div>
          </SheetTrigger>
        ) : (
          <button onClick={() => setIsLoginModalOpen(true)}>
            <FaCartShopping className="size-6 text-blue-600" />
          </button>
        )}

        <SheetContent className="overflow-y-scroll">
          <SheetHeader>
            <DialogTitle className="text-xl font-semibold">
              Your Shopping Cart 
            </DialogTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <div>
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p>Your cart is empty</p>
                  <Link
                    href="/homepage/products"
                    className={cn(buttonVariants(), "mt-4")}
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <Button variant="outline" onClick={clearCartItems}>
                      Clear Cart
                    </Button>
                  </div>

                  {isLoading ? (
                    <LoadingContent />
                  ) : (
                    items.map(item => (
                      <div
                        key={item.productId}
                        className="flex gap-3 border-b py-3"
                      >
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${item.imageUrls?.[0]}`}
                          alt={item.names}
                          width={80}
                          height={80}
                        />

                        <div className="flex-grow">
                          <p className="font-medium">{item.names}</p>
                          <p>
                            Rs.{formatPrice(discountedPrice(item))} ×{" "}
                            {item.quantities}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateQuantity(item, item.quantities - 1)
                              }
                            >
                              <GrFormSubtract />
                            </Button>

                            <span>{item.quantities}</span>

                            <Button
                              size="sm"
                              onClick={() =>
                                updateQuantity(item, item.quantities + 1)
                              }
                            >
                              <IoAdd />
                            </Button>
                          </div>

                          <p className="mt-1 text-sm">
                            Subtotal: Rs.{formatPrice(subtotal(item))}
                          </p>

                          <Button
                            variant="outline"
                            className="mt-2 text-red-500"
                            onClick={() => removeItem(item.productId)}
                          >
                            <MdDelete /> Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="mt-4 border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>Rs.{formatPrice(total())}</span>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() => router.push("/checkout")}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CartModal;
