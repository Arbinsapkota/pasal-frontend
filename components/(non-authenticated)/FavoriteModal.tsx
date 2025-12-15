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
  setWishlistData,
} from "@/redux/slices/wishlistSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import { axiosAuthInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import { Wishlist } from "../types/whishlist";
import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingContent from "../loaidng/LoaidngCotent";
import WishListSkeleton from "../loaidng/WishlistSkelaton";

export function convertWishlistToProduct(wishlistItem: Wishlist): Product {
  return {
    discountPercentage: wishlistItem.discountPercentage,
    quantities: wishlistItem.quantity,
    productId: wishlistItem.productId,
    name: wishlistItem.name,
    description: wishlistItem.description,
    price: wishlistItem.price,
    stock: wishlistItem.stock,
    discountedPrice: wishlistItem.discountedPrice,
    imageUrls: wishlistItem.imageUrls,
    rating: wishlistItem.rating,
    wishlistId: wishlistItem.wishlistId || null,
  };
}

export default function FavoriteModal() {
  const [isOpen, setIsOpen] = useState(false);
  // const { wishlist, removeFromWishlist } = useWishlist();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [loading, setLoading] = useState(true);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { setIsLoginModalOpen } = useModal();

  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const items = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/wishlist/")
        .then(res => {
          setWishlist(res.data);
          dispatch(setWishlistData(res.data));
        })
        .catch(err => console.error("Error fetching Wishlist", err))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  useEffect(() => {
    setAllItems(items); // Update local state when Redux state changes
  }, [items]);

  // const countApi = useCallback(
  //   useDebouncedCallback((product: any, quantity: Number) => {
  //     axiosAuthInstance()
  //       .post("/api/cart/add", {
  //         products: {
  //           productId: product.productId,
  //         },
  //         quantity,
  //       })
  //       .catch(err => {
  //         toast.error("Failed to Add to Cart");
  //       });
  //   }, 400),
  //   []
  // );

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

  // this are the cart
  const [cartData, setCartData] = useState<Product[]>([]);
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
              stock: item.stock,
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
          stock: product?.stock,
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

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  return (
    <div className="container mx-auto">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {user ? (
          <DialogTrigger>
            <div
              onClick={() => setIsOpen(true)}
              className={cn(
                // buttonVariants({ variant: "ghost" }),
                "relative inline-flex items-center py-1  px-2 hover:text-primaryBlue text-blue-600 "
              )}
            >
              {/* <span className="mr-1 hidden md:block">Wishlist</span> */}
              <GoHeartFill className="size-6 " />
              {wishlistItems.length > 0 && (
                <span
                  className="absolute w-5  h-5 -top-1 -right-1 bg-white text-primaryBlue border border-gray-400 rounded-full px-2 py-1 text-xs flex items-center justify-center"
                  // style={{ minWidth: "1.5rem", height: "1.5rem" }}
                >
                  {wishlistItems.length}
                </span>
              )}
            </div>
          </DialogTrigger>
        ) : (
          <div
            onClick={() => setIsLoginModalOpen(true)}
            className="cursor-pointer"
          >
            {/* <span className="mr-1 hidden md:block">Wishlist</span> */}
            <GoHeartFill className="size-6 mb-1 hover:text-primaryBlue text-blue-600" />
          </div>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Favorite Products</DialogTitle>
          </DialogHeader>
          <div className="">
            <div className="">
              <div className=" ">
                {wishlistItems.length === 0 ? (
                  <p className="text-gray-500">
                    You have no favorite products.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* <div>
                      <Button
                        variant={"outline"}
                        className="flex items-center ml-auto gap-1.5 hover:text-destructive"
                        onClick={() => dispatch(clearWishlist())}
                      >
                        <p>Empty Wishlist</p>
                        <MdDelete className="size-5 " />
                      </Button>
                    </div> */}
                    <div className=" mt-1.5 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 h-80 overflow-y-auto scrollbar-thin  ">
                      {loading ? (
                        <WishListSkeleton />
                      ) : (
                        wishlistItems?.map((item, index) => {
                          const isInCart = cartItems.find(
                            cartItem => cartItem.productId == item.productId
                          );

                          return (
                            <div
                              onClick={() => {
                                router.push(
                                  `/homepage/products/${item?.productId}`
                                );
                              }}
                              key={index}
                              className="border rounded-lg shadow-md sm:p-4 p-2 max-h-52 relative  "
                            >
                              <div className="relative w-full h-20 cursor-pointer">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${item?.imageUrls}` ||
                                    "/placeholder-image.png"}
                                  alt={item.name || "Product image"}
                                  width={400}
                                  height={400}
                                  className="rounded h-20 w-full"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              {((item.discountedPrice > 0 &&
                                item.price > item.discountedPrice) ||
                                item.discountPercentage > 0) && (
                                <div className="absolute sm:top-1 top-1 -left-1 sm:left-0 z-10">
                                  <h1 className="text-xs px-2 py-1 bg-red-500 text-white font-semibold rounded-r-full text-start">
                                    {item.discountPercentage
                                      ? `${item.discountPercentage}% OFF`
                                      : `${calculateDiscountPercent(
                                          item.price,
                                          item.discountedPrice
                                        )}% OFF`}
                                  </h1>
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex flex-col ">
                                <Button
                                  onClick={e => {
                                    e.stopPropagation();
                                    // addToFavorite(product);
                                    toggleWishlist(
                                      convertWishlistToProduct(item),
                                      true
                                    );
                                  }}
                                  className={`text-xl   transition-all bg-white hover:bg-white text-primaryBlue/80    z-10 rounded-full py-3 px-2.5  `}
                                >
                                  <GoHeartFill className="size-4" />
                                </Button>
                              </div>

                              <h2 className="text-sm pt-2 font-semibold  truncate">
                                {item.name}
                              </h2>
                              <div className="flex   items-baseline">
                                <span className="text-primaryBlue font-semibold text-sm">
                                  Rs.
                                  {(
                                    item?.price -
                                    (item.discountPercentage
                                      ? (item?.price *
                                          (item?.discountPercentage ?? 0)) /
                                        100
                                      : item?.discountedPrice)
                                  ).toFixed(0)}
                                </span>
                                {(item.discountedPrice ||
                                  item.discountPercentage > 0) && (
                                  <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                    Rs.{(item?.price).toFixed(0)}
                                  </span>
                                )}
                              </div>
                              {isInCart && isInCart?.quantities > 0 ? (
                                <div className="bg-primaryBlue  flex items-center justify-between rounded-md mt-1.5 h-9">
                                  <Button
                                    className=" text-xl h-9 p-1 sm:px-3 px-3 bg-primaryBlue hover:bg-primaryBlue/80  border-r border-white"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      decreaseCount(item?.productId);
                                    }}
                                  >
                                    <RiSubtractFill className="size-4" />
                                  </Button>
                                  <p className="text-white text-sm w-[20px] text-center">
                                    {isInCart?.quantities}
                                  </p>
                                  <Button
                                    className=" text-xl h-9 p-1 sm:px-3 px-3 hover:bg-primaryBlue/80 border-l border-white"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      increaseCount(
                                        convertWishlistToProduct(item)
                                      );
                                    }}
                                    disabled={
                                      isInCart?.quantities >=
                                      (isInCart?.stock ?? 0)
                                    }
                                  >
                                    <IoMdAdd className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  className=" font-normal flex items-center px-4 gap-1.5  hover:bg-primaryBlue/80 w-full  mt-1.5 h-9"
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addtoCartByown(
                                      convertWishlistToProduct(item)
                                    );
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
