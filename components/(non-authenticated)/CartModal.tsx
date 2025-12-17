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
import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingContent from "./LoadingContent";

const CartModal: React.FC = () => {
  const dispatch = useDispatch();

  // const { cart,  } = useCart();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const items = useSelector((state: RootState) => state.cart.items);
  const userDetails = getUserFromCookies();
  useEffect(() => {
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
  }, []);

  function clearCartItems() {
    dispatch(clearCart());
    setIsModalOpen(false);
    if (userDetails) {
      axiosAuthInstance()
        .post("/api/cart/clear")
        .then(res => {})
        .catch(err => console.error("Error clearing cart"));
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

  const countApi = useCallback(
    useDebouncedCallback((product: any, quantity: Number) => {
      axiosAuthInstance()
        .post("/api/cart/add", {
          products: {
            productId: product.productId,
          },
          quantity,
        })
        .catch(err => {
          toast.error("Failed to Add to Cart");
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
          discountPrice: product?.discountPrice ?? 0,
          discountPercentage: product?.discountPercentage ?? 0,
          productId: product.productId,
          names: product.name,
          quantities: 1,

          prices: itemPrice,
          totalPrice: itemPrice,
          imageUrls: product.imageUrls?.length ? [product.imageUrls[0]] : [],
          rating: product.rating,
        },
      ];
    }
    // Update local state
    setAllItems(updatedItems);

    // Update Redux
    dispatch(addToCart(product));

    // Trigger API call if user is logged in
    if (user) {
      countApi(product, existingItem ? existingItem.quantities + 1 : 1);
    }
  };

  const decreaseCount = (productId: string) => {
    const existingItem = allItems.find(item => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantities === 1) {
        // Remove the item completely if quantity is 1
        setAllItems(allItems.filter(item => item.productId !== productId));
        dispatch(removeFromCart(productId));

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
          item.productId === productId
            ? {
                ...item,
                quantities: item.quantities - 1,
                totalPrice: item.totalPrice - item.prices,
              }
            : item
        );

        setAllItems(updatedItems);
        dispatch(removeFromCart(productId));

        // Update backend with new quantity
        if (user) {
          // Correctly pass the Product object
          countApi(
            {
              productId: existingItem.productId,
              name: existingItem.names,
              description: "", // Add description if available
              price: existingItem.prices,
              discountedPrice: 0, // Add discounted price if applicable
              imageUrls: existingItem.imageUrls ?? null,
              rating: null, // Add rating if available
              cartId: existingItem.cartId,
            },
            existingItem.quantities - 1 // Updated quantity
          );
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
            // toast.error("Failed to Remove Item from Cart");
          });
      }
    }
  };

  return (
    <div className="container mx-auto  ">
      {/* Cart Icon with Item Count */}
      <Dialog>
        <DialogTrigger>
          <div className="relative inline-flex items-center p-2">
            {/* <span className=" hidden md:block ">Cart</span>{" "} */}
            <FaCartShopping className="size-6 text-primaryBlue/80 hover:text-primaryBlue " />
            {items.length > 0 && (
              <span
                className="absolute w-5 h-9 -top-[3.8px] -right-2 bg-white border border-gray-400  text-primaryBlue rounded-full px-2 py-1 text-xs flex items-center justify-center"
                style={{ minWidth: "1.5rem", height: "1.5rem" }}
              >
                {items.length}
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className=" max-w-[90%] md:max-w-[50%] sm:max-w-[80%] max-h-[90vh]  ">
          <div className=" ">
            {/* Modal Content */}
            <div className="">
              {/* Modal Header */}
              <DialogHeader>
                <DialogTitle>Your Shopping Cart </DialogTitle>
              </DialogHeader>

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
                  <div className="w-full flex justify-end my-1">
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        clearCartItems();
                      }}
                      className="flex mt-3 items-center gap-2 hover:text-destructive"
                    >
                      <p className="">Clear Cart</p>
                      <MdDelete className="size-5 " />
                    </Button>
                  </div>
                  <div className="flex flex-col   gap-6 mt-3">
                    {/* Cart Items List */}
                    <div className="flex-grow  overflow-y-auto h-56 scrollbar-thin border rounded-md">
                      {isLoading ? (
                        <LoadingContent className="h-40 w-full" />
                      ) : (
                        items.map((item, index) => {
                          const product: Product = {
                            discountPercentage: item.discountPercentage || 0,
                            quantities: item.quantities,
                            productId: item.productId,
                            name: item.names,
                            description: "",
                            price: item.prices,
                            discountedPrice: item.prices,
                            imageUrls: item.imageUrls || [],
                            rating: null,
                            wishlistId: null,
                          };

                          return (
                            <div
                              key={index}
                              className="flex items-center border-b pb-4 my-2 cursor-pointer"
                            >
                              <Image
                                src={
                                  Array.isArray(item?.imageUrls) &&
                                  item?.imageUrls[0]?.trim()
                                    ? item.imageUrls[0]
                                    : "/product.png"
                                }
                                alt={item.names || "pic"}
                                width={100}
                                height={100}
                                style={{ objectFit: "contain" }}
                                className="h-20 w-32"
                                onClick={() => {
                                  router.push(
                                    `/homepage/products/${item?.productId}`
                                  );
                                }}
                              />

                              <div className="ml-4 flex flex-col  flex-grow">
                                <p className="text-lg font-medium text-gray-700">
                                  ${item?.prices?.toFixed()}
                                </p>
                                <div className="flex justify-between items-start">
                                  <h3 className=" font-medium">{item.names}</h3>
                                </div>
                                <div className="flex items-baseline justify-between flex-wrap gap-2">
                                  <div className="flex items-center mt-2">
                                    <Button
                                      variant={"outline"}
                                      className="border-r-0 rounded-r-none text-xs"
                                      onClick={() =>
                                        decreaseCount(product.productId)
                                      }
                                    >
                                      <i className="fa-solid fa-minus"></i>
                                    </Button>

                                    <div
                                      className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "rounded-none text-xs text-center w-12"
                                      )}
                                    >
                                      {item.quantities}
                                    </div>
                                    <Button
                                      variant={"outline"}
                                      className="border-l-0 rounded-l-none text-xs"
                                      onClick={() => increaseCount(product)}
                                      disabled={
                                        item?.quantities >=
                                        (product?.stock || 1)
                                      }
                                      // onClick={() =>
                                      //   handleQuantityChange(item, item.quantity + 1)
                                      // }
                                    >
                                      <i className="fa-solid fa-plus"></i>
                                    </Button>
                                  </div>
                                  <p className="text-sm text-gray-500 mr-2">
                                    Subtotal: $
                                    {(item?.prices * item?.quantities).toFixed(
                                      2
                                    )}
                                  </p>
                                </div>
                                <Button
                                  className="hover:text-destructive w-auto mt-2 max-w-32 z-20"
                                  variant={"outline"}
                                  onClick={() => {
                                    removeCount(product.productId);
                                  }}
                                >
                                  Remove
                                  <MdDelete size={20} />
                                </Button>

                                {/* Checkbox to select item */}
                                <div className="mt-2">
                                  {/* <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => handleItemSelect(item.id)}
                              className="mr-2"
                            />
                            <span>Select for checkout</span>
                          </label> */}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full ">
                      <div className="bg-gray-50 rounded-lg pt-2 sticky top-0 px-2">
                        {/* <h2 className="text-xl font-bold mb-4">Order Summary</h2> */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Items ({items?.length})</span>
                            <span>
                              $
                              {items
                                .reduce(
                                  (sum, item) =>
                                    sum +
                                    (item?.quantities || 1) *
                                      (item?.prices || 1),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                          </div> */}
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>
                                {" "}
                                $
                                {items
                                  .reduce(
                                    (sum, item) =>
                                      sum +
                                      (item?.quantities || 1) *
                                        (item?.prices || 1),
                                    0
                                  )
                                  .toFixed(2)}
                              </span>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartModal;
