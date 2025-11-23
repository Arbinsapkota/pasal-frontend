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
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosAuthInstance } from "../axiosInstance";
// import { CartItem } from "../types/cartitems";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
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

const CartModal: React.FC = () => {
  const dispatch = useDispatch();

  // const { cart,  } = useCart();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsLoginModalOpen } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const items = useSelector((state: RootState) => state.cart.items);

  const userDetails = getUserFromCookies();

  // -----------------
  const fetchCartData = () => {
    try {
      if (userDetails) {
        axiosAuthInstance()
          .get("/api/cart/")
          .then(res => {
            dispatch(setCartData(res.data));
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Error fetching Cart Items", err);
            setIsLoading(false);
          });
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCartData();
  }, [isModalOpen]);
  // -------------------

  function clearCartItems() {
    dispatch(clearCart());
    setIsModalOpen(false);
    if (userDetails) {
      axiosAuthInstance()
        .post("/api/cart/clear")
        // .then(res => console.log(res.data))
        .catch(err => console.error("Error clearing cart", err));
    }
  }

  const handleCheckoutClick = () => {
    // Store selected items in the CheckoutProvider
    // cart.forEach((item) => {
    //   addItemToCheckout(item); // Add item to checkout
    // });

    // Proceed to checkout page
    router.push(`/checkout`);
    setIsModalOpen(false);
  };

  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  useEffect(() => {
    setAllItems(items); // Update local state when Redux state changes
  }, [items]);

  // mahendra
  const countApi = useCallback(
    useDebouncedCallback((product: any, quantity: Number) => {
      axiosAuthInstance()
        .post("/api/cart/update", {
          itemId: product?.itemId,
          quantity,
        })
        .catch(err => {
          toast.error("Failed to update to Cart");
        });
    }, 400),
    []
  );

  const wishlistApi = useDebouncedCallback(
    (product: Product, action: "add" | "remove") => {
      const endpoint = action === "add" ? "/api/wishlist/" : "/api/wishlist/";

      const payload =
        action === "add"
          ? { product: { productId: product.productId } }
          : { productId: product.productId };
      if (action === "add") {
        axiosAuthInstance()
          .post(endpoint, { product: { productId: product.productId } })
          .catch(err => {
            toast.error(`Error adding in favorite.`);
          });
      } else {
        axiosAuthInstance()
          .delete(endpoint, { params: { productId: product.productId } })
          .catch(err => {
            // toast.error(`Server has to be updated.`);
          });
      }
    }
  );

  const increaseCount = (product: Product) => {
    // Check if the product already exists in allItems
    const existingItem = allItems.find(
      item => item.productId === product.productId
    );

    const itemPrice = product.price;

    let updatedItems;
    if (existingItem) {
      // If the product exists, increase quantity and update the total price
      updatedItems = allItems.map(item =>
        item.productId === product.productId
          ? {
              ...item,
              quantities: item.quantities + 1,
              totalPrice: item.totalPrice + itemPrice,
            }
          : item
      );
    } else {
      // If the product does not exist, add it to allItems
      updatedItems = [
        ...allItems,
        {
          discountPercentage: product.discountPercentage || 0,
          discountPrice: product.discountPrice || 0,
          productId: product.productId,
          names: product.name,
          quantities: 1,
          prices: itemPrice,
          totalPrice: itemPrice,
          imageUrls: product.imageUrls?.length ? [product.imageUrls[0]] : [],
          stock: product?.stock,
          rating: product.rating,
        },
      ];
    }
    // Update local state
    setAllItems(updatedItems);

    // Update Redux
    dispatch(addToCart(product));

    // Trigger API call if user is logged in mahendra
    if (user) {
      countApi(
        {
          ...product,
          itemId: existingItem?.itemId, // ensure we pass the itemId from the cart
        },
        existingItem ? existingItem.quantities + 1 : 1
      );
    }
  };

  const decreaseCount = (product: Product) => {
    const existingItem = allItems.find(
      item => item.productId === product.productId
    );

    if (existingItem) {
      if (existingItem.quantities === 1) {
        // Remove the item completely if quantity is 1
        setAllItems(
          allItems.filter(item => item.productId !== product.productId)
        );
        dispatch(removeFromCart(product.productId));

        // Call API to completely remove item
        if (user) {
          axiosAuthInstance()
            .delete(`/api/cart/remove?productId=${existingItem.productId}`)
            .catch(err => {
              // toast.error("Failed to Remove Item from Cart");
            });
        }
      } else {
        // Decrease quantity and update total price
        const updatedItems = allItems.map(item =>
          item.productId === product.productId
            ? {
                ...item,
                quantities: item.quantities - 1,
                totalPrice: item.totalPrice - item.prices,
              }
            : item
        );

        setAllItems(updatedItems);
        dispatch(removeFromCart(product.productId));

        if (user) {
          countApi(product, existingItem ? existingItem.quantities - 1 : 1);
        }
        // Update backend with new quantity
        if (user) {
          // Correctly pass the Product object
          if (user) {
            countApi(product, existingItem ? existingItem.quantities - 1 : 1);
          }
        }
      }
    }
  };

  const removeCount = (productId: string) => {
    const existingItem = allItems.find(item => item.productId === productId);
    if (existingItem) {
      // Remove the item completely if quantity is 1
      setAllItems(allItems.filter(item => item.productId !== productId));
      dispatch(deleteFromCart(productId));

      // Call API to completely remove item
      if (user) {
        axiosAuthInstance()
          .delete(`/api/cart/remove?productId=${existingItem.productId}`)
          .catch(err => {
            console.error("Failed to Remove Item from Cart", err);
          });
      }
    }
  };

  return (
    <div className="hover:cursor-pointer   ">
      <Sheet>
        <div>
          {user ? (
            <SheetTrigger asChild>
              <div className="relative" onClick={() => fetchCartData()}>
                <FaCartShopping className=" size-6 hover:text-primaryBlue text-blue-600" />

                {items.length > 0 && (
                  <span
                    className="absolute w-5 h-5  bg-white  text-[#0037c8] border border-gray-400 rounded-full px-2 mt-1.5 text-xs  -top-4 -right-3 flex items-center justify-center "
                    // style={{ minWidth: "1rem", height: "1rem" }}
                  >
                    {items.length > 10 ? "+9" : items.length}
                  </span>
                )}
              </div>
            </SheetTrigger>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              type="button"
              className="relative"
            >
              <FaCartShopping className=" size-6 hover:text-primaryBlue text-blue-600 " />
            </button>
          )}
        </div>
        <SheetContent className="h-full overflow-y-scroll">
          <SheetHeader>
            <DialogTitle className="font-semibold text-xl flex justify-start ">
              {" "}
              Your Shopping Cart
            </DialogTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <div className=" ">
              <div className=" ">
                {/* Modal Content */}
                <div className="">
                  {/* Modal Header */}

                  {/* Modal Body */}
                  {items.length === 0 ? (
                    <div className="text-center ">
                      <i className="fa-solid fa-shopping-cart text-4xl   py-10"></i>
                      <p className="text-lg ">Your cart is empty</p>
                      <Link
                        className={cn(buttonVariants(), "mt-4 w-full")}
                        href={"/homepage/products"}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="w-full h-full  flex justify-end my-1">
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            clearCartItems();
                          }}
                          className="flex  items-center gap-2 hover:text-destructive"
                        >
                          <p className="">Clear Cart</p>
                          <MdDelete className="size-5 " />
                        </Button>
                      </div>
                      <div className="flex flex-col   gap-6 mt-3">
                        {/* Cart Items List */}
                        <div className="flex-grow  overflow-y-auto sm:h-[390px] h-[590px] scrollbar-thin border rounded-md">
                          {isLoading ? (
                            <LoadingContent className="h-40 w-full" />
                          ) : (
                            items.map((item, index) => {
                              const product: Product = {
                                discountPercentage: item?.discountPercentage,
                                discountPrice: item?.discountPrice,
                                productId: item?.productId,
                                name: item?.names,
                                description: "",
                                stock: item?.stock,
                                price: item?.prices,
                                quantities: item?.quantities,
                                itemId: item?.itemId,
                                discountedPrice: item?.prices,
                                imageUrls: item.imageUrls ? item.imageUrls : [],
                                rating: null,
                                wishlistId: item.wishlistId || null,
                              };

                              return (
                                <div
                                  key={index}
                                  className="flex items-start sm:gap-4 gap-2 border-b border-gray-200 py-4 sm:px-2 px-1 hover:bg-gray-50 rounded-md transition-all "
                                >
                                  {/* Product Image */}
                                  <Image
                                    src={
                                      Array.isArray(item?.imageUrls)
                                        ? item?.imageUrls
                                          ? item.imageUrls[0]
                                          : "/product.png"
                                        : item?.imageUrls
                                        ? item.imageUrls
                                        : "/product.png"
                                    }
                                    alt={item.names || "Product image"}
                                    width={100}
                                    height={100}
                                    style={{ objectFit: "contain" }}
                                    className="sm:h-20 h-16 sm:w-28 cursor-pointer"
                                    onClick={() => {
                                      router.push(
                                        `/homepage/products/${item?.productId}`
                                      );
                                    }}
                                  />

                                  {/* Content Section */}
                                  <div className="flex flex-col flex-grow justify-between">
                                    {/* Name */}
                                    <h3 className="sm:text-lg text-sm font-semibold text-gray-700 mb-1 line-clamp-2 text-wrap ">
                                      {item.names}
                                    </h3>
                                    {/* Price */}
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm  text-primaryBlue font-semibold">
                                        Rs.
                                        {item?.prices -
                                          (item.discountPercentage
                                            ? (item.prices *
                                                item.discountPercentage) /
                                              100
                                            : 0)}{" "}
                                      </p>
                                      <p className="text-sm font-medium text-gray-500 line-through">
                                        Rs.
                                        {item?.prices +
                                          (item.discountPrice > 0
                                            ? item.discountPrice
                                            : 0)}
                                      </p>
                                    </div>

                                    {/* Quantity Controls + Subtotal */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                                      <div className="flex items-center">
                                        <Button
                                          variant="outline"
                                          className="rounded-r-none border-r-0 text-xs sm:px-2 px-1 sm:w-8 sm:h-auto h-6"
                                          onClick={() => decreaseCount(product)}
                                          // mahendra
                                        >
                                          {/* <i className="fa-solid fa-minus"></i>  */}
                                          <GrFormSubtract />
                                        </Button>

                                        <div
                                          className={cn(
                                            buttonVariants({
                                              variant: "outline",
                                            }),
                                            "rounded-none text-xs text-center w-12 sm:px-2 px-1 sm:w-8 sm:h-auto h-6"
                                          )}
                                        >
                                          {item.quantities}
                                        </div>

                                        <Button
                                          // mahendra thapa
                                          variant="outline"
                                          className="rounded-l-none border-l-0 text-xs sm:px-2 px-1 sm:w-8 sm:h-auto h-6 text-black"
                                          onClick={() => {
                                            increaseCount(product);
                                          }}
                                          disabled={
                                            item?.quantities >=
                                            (item.stock ?? 0)
                                          }
                                        >
                                          {/* <i className="fa-solid fa-plus"></i> */}
                                          <IoAdd />
                                        </Button>
                                      </div>

                                      <p className="text-sm text-gray-500">
                                        Subtotal: Rs.
                                        {Number(
                                          (item?.prices -
                                            (item.discountPercentage
                                              ? (item.prices *
                                                  item.discountPercentage) /
                                                100
                                              : 0)) *
                                            item?.quantities
                                        )}
                                      </p>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      variant="outline"
                                      className="mt-3 px-2 py-1 w-fit text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2 text-sm"
                                      onClick={() =>
                                        removeCount(product.productId)
                                      }
                                    >
                                      <MdDelete size={18} />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Order Summary */}
                        <div className="w-full ">
                          <div className="bg-gray-50 rounded-lg pt-2 sticky top-0">
                            {/* <h2 className="text-xl font-bold mb-4">Order Summary</h2> */}
                            <div className="space-y-3 px-2">
                              <div className="flex justify-between items-center text-gray-800">
                                <p className="text-lg font-medium">
                                  Items ({items?.length})
                                </p>
                                <p className="text-lg font-semibold">
                                  RS.
                                  {items
                                    .reduce(
                                      (sum, item) =>
                                        sum +
                                        (item?.quantities || 1) *
                                          (item?.prices -
                                            (item.discountPercentage
                                              ? (item.prices *
                                                  item.discountPercentage) /
                                                100
                                              : 0) || 1),
                                      0
                                    )
                                    .toFixed(2)}
                                </p>
                              </div>

                              {/* <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                          </div> */}
                              <div className="border-t pt-3 mt-3 ">
                                <div className="flex justify-between items-center text-gray-800">
                                  <p className="text-lg font-medium">Total</p>
                                  <p className="text-lg font-medium">
                                    {" "}
                                    Rs.
                                    {items
                                      .reduce(
                                        (sum, item) =>
                                          sum +
                                          (item?.quantities || 1) *
                                            (item?.prices -
                                              (item.discountPercentage
                                                ? (item.prices *
                                                    item.discountPercentage) /
                                                  100
                                                : 0) || 1),
                                        0
                                      )
                                      .toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 ">
                              <Button
                                onClick={handleCheckoutClick}
                                className="w-full"
                              >
                                Proceed to Checkout
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CartModal;
