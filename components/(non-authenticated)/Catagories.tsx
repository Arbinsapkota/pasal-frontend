import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { MdOutlineStar } from "react-icons/md";
import { BsDash } from "react-icons/bs";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);
  const { setIsLoginModalOpen } = useModal();
  useEffect(() => {
    // Fetch categories
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`)
      .then((response) => {
        const twoCategory = response.data;
        setCategories(twoCategory);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // Fetch products
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`)
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      });
  }, []);

  // fetch the cartData
  const [cartData, setCartData] = useState<Product[]>([]);
  const fetchCartData = useCallback(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/cart/")
        .then((res) => {
          setCartData(res.data);
        })
        .catch((err) => {
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
        (item) => item.productId === product.productId
      );

      if (existingItem && existingItem.itemId) {
        axiosAuthInstance()
          .post("/api/cart/update", {
            itemId: existingItem.itemId,
            quantity,
          })
          .then(() => {
            // if (!existingItem?.itemId ) {
            //   fetchCartData(); // Refresh cart after update
            // }
          })
          .catch((err) => {
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
      .catch((err) => {
        toast.error("Failed to add to cart");
        console.error(err);
      });
  }, []);

  const addtoCartByown = (product: Product) => {
    // Check if the product already exists in allItems
    const existingItem = allItems.find(
      (item) => item.productId === product.productId
    );

    const itemPrice = product.price;

    let updatedItems;
    if (existingItem) {
      // If the product exists, increase quantity and update the total price
      updatedItems = allItems.map((item) =>
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
          discountPrice: product.discountPrice || 0,
          discountPercentage: product.discountPercentage || 0,
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
      (item) => item.productId === product.productId
    );

    const itemPrice = product.price;

    let updatedItems;
    if (existingItem) {
      // If the product exists, increase quantity and update the total price
      updatedItems = allItems.map((item) =>
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
  const wishlistApi = useDebouncedCallback(
    (product: Product, action: "add" | "remove") => {
      const endpoint = action === "add" ? "/api/wishlist/" : "/api/wishlist/";

      if (action === "add") {
        axiosAuthInstance()
          .post(endpoint, { product: { productId: product.productId } })
          .catch((err) => {
            toast.error(`Error adding in favorite.`);
          });
      } else {
        axiosAuthInstance()
          .delete(endpoint, { params: { productId: product.productId } })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  );

  const [clickedId, setClickedId] = useState<string>("");
  const handleClick = (id: string) => {
    setClickedId(id);
    setTimeout(() => {
      setClickedId("");
    }, 100);
  };

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  const decreaseCount = (productId: string) => {
    const existingItem = allItems.find((item) => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantities === 1) {
        // Remove the item completely if quantity is 1
        setAllItems(allItems.filter((item) => item.productId !== productId));
        dispatch(removeFromCart(productId));

        // Call API to completely remove item
        if (user) {
          axiosAuthInstance()
            .delete(`/api/cart/remove?productId=${existingItem.productId}`)
            .catch((err) => {
              // toast.error("Failed to Remove Item from Cart");
            });
        }
      } else {
        // Decrease quantity and update total price
        const updatedItems = allItems.map((item) =>
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

  const router = useRouter();

  return (
    <div className="p-4 md:p-6 rounded-lg  mx-auto w-full ">
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
        categories
          .filter(
            (category) =>
              products.filter(
                (product) => product.category === category.categoryId
              ).length >= 5
          )
          .map((category, index) => (
            <div key={index} className="w-full">
              {/* Category header */}
              <div className="flex justify-between gap-4 mb-2 pb-1 mt-5">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <Button
                  onClick={() =>
                    router.push(
                      `/homepage/products?category=${category.categoryId}`
                    )
                  }
                  variant="link"
                  className="w-auto py-2 px-2 rounded-md text-lg hover:bg-white flex gap-1 hover:text-primary"
                >
                  <span>Shop more</span>
                  <IoChevronForwardSharp className="mt-[2.1px]" />
                </Button>
              </div>

              {/* Carousel */}
              <div key={category.categoryId} className=" ">
                <Carousel>
                  <CarouselContent className="sm:pl-6 pl-3 pb-2">
                    {products
                      .filter((p) => p.category === category.categoryId)
                      .map((filteredProduct, index) => {
                        const item = items.find(
                          (item) => item.productId === filteredProduct.productId
                        );
                        const isAddedInWishlist = wishlistItems.find(
                          (item) => item.productId == filteredProduct.productId
                        );

                        return (
                          <CarouselItem
                            key={index}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-2 "
                          >
                            <Link
                              href={`/homepage/products/${filteredProduct.productId}`}
                            >
                              <div className="p-1 sm:p-2 md:p-3 rounded-lg hover:bg-[#0037c8]/15 transition-shadow group shadow-md border sm:w-[230px] w-auto">
                                <div className="relative w-full">
                                  <div className="cursor-pointer">
                                    {((filteredProduct.discountedPrice > 0 &&
                                      filteredProduct.price >
                                        filteredProduct.discountedPrice) ||
                                      filteredProduct.discountPercentage >
                                        0) && (
                                      <div className="absolute sm:-top-1 top-1 -left-1 sm:-left-3 z-10">
                                        <h1 className="text-xs px-2 py-1 bg-red-500 text-white font-semibold rounded-r-full text-start">
                                          {filteredProduct.discountPercentage
                                            ? `${filteredProduct.discountPercentage}% OFF`
                                            : `${calculateDiscountPercent(
                                                filteredProduct.price,
                                                filteredProduct.discountedPrice
                                              )}% OFF`}
                                        </h1>
                                      </div>
                                    )}
                                    <div className="relative w-full aspect-square sm:h-[170px] h-auto">
                                      <Image
                                        src={
                                          `${NEXT_PUBLIC_CLOUDINARY_URL}${filteredProduct?.imageUrls?.[0]}` ||
                                          "/product.png"
                                        }
                                        alt={
                                          filteredProduct.name ||
                                          "Product image"
                                        }
                                        className="object-cover w-full h-full rounded-md "
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                      />
                                    </div>
                                    <div className="absolute top-1 right-1 sm:-top-1 sm:-right-1 z-10">
                                      {user ? (
                                        <Button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleWishlist(
                                              filteredProduct,
                                              isAddedInWishlist != undefined
                                            );
                                            handleClick(
                                              filteredProduct.productId
                                            );
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
                                          onClick={(e) => {
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
                                    <h2 className="mt-1 text-xs sm:text-sm md:text-base  text-primary-btn truncate font-semibold ">
                                      {filteredProduct.name}
                                    </h2>
                                    <div className="flex items-baseline">
                                      <span className="price ">
                                        Rs.
                                        {(
                                          filteredProduct?.price -
                                          (filteredProduct.discountPercentage
                                            ? (filteredProduct?.price *
                                                (filteredProduct?.discountPercentage ??
                                                  0)) /
                                              100
                                            : filteredProduct?.discountedPrice)
                                        ).toFixed(0)}
                                      </span>
                                      {(filteredProduct.discountedPrice > 0 ||
                                        filteredProduct.discountPercentage >
                                          0) && (
                                        <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                          Rs.
                                          {(filteredProduct?.price).toFixed(0)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end ">
                                  {/* Stock Section */}
                                  {/* <div className="border border-gray-300 rounded-sm py-0.5 px-1.5 flex items-center gap-1">
                                    <p
                                      className={`text-sm font-medium ${
                                        filteredProduct?.stock || 0 > 0
                                          ? "text-blue-600 font-semibold"
                                          : "text-gray-400 font-semibold"
                                      }`}
                                    >
                                      {filteredProduct?.stock || 0}
                                    </p>
                                    <p className="text-gray-500">stocks</p>
                                  </div> */}
                                  {/* Rating Section */}
                                  <div className="flex items-center  py-0.5 px-1.5 gap-0.5">
                                    {filteredProduct?.rating &&
                                    filteredProduct.rating > 0 ? (
                                      <span className="ml-1 text-sm text-gray-700 font-medium">
                                        {filteredProduct?.rating?.toFixed(1) ||
                                          0}
                                      </span>
                                    ) : (
                                      <BsDash className="text-gray-400 text-xl" />
                                    )}

                                    <MdOutlineStar className="text-yellow-500 text-xl" />
                                  </div>
                                </div>

                                {/* Add to cart section */}
                                <div className="flex items-center sm:mt-1 pb-1 sm:pb-2">
                                  <div className="ml-auto w-full flex   justify-center h-8 sm:h-10 ">
                                    {item && item?.quantities > 0 ? (
                                      <div className="flex  rounded-full">
                                        <Button
                                          className="p-1 text-xs sm:text-sm border-r  rounded-lg rounded-r-none pl-2 sm:pl-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  sm:w-16 w-12"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            decreaseCount(
                                              filteredProduct.productId
                                            );
                                          }}
                                        >
                                          <RiSubtractFill className="w-6 h-6 sm:w-4 sm:h-4 text-white" />
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
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            increaseCount(filteredProduct);
                                          }}
                                          disabled={
                                            item?.quantities >=
                                            (filteredProduct?.stock || 1)
                                          }
                                        >
                                          <IoMdAdd />
                                        </Button>
                                      </div>
                                    ) : (filteredProduct?.stock ?? 0) > 0 ? (
                                      user ? (
                                        <Button
                                          variant={"default"}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addtoCartByown(filteredProduct);
                                          }}
                                          className="border rounded-lg h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm md:text-base   w-full"
                                        >
                                          Add to cart
                                        </Button>
                                      ) : (
                                        <Button
                                          variant={"default"}
                                          onClick={(e) => {
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
                              </div>{" "}
                            </Link>
                          </CarouselItem>
                        );
                      })}
                  </CarouselContent>
                  <CarouselPrevious className="ml-9 sm:ml-16" />
                  <CarouselNext className="mr-9 sm:mr-16" />
                </Carousel>
              </div>
            </div>
          ))
      )}
    </div>
  );
};
export default Categories;
