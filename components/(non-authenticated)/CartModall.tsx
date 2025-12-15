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

const CartModal: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { setIsLoginModalOpen } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const items = useSelector((state: RootState) => state.cart.items);
  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  useEffect(() => setAllItems(items), [items]);

  const fetchCartData = () => {
    if (user) {
      setIsLoading(true);
      axiosAuthInstance()
        .get("/api/cart/")
        .then(res => dispatch(setCartData(res.data)))
        .catch(err => console.error("Error fetching Cart Items", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => fetchCartData(), [isModalOpen]);

  // ------------------------------
  // Centralized update function
  const updateQuantity = (product: CartItem, newQuantity: number) => {
    const existingItem = allItems.find(item => item.productId === product.productId);

    // Update local state
    let updatedItems;
    if (newQuantity <= 0) {
      updatedItems = allItems.filter(item => item.productId !== product.productId);
      dispatch(deleteFromCart(product.productId));
    } else {
      updatedItems = allItems.map(item =>
        item.productId === product.productId ? { ...item, quantities: newQuantity } : item
      );
      const productForCart: Product = {
        productId: product.productId,
        name: product.names,
        description: "",
        price: product.prices,
        discountedPrice: product.prices,
        imageUrls: product.imageUrls || [],
        rating: product.rating,
        discountPercentage: product.discountPercentage,
        discountPrice: product.discountPrice,
        stock: product.stock,
        quantities: product.quantities,
        wishlistId: product.wishlistId || null
      };
      dispatch(addToCart(productForCart));
    }
    setAllItems(updatedItems);

    // Backend update
    if (user && existingItem) {
      axiosAuthInstance()
        .post("/api/cart/update", { itemId: existingItem.itemId, quantity: newQuantity })
        .catch(() => toast.error("Failed to update cart"));
    }
  };

  const removeItem = (productId: string) => {
    const existingItem = allItems.find(item => item.productId === productId);
    if (!existingItem) return;

    setAllItems(allItems.filter(item => item.productId !== productId));
    dispatch(deleteFromCart(productId));

    if (user) {
      axiosAuthInstance().delete(`/api/cart/remove?productId=${productId}`).catch(console.error);
    }
  };

  const clearCartItems = () => {
    dispatch(clearCart());
    setIsModalOpen(false);
    if (user) {
      axiosAuthInstance().post("/api/cart/clear").catch(console.error);
    }
  };

  const formatPrice = (price: number) => price.toFixed(2);

  const calculateDiscountedPrice = (item: CartItem) =>
    item.prices - ((item.discountPercentage || 0) * item.prices) / 100;

  const calculateSubtotal = (item: CartItem) =>
    calculateDiscountedPrice(item) * item.quantities;

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  return (
    <div className="hover:cursor-pointer">
      <Sheet>
        {user ? (
          <SheetTrigger asChild>
            <div className="relative" onClick={fetchCartData}>
              <FaCartShopping className="size-6 hover:text-primaryBlue text-blue-600" />
              {items.length > 0 && (
                <span className="absolute w-5 h-5 bg-white text-[#0037c8] border border-gray-400 rounded-full px-2 mt-1.5 text-xs -top-4 -right-3 flex items-center justify-center">
                  {items.length > 10 ? "+9" : items.length}
                </span>
              )}
            </div>
          </SheetTrigger>
        ) : (
          <button onClick={() => setIsLoginModalOpen(true)} type="button" className="relative">
            <FaCartShopping className="size-6 hover:text-primaryBlue text-blue-600" />
          </button>
        )}

        <SheetContent className="h-full overflow-y-scroll">
          <SheetHeader>
            <DialogTitle className="font-semibold text-xl flex justify-start">Your Shopping Cart</DialogTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <div>
              {items.length === 0 ? (
                <div className="text-center">
                  <i className="fa-solid fa-shopping-cart text-4xl py-10"></i>
                  <p className="text-lg">Your cart is empty</p>
                  <Link className={cn(buttonVariants(), "mt-4 w-full")} href={"/homepage/products"}>
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="w-full flex justify-end my-1">
                    <Button variant="outline" onClick={clearCartItems} className="flex items-center gap-2 hover:text-destructive">
                      <p>Clear Cart</p>
                      <MdDelete className="size-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-6 mt-3">
                    <div className="flex-grow overflow-y-auto sm:h-[390px] h-[590px] scrollbar-thin border rounded-md">
                      {isLoading ? (
                        <LoadingContent className="h-40 w-full" />
                      ) : (
                        items.map((item, index) => (
                          <div key={index} className="flex items-start sm:gap-4 gap-2 border-b border-gray-200 py-4 sm:px-2 px-1 hover:bg-gray-50 rounded-md transition-all">
                            <Image
                              src={
                                item.imageUrls?.length
                                  ? `${NEXT_PUBLIC_CLOUDINARY_URL}${item.imageUrls[0]}`
                                  : "/placeholder-image.png"
                              }
                              alt={item.names || "Product image"}
                              width={100}
                              height={100}
                              style={{ objectFit: "contain" }}
                              className="sm:h-20 h-16 sm:w-28 cursor-pointer"
                              onClick={() => router.push(`/homepage/products/${item.productId}`)}
                            />

                            <div className="flex flex-col flex-grow justify-between">
                              <h3 className="sm:text-lg text-sm font-semibold text-gray-700 mb-1 line-clamp-2 text-wrap">{item.names}</h3>

                              <div className="flex items-center gap-1.5">
                                <p className="text-sm text-primaryBlue font-semibold">
                                  Rs.{formatPrice(calculateDiscountedPrice(item))}
                                </p>
                                {item.discountPercentage > 0 && (
                                  <p className="text-sm font-medium text-gray-500 line-through">
                                    Rs.{formatPrice(item.prices)}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    className="rounded-r-none border-r-0 text-xs sm:px-2 px-1 sm:w-8 sm:h-auto h-6"
                                    onClick={() => updateQuantity(item, item.quantities - 1)}
                                  >
                                    <GrFormSubtract />
                                  </Button>

                                  <div className={cn(buttonVariants({ variant: "outline" }), "rounded-none text-xs text-center w-12 sm:px-2 px-1 sm:w-8 sm:h-auto h-6")}>
                                    {item.quantities}
                                  </div>

                                  <Button
                                    variant="outline"
                                    className="rounded-l-none border-l-0 text-xs sm:px-2 px-1 sm:w-8 sm:h-auto h-6 text-black"
                                    onClick={() => updateQuantity(item, item.quantities + 1)}
                                    disabled={item.quantities >= (item.stock ?? 0)}
                                  >
                                    <IoAdd />
                                  </Button>
                                </div>

                                <p className="text-sm text-gray-500">Subtotal: Rs.{formatPrice(calculateSubtotal(item))}</p>
                              </div>

                              <Button
                                variant="outline"
                                className="mt-3 px-2 py-1 w-fit text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2 text-sm"
                                onClick={() => removeItem(item.productId)}
                              >
                                <MdDelete size={18} /> Remove
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="w-full">
                      <div className="bg-gray-50 rounded-lg pt-2 sticky top-0">
                        <div className="space-y-3 px-2">
                          <div className="flex justify-between items-center text-gray-800">
                            <p className="text-lg font-medium">Items ({items.length})</p>
                            <p className="text-lg font-semibold">Rs.{formatPrice(calculateTotal())}</p>
                          </div>

                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center text-gray-800">
                              <p className="text-lg font-medium">Total</p>
                              <p className="text-lg font-medium">Rs.{formatPrice(calculateTotal())}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Button onClick={() => { router.push("/checkout"); setIsModalOpen(false); }} className="w-full">
                            Proceed to Checkout
                          </Button>
                        </div>
                      </div>
                    </div>
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
