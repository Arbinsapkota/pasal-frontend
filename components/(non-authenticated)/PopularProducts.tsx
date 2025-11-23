"use client";
import { cn } from "@/lib/utils";
import {
  addToCart,
  CartItem,
  Product,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlistSlice";
import { RootState } from "@/redux/store";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { IoChevronForwardSharp } from "react-icons/io5";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import { axiosAuthInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import ProductCardLoading from "../loaidng/ProductLoading";
import { useModal } from "../providers/ModalStateProvider";
import { Button, buttonVariants } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { MdOutlineStar } from "react-icons/md";
import { BsDash } from "react-icons/bs";

const PopularProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cartData, setCartData] = useState<Product[]>([]);

  const { setIsLoginModalOpen } = useModal();
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [clickedId, setClickedId] = useState<string>("");
  const router = useRouter();
  const shopMoreClick = () => {
    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage/products`);
  };
  const handleClick = (id: string) => {
    setClickedId(id);
    setTimeout(() => {
      setClickedId("");
    }, 100);
  };

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/popular`
      );

      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  useEffect(() => {
    setAllItems(items); // Update local state when Redux state changes
  }, [items]);

  // ----------------------------------------------------

  // get the cart Product
  const fetchCartData = useCallback(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/cart/")
        .then(res => {
          setCartData(res.data);
        })
        .catch(err => {
          console.error("Error fetching Cart Items", err);
        });
    }
  }, [user]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // 1️⃣ Increment / Update existing item
  const countApi = useCallback(
    useDebouncedCallback((product: any, quantity: number) => {
      const existingItem = cartData.find(
        item => item.productId === product.productId
      );

      if (existingItem && existingItem.itemId) {
        axiosAuthInstance()
          .post("/api/cart/update", {
            itemId: existingItem.itemId,
            quantity,
          })
          .then(() => {
            // fetchCartData(); // Refresh cart after update
          })
          .catch(err => {
            toast.error("Failed to update cart");
            console.error(err);
          });
      }
    }, 400),
    [cartData]
  );

  // 2️⃣ Add new product to cart
  const addToCartByApi = useCallback((product: any, quantity: number) => {
    axiosAuthInstance()
      .post("/api/cart/add", {
        products: { productId: product.productId },
        quantity,
      })
      .then(() => {
        fetchCartData(); // Refresh cart after adding
      })
      .catch(err => {
        toast.error("Failed to add to cart");
        console.error(err);
      });
  }, []);

  // -----------------------------------------------

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

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  const addtoCartByown = (product: Product) => {
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
          imageUrls: product.imageUrls,
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
      addToCartByApi(product, existingItem ? existingItem.quantities + 1 : 1);
    }
  };

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
          imageUrls: product.imageUrls,
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
              imageUrls: existingItem.imageUrls || [],
              rating: null, // Add rating if available
              wishlistId: existingItem.wishlistId || null,
              cartId: existingItem.cartId,
            },
            existingItem.quantities - 1 // Updated quantity
          );
        }
      }
    }
  };

  const toggleWishlist = (product: Product, isAdded: boolean) => {
    if (isAdded) {
      // Remove from Wishlist
      dispatch(removeFromWishlist(product.productId));
      if (user) {
        wishlistApi(product, "remove");
      }
    } else {
      // Add to Wishlist
      dispatch(addToWishlist(product));
      if (user) {
        wishlistApi(product, "add");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 rounded-lg bg-white">
      {products.length >= 5 ? (
        <>
          <div className="flex flex-row justify-between gap-4 mb-2">
            <h1 className="header text-gray-800  flex">
              <span className="font-semibold">Popular Products</span>
            </h1>
            <Button
              onClick={shopMoreClick}
              variant={"link"}
              className="w-auto py-2 px-2 rounded-md  hover:text-blue-700 flex gap-1 "
            >
              <span className="shope-more">Shop more</span>
              <IoChevronForwardSharp className="mt-[2.1px]" />
            </Button>
          </div>

          <div className="mx-auto mt-2 sm:mt-4">
            <div className=" flex flex-col items-start justify-start">
              <div className=" w-full">
                {isLoading ? (
                  <div className="flex overflow-x-auto gap-3 sm:gap-5 w-full pb-2 flex-shrink-0 scrollbar-hide">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="min-w-[160px] sm:min-w-[220px] md:min-w-[230px] flex-shrink-0"
                      >
                        <ProductCardLoading />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Carousel>
                    <CarouselContent className="sm:pl-6 pl-2 pb-2">
                      {products.map((product: any, index) => {
                        const item = items.find(
                          item => item.productId == product.productId
                        );
                        const isAddedInWishlist = wishlistItems.find(
                          item => item.productId == product.productId
                        );

                        return (
                          <CarouselItem
                            key={index}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-2"
                          >
                            <div
                              onClick={() =>
                                router.push(
                                  `/homepage/products/${product.productId}`
                                )
                              }
                              className="p-1 sm:p-2 md:p-3 rounded-lg hover:bg-primaryBlue/15 transition-shadow group shadow-md border sm:w-[230px] w-auto cursor-pointer"
                            >
                              <div className="relative w-full">
                                <div className="cursor-pointer">
                                  {/* This is the line to fix */}
                                  {((product.discountedPrice > 0 &&
                                    product.price > product.discountedPrice) ||
                                    product.discountPercentage > 0) && (
                                    <div className="absolute sm:-top-1 top-1 -left-1 sm:-left-3 z-10">
                                      <h1 className="text-xs px-2 py-1 bg-red-500 text-white font-semibold rounded-r-full text-start">
                                        {product.discountPercentage
                                          ? `${product.discountPercentage}% OFF`
                                          : `${calculateDiscountPercent(
                                              product.price,
                                              product.discountedPrice
                                            )}% OFF`}
                                      </h1>
                                    </div>
                                  )}

                                  <div className="relative w-full aspect-square sm:h-[170px] h-auto">
                                    <Image
                                      src={
                                        product.imageUrls[0] || "/product.png"
                                      }
                                      alt={product.name || "Product image"}
                                      className="object-cover w-full h-full rounded-md"
                                      fill
                                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    />
                                  </div>
                                  <div className="absolute top-1 sm:-top-1 right-1 sm:-right-1 z-10">
                                    {user ? ( //mahendra
                                      <Button
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleWishlist(
                                            product,
                                            isAddedInWishlist != undefined
                                          );
                                          handleClick(product.productId);
                                        }}
                                        className={`text-sm sm:text-xl  z-10 bg-white pt-0 h-6 sm:h-8 p-1 sm:p-2 rounded-full border transition-all  text-white hover:bg-gray-200 ${
                                          isAddedInWishlist
                                            ? "text-[#0037c8]"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        <GoHeartFill />
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setIsLoginModalOpen(true);
                                        }}
                                        className={`text-sm sm:text-xl  z-10 bg-white pt-0 h-6 sm:h-8 p-1 sm:p-2 rounded-full border transition-all   hover:text-[#0037c8] hover:bg-gray-200 text-gray-400 `}
                                      >
                                        <GoHeartFill />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-col gap-1 justify-between">
                                  <h2 className="mt-1 text-sm sm:text-base text-primary-btn truncate font-semibold">
                                    {product.name}
                                  </h2>
                                  <div className="flex items-baseline">
                                    <span className="price text-primary-btn">
                                      Rs.
                                      {(
                                        product?.price -
                                        (product.discountPercentage
                                          ? (product?.price *
                                              (product?.discountPercentage ??
                                                0)) /
                                            100
                                          : product?.discountedPrice)
                                      ).toFixed(0)}
                                    </span>
                                    {(product?.discountPercentage ||
                                      product?.discountedPrice > 0) && (
                                      <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                        Rs.{(product?.price ?? 0).toFixed(0)}
                                      </span>
                                    )}

                                    {/* {product.discountedPrice &&
                                    product.price > product.discountedPrice ? (
                                      <>
                                        <span className="price text-primary-btn">
                                          Rs.
                                          {product.discountedPrice.toFixed(0)}
                                        </span>
                                        <span className="sm:text-sm text-xs text-gray-500 line-through sm:ml-2 ml-1">
                                          Rs.{product.price.toFixed(0)}
                                        </span>
                                      </>
                                    ) : (
                                     
                                    )} */}
                                  </div>
                                </div>
                              </div>

                              {/* stock nad the rating */}
                              <div className="flex items-center justify-end">
                                {/* Rating Section */}
                                <div className="flex gap-0.5 items-center px-1.5">
                                  {Number(product?.rating) > 0 ? (
                                    <span className="ml-1 text-sm text-gray-700 font-medium">
                                      {Number(product?.rating).toFixed(1)}
                                    </span>
                                  ) : (
                                    <BsDash className="text-gray-400 text-xl" />
                                  )}
                                  <MdOutlineStar className="text-yellow-500 text-xl" />
                                </div>
                              </div>

                              {/* add and remove the cart */}
                              <div className="flex items-center  sm:mt-1 pb-1 sm:pb-2">
                                <div className="ml-auto w-full flex   justify-center h-8 sm:h-10 ">
                                  {item && item?.quantities > 0 ? (
                                    <div className="flex  rounded-full">
                                      <Button
                                        className="p-1 text-xs sm:text-sm border-r  rounded-lg rounded-r-none pl-2 sm:pl-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  sm:w-16 w-12"
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          decreaseCount(product.productId);
                                        }}
                                      >
                                        <RiSubtractFill />
                                      </Button>
                                      <span
                                        className={cn(
                                          buttonVariants({
                                            variant: "default",
                                          }),
                                          "px-1 sm:px-2 w-10 sm:w-16 text-xs sm:text-base rounded-none border-none h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  flex items-center justify-center "
                                        )}
                                      >
                                        {item.quantities}
                                      </span>
                                      <Button
                                        className="p-1 text-xs sm:text-sm  rounded-lg rounded-l-none border-l pr-2 sm:pr-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  sm:w-16 w-12"
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          increaseCount(product);
                                        }}
                                        disabled={
                                          item?.quantities >=
                                          (product?.stock || 1)
                                        }
                                      >
                                        <IoMdAdd />
                                      </Button>
                                    </div>
                                  ) : product?.stock > 0 ? (
                                    user ? (
                                      <Button
                                        variant={"default"}
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          addtoCartByown(product);
                                        }}
                                        className="border rounded-lg h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm md:text-base   w-full"
                                      >
                                        Add to cart
                                      </Button>
                                    ) : (
                                      <Button
                                        variant={"default"}
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setIsLoginModalOpen(true);
                                        }}
                                        className="border  rounded-lg h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm md:text-base   w-full"
                                      >
                                        Add to cart
                                      </Button>
                                    )
                                  ) : (
                                    <Button
                                      variant={"default"}
                                      disabled
                                      className="border border-muted-foreground  rounded-lg h-10 px-4"
                                    >
                                      Out of Stock
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious className="ml-9 sm:ml-16" />
                    <CarouselNext className="mr-9 sm:mr-16" />
                  </Carousel>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default PopularProducts;
