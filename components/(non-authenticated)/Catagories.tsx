"use client";

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
import { PiBagFill } from "react-icons/pi";

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
          .then(() => {})
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
    const existingItem = allItems.find(
      (item) => item.productId === product.productId
    );

    const itemPrice = product.price;

    let updatedItems;
    if (existingItem) {
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

    setAllItems(updatedItems);
    dispatch(addToCart(product));

    if (user) {
      addToCartByApi(product, existingItem ? existingItem.quantities + 1 : 1);
    }
  };

  const increaseCount = (product: Product) => {
    const existingItem = allItems.find(
      (item) => item.productId === product.productId
    );

    const itemPrice = product.price;

    let updatedItems;
    if (existingItem) {
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

    setAllItems(updatedItems);
    dispatch(addToCart(product));

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
    const discount = ((price - discountedPrice) / price) * 100;
    return Math.round(discount);
  };

  const decreaseCount = (productId: string) => {
    const existingItem = allItems.find((item) => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantities === 1) {
        setAllItems(allItems.filter((item) => item.productId !== productId));
        dispatch(removeFromCart(productId));

        if (user) {
          axiosAuthInstance()
            .delete(`/api/cart/remove?productId=${existingItem.productId}`)
            .catch((err) => {});
        }
      } else {
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

        if (user) {
          countApi(
            {
              productId: existingItem.productId,
              name: existingItem.names,
              description: "",
              price: existingItem.prices,
              discountedPrice: 0,
              imageUrls: existingItem.imageUrls || [],
              rating: null,
              wishlistId: existingItem.wishlistId || null,
              cartId: existingItem.cartId,
            },
            existingItem.quantities - 1
          );
        }
      }
    }
  };

  const toggleWishlist = (product: Product, isAdded: boolean) => {
    if (isAdded) {
      dispatch(removeFromWishlist(product.productId));
      if (user) {
        wishlistApi(product, "remove");
      }
    } else {
      dispatch(addToWishlist(product));
      if (user) {
        wishlistApi(product, "add");
      }
    }
  };

  const router = useRouter();

  // Refined Product Card Component
  const ProductCard = ({
    product,
    item,
    isInWishlist,
  }: {
    product: Product;
    item: CartItem | undefined;
    isInWishlist: boolean;
  }) => {
    const isDiscounted =
      product.discountedPrice > 0 && product.price > product.discountedPrice;
    const finalPrice = isDiscounted ? product.discountedPrice : product.price;
    const discountPercent =
      product.discountPercentage > 0
        ? product.discountPercentage
        : isDiscounted
        ? calculateDiscountPercent(product.price, product.discountedPrice)
        : 0;

    return (
      <Link
        href={`/homepage/products/${product.productId}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 block border border-gray-100 hover:border-orange-100"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
          <Image
            src={
              `${NEXT_PUBLIC_CLOUDINARY_URL}${product?.imageUrls?.[0]}` ||
              "/product.png"
            }
            alt={product.name || "Product image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* DISCOUNT BADGE */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
                {discountPercent}% OFF
              </span>
            </div>
          )}

          {/* WISHLIST BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (user) {
                toggleWishlist(product, isInWishlist);
                handleClick(product.productId);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
              isInWishlist
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
            }`}
          >
            <GoHeartFill className="text-lg" />
          </button>

          {/* QUICK ADD OVERLAY */}
          {!item?.quantities && (product?.stock ?? 0) > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (user) {
                    addtoCartByown(product);
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="w-full bg-white text-orange-600 font-semibold py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-orange-50 transition-colors"
              >
                <PiBagFill className="text-lg" />
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4">
          {/* CATEGORY & RATING */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-orange-600 font-medium text-sm">
              {product.category?.name || "Category"}
            </span>
            <div className="flex items-center gap-1">
              <MdOutlineStar className="text-yellow-500 text-base" />
              <span className="font-medium text-gray-800 text-sm">
                {product?.rating?.toFixed(1) || "4.8"}
              </span>
            </div>
          </div>

          {/* PRODUCT NAME */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-700 transition-colors mb-2">
            {product.name}
          </h3>

          {/* PRICE SECTION */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              Rs.{finalPrice.toFixed(0)}
            </span>
            {isDiscounted && (
              <span className="text-sm text-gray-500 line-through">
                Rs.{product.price.toFixed(0)}
              </span>
            )}
          </div>

          {/* ADD TO CART / QUANTITY CONTROLS */}
          {item && item.quantities > 0 ? (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  decreaseCount(product.productId);
                }}
                className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors"
              >
                <RiSubtractFill className="text-lg" />
              </button>

              <span className="font-bold text-orange-700 min-w-[20px] text-center">
                {item.quantities}
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  increaseCount(product);
                }}
                disabled={item.quantities >= (product?.stock || 1)}
                className="text-orange-600 hover:text-orange-700 p-1 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <IoMdAdd className="text-lg" />
              </button>
            </div>
          ) : (product?.stock ?? 0) > 0 ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (user) {
                  addtoCartByown(product);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PiBagFill className="text-lg" />
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-200"
            >
              Out of Stock
            </button>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      {/* HEADER */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Shop by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
            Categories
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing products organized by your favorite categories
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardLoading key={index} />
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
            <div key={category.categoryId} className="mb-16 last:mb-0">
              {/* CATEGORY HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {
                      products.filter((p) => p.category === category.categoryId)
                        .length
                    }{" "}
                    products available
                  </p>
                </div>

                <Button
                  onClick={() =>
                    router.push(
                      `/homepage/products?category=${category.categoryId}`
                    )
                  }
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span>View All</span>
                  <IoChevronForwardSharp className="text-lg" />
                </Button>
              </div>

              {/* PRODUCTS CAROUSEL */}
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {products
                      .filter((p) => p.category === category.categoryId)
                      .map((filteredProduct) => {
                        const item = items.find(
                          (item) => item.productId === filteredProduct.productId
                        );
                        const isInWishlist = wishlistItems.some(
                          (item) => item.productId === filteredProduct.productId
                        );

                        return (
                          <CarouselItem
                            key={filteredProduct.productId}
                            className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                          >
                            <div className="h-full">
                              <ProductCard
                                product={filteredProduct}
                                item={item}
                                isInWishlist={isInWishlist}
                              />
                            </div>
                          </CarouselItem>
                        );
                      })}
                  </CarouselContent>

                  {/* CAROUSEL NAVIGATION */}
                  <CarouselPrevious className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
                  <CarouselNext className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border-0 hover:bg-gray-50 w-12 h-12 rounded-full" />
                </Carousel>
              </div>
            </div>
          ))
      )}

      {/* EMPTY STATE */}
      {!isLoading &&
        categories.filter(
          (category) =>
            products.filter((p) => p.category === category.categoryId).length >=
            5
        ).length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories available
            </h3>
            <p className="text-gray-600">
              Check back later for new product categories.
            </p>
          </div>
        )}
    </section>
  );
};

export default Categories;
