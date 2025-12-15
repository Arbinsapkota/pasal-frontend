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
import Link from "next/link";

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

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

          <div className="mx-auto mt-2 sm:mt-4 ">
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
                        
                        const discountPercent =
                          product.discountPercentage ||
                          (product.price > product.discountedPrice && product.discountedPrice > 0
                            ? Math.round(
                                ((product.price - product.discountedPrice) / product.price) * 100
                              )
                            : 0);

                        const finalPrice = product.discountPercentage
                          ? product.price - (product.price * product.discountPercentage) / 100
                          : product.discountedPrice;

                        return (
                          <CarouselItem
                            key={index}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-2 "
                          >
                            <Link
      href={`/homepage/products/${product.productId}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 block border border-gray-100 hover:border-orange-100"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[5/5] overflow-hidden bg-gray-50">
        <Image
          src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}`}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* DISCOUNT BADGE */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* WISHLIST */}
        <button
          onClick={e => {
            stop(e);
            toggleWishlist(product, !!isAddedInWishlist);
            handleClick(product.productId);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isAddedInWishlist
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
            Rs. {finalPrice.toFixed(0)}
          </span>
          {discountPercent > 0 && (
            <span className="text-sm text-gray-500 line-through">
              Rs. {product.price.toFixed(0)}
            </span>
          )}
        </div>

        {/* RATING */}
        <div className="flex items-center mt-2">
          {product.rating ? (
            <span className="text-sm font-semibold text-gray-700">
              {Number(product.rating).toFixed(1)}
            </span>
          ) : (
            <BsDash className="text-gray-400 text-lg" />
          )}
          <MdOutlineStar className="text-yellow-500 text-xl ml-1" />
        </div>

        {/* CART BUTTONS */}
        <div className="mt-3">
          {item && item.quantities > 0 ? (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              {/* DECREASE */}
              <button
                onClick={e => {
                  stop(e);
                  decreaseCount(product.productId);
                }}
                className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
              >
                <RiSubtractFill className="text-lg" />
              </button>

              <span className="font-bold text-orange-700 min-w-[20px] text-center">
                {item.quantities}
              </span>

              {/* INCREASE */}
              <button
                onClick={e => {
                  stop(e);
                  increaseCount(product);
                }}
                disabled={item.quantities >= (product.stock || 1)}
                className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
              >
                <IoMdAdd className="text-lg" />
              </button>
            </div>
          ) : product.stock > 0 ? (
            user ? (
              <button
                onClick={e => {
                  stop(e);
                  addtoCartByown(product);
                }}
                className="w-full mt-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add to Cart
              </button>
            ) : (
              <button
                onClick={e => {
                  stop(e);
                  setIsLoginModalOpen(true);
                }}
                className="w-full mt-3 bg-orange-600 text-white py-3 rounded-xl shadow-sm hover:bg-orange-700 transition-all"
              >
                Add to Cart
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full mt-3 bg-gray-300 text-gray-600 py-3 rounded-xl"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </Link>
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
