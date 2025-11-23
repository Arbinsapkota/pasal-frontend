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
import { Rating } from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import MaxWidthWrapper from "../(authenticated)/admin/maxWidthWrapper";
import { axiosAuthInstance, axiosInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import ProductCardLoading from "../loaidng/ProductLoading";
import { useModal } from "../providers/ModalStateProvider";
import { Button, buttonVariants } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingContent from "./LoadingContent";
import ShowReview from "./Review-Rating-modal/ShowReviws";
import { BsDash } from "react-icons/bs";
import { MdOutlineStar } from "react-icons/md";
// import TextEditorReadOnly from "./textEditor/TextEditorReadOnly";
const TextEditorReadOnly = dynamic(
  () => import("./textEditor/TextEditorReadOnly"),
  {
    ssr: false,
  }
);
interface ModalProps {
  productId: string;
}

const ProductDetails: React.FC<ModalProps> = ({ productId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product>();
  const [products, setProducts] = useState<Product[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecLoading, setIsRecLoading] = useState<boolean>(true);
  const { setIsLoginModalOpen } = useModal();

  useEffect(() => {
    axiosInstance()
      .get("/api/product/", {
        params: {
          productId,
        },
      })
      .then(res => {
        setProduct(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product", err);
        setIsLoading(false);
      });
  }, []);

  const [isClicked, setIsClicked] = useState<boolean>(false);

  const handleClick = (productId: string) => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 100);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const isAddedInWishlist = wishlistItems.find(
    item => item.productId == product?.productId
  );

  const item = items.find(item => item.productId === product?.productId);

  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  const router = useRouter();

  useEffect(() => {
    setAllItems(items); // Update local state when Redux state changes
  }, [items]);

  useEffect(() => {
    if (product) {
      axiosInstance()
        .get("/api/product/suggestions/by-subcategory", {
          params: {
            subcategoryId:
              product.subcategory || "03c6c530-3427-433e-8ff8-06ccb7433e06",
          },
        })
        .then(res => {
          setProducts(res.data);
          setIsRecLoading(false);
        })
        .catch(err => {
          console.log("Error fetching products", err);
          setIsRecLoading(false);
        });
    }
  }, [product]);

  // get the cart Product
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
          .catch(() => {
            toast.error(`Error adding in favorite.`);
          });
      } else {
        axiosAuthInstance()
          .delete(endpoint, { params: { productId: product.productId } })
          .catch(() => {
            // toast.error(`Server has to be updated.`);
          });
      }
    }
  );

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

  if (!product) return null;

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  // it is used for removing the  unwanted first comma
  const cleaned = product?.description?.replace(/^,/, "");

  const handleBuyNow = (product: Product) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Prepare product details for checkout
    const checkoutItem = {
      discountPercentage: product.discountPercentage,
      productId: product.productId,
      name: product.name,
      quantity: 1,
      price: product.price - (product.discountedPrice || 0),
      imageUrl: product.imageUrls[0] || "/product.png",
    };

    // Navigate to checkout with product details
    router.push(
      `/checkout?items=${encodeURIComponent(JSON.stringify([checkoutItem]))}`
    );
  };
  return (
    <MaxWidthWrapper className="sm:p-12 px-4 py-6">
      <div>
        {/* --------------------- Breadcrumb ------------------------- */}
        <div className="my-10">
          <div className=" sm:pt-5 flex sm:flex-row flex-col sm:gap-4 sm:items-center font-medium">
            <div className="flex items-center gap-2">
              <Link
                href={"/homepage/products"}
                className=" hover:underline cursor-pointer underline-offset-2 "
              >
                All Products
              </Link>{" "}
              <FaChevronRight className="shrink-0" />{" "}
            </div>
            <p className="text-gray-500 text-wrap">
              {" "}
              {isLoading ? (
                <LoadingContent className="w-20 h-4" />
              ) : (
                product?.name
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col relative">
        <div className="">
          <div className="flex flex-col w-full h-full ">
            <div className="grid md:grid-cols-2  items-start">
              {/* Image Section */}
              <div className="w-full flex flex-col-reverse gap-3 relative ">
                <div className="flex  pt-0.5 gap-2  overflow-x-auto max-w-[80%] scrollbar-thin">
                  {Array.isArray(product.imageUrls) &&
                  product?.imageUrls?.length > 0 ? (
                    product.imageUrls.map((url: string, index: number) => (
                      <Card
                        key={index}
                        className={` p-2 rounded cursor-pointer border-2 ${
                          index === currentImageIndex
                            ? "border-gray-500"
                            : "border-transparent"
                        }`}
                        onMouseEnter={() => handleImageChange(index)}
                        onClick={() => handleImageChange(index)}
                      >
                        <Image
                          src={url || "/product.png"}
                          alt={`Thumbnail-${index}`}
                          width={100}
                          height={100}
                          style={{ objectFit: "cover" }}
                          className="rounded w-16 h-16"
                        />
                      </Card>
                    ))
                  ) : (
                    <Card className="p-2 rounded cursor-pointer border-gray-500 border-2">
                      <Image
                        src={"/product.png"}
                        alt={`Thumbnail`}
                        width={100}
                        height={100}
                        style={{ objectFit: "cover" }}
                        className="rounded w-16 h-16"
                      />
                    </Card>
                  )}
                </div>

                <Card className="relative inline-flex h-auto  rounded  md:w-[70%] w-[200px]  items-center justify-start">
                  <Image
                    src={product.imageUrls[currentImageIndex] || "/product.png"}
                    alt={`${product.name}-${currentImageIndex}` || "pic"}
                    className=" h-40 md:h-96 w-full object-cover"
                    height={800}
                    width={800}
                    style={{ objectFit: "contain" }}
                  />
                </Card>
              </div>

              {/* Details Section */}
              <div className=" w-full pt-4">
                <div className="flex flex-col items-start justify-start">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="sm:text-3xl text-primaryBlue text-lg font-semibold text-primary-btn">
                        Rs.
                        {(
                          product?.price -
                          (product.discountPercentage
                            ? (product?.price *
                                (product?.discountPercentage ?? 0)) /
                              100
                            : product?.discountedPrice)
                        ).toFixed(0)}
                      </span>
                      {(product.discountedPrice ||
                        product.discountPercentage > 0) && (
                        <span className="text-gray-500 text-md line-through ml-2">
                          Rs.{(product?.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-medium text-lg truncate text-wrap">
                      {product.name}
                    </h2>
                  </div>
                  {/* rating of the product by the calculating of all rating */}
                  <Rating
                    name="read-only"
                    value={product?.rating}
                    precision={0.5}
                    readOnly
                    sx={{
                      color: "orange",
                    }}
                    className="sm:mt-1.5 sm:my-0 my-1.5 sm:size-8 size-4"
                  />

                  <div className="flex flex-wrap items-center  gap-3">
                    <div
                      className={`flex items-center mt-2 ${
                        product.stock ?? 0 > 0 ? "w-36" : ""
                      } `}
                    >
                      {product?.stock ?? 0 > 0 ? (
                        user ? (
                          <Button
                            className=" flex items-center px-4 gap-1.5 bg-orange-500 hover:bg-orange-600 w-full h-10 "
                            onClick={() => handleBuyNow(product)}
                          >
                            Buy Now
                          </Button>
                        ) : (
                          <Button
                            className=" flex items-center px-4 gap-1.5 bg-orange-500 hover:bg-orange-600 w-full h-10 "
                            onClick={() => {
                              setIsLoginModalOpen(true);
                            }}
                          >
                            Buy Now
                          </Button>
                        )
                      ) : null}
                    </div>
                    <div className="flex items-center mt-2   w-36 ">
                      {product?.stock ?? 0 > 0 ? (
                        item && item?.quantities > 0 ? (
                          <div className="bg-primaryBlue flex items-center justify-between rounded-md w-full ">
                            <Button
                              className=" text-xl h-10 bg-primaryBlue  hover:bg-primaryBlue/80 border-r border-white"
                              onClick={() => decreaseCount(product?.productId)}
                            >
                              <RiSubtractFill />
                            </Button>
                            <p className="text-white ">{item?.quantities}</p>

                            <Button
                              className=" text-xl h-10 bg-primaryBlue  hover:bg-primaryBlue/80 border-l border-white"
                              onClick={() => {
                                increaseCount(product);
                              }}
                              disabled={item?.quantities >= (item?.stock || 1)}
                            >
                              <IoMdAdd />
                            </Button>
                          </div>
                        ) : user ? (
                          <Button
                            className=" flex items-center px-4 gap-1.5 bg-primaryBlue  hover:bg-primaryBlue/80 w-full h-10 "
                            onClick={() => {
                              addtoCartByown(product);
                            }}
                          >
                            Add to Cart
                          </Button>
                        ) : (
                          <Button
                            className=" flex items-center px-4 gap-1.5 bg-primaryBlue  hover:bg-primaryBlue/80 w-full h-10 "
                            onClick={() => {
                              setIsLoginModalOpen(true);
                            }}
                          >
                            Add to Cart
                          </Button>
                        )
                      ) : (
                        <Button
                          className="flex items-center px-4 gap-1.5 bg-blue-700 cursor-not-allowed w-full h-10"
                          disabled
                        >
                          Out of Stock
                        </Button>
                      )}
                    </div>
                    <div className=" ">
                      {user ? (
                        <Button
                          variant={"outline"}
                          onClick={e => {
                            e.stopPropagation();
                            // addToFavorite(product);
                            toggleWishlist(
                              product,
                              isAddedInWishlist != undefined ? true : false
                            );
                            handleClick(product.productId);
                          }}
                          className={` text-gray-600 max-w-36 mt-2 py-5 flex items-center bg-white  transition-all hover:text-primaryBlue hover:bg-white   z-10 rounded-md ${
                            isAddedInWishlist
                              ? "bg-white hover:bg-white hover:text-primary-blue text-primaryBlue "
                              : null
                          } 
                    ${
                      isClicked
                        ? "bg-white hover:bg-white hover:text-primaryBlue/80 text-white"
                        : ""
                    }`}
                        >
                          {/* <p>Add to Favorite</p> */}
                          <GoHeartFill className="mt-1" />
                        </Button>
                      ) : (
                        <Button
                          variant={"outline"}
                          onClick={e => {
                            e.stopPropagation();
                            setIsLoginModalOpen(true);
                          }}
                          className={` text-gray-600 max-w-36 mt-2 py-5 flex items-center bg-white  transition-all hover:text-blue-500 hover:bg-white   z-10 rounded-md `}
                        >
                          {/* <p>Add to Favorite</p> */}
                          <GoHeartFill className="mt-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mt-4">Description</h3>
                {/* <p className="text-gray-600 mb-4">{product.description}</p> */}
                {/* <TextEditorReadOnly value={cleaned} /> */}
                {/* it is because there is two type of description one from the simple "p-tag" and another is in the from the text editor */}
                {product?.description?.includes(",[{") ? (
                  <TextEditorReadOnly value={cleaned} />
                ) : (
                  <p className="text-gray-600 mb-4">{product.description}</p>
                )}

                {/* <div className=" my-1">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a flavour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Flavours</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}

                {product?.labelImgUrl && (
                  <p className="mt-6 text-lg text-gray-700  font-semibold ">
                    Label:
                  </p>
                )}
                {product?.labelImgUrl && (
                  <Dialog>
                    <DialogTrigger>
                      <div className="relative group">
                        <Card className="p-4 mt-4 w-max ">
                          <Image
                            src={product?.labelImgUrl}
                            alt="Label"
                            width={1000}
                            height={1000}
                            style={{ objectFit: "fill" }}
                            className="aspect-square  w-40 "
                          />
                        </Card>
                        <Button className="absolute rounded-full   top-0 right-0 h-8 w-4 group-hover:bg-primaryBlue/80">
                          <IoEye className="size-5 " />
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[70%] max-h-[90vh] w-auto h-full overflow-auto scrollbar-thin">
                      <DialogHeader>
                        <DialogTitle>Label</DialogTitle>
                      </DialogHeader>
                      <Image
                        src={product?.labelImgUrl}
                        alt="Label"
                        width={1600}
                        height={1600}
                        style={{ objectFit: "fill" }}
                        className="w-auto h-96  "
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            {/* review nad ratings of the products in details */}
            <div className="mt-6">
              <ShowReview productId={product.productId} />
            </div>
            <div>
              <p className="font-bold text-xl mt-4 text-center mb-4">
                You may also like
              </p>
              <div className="grid grid-cols-2 h-auto  sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 gap-2">
                {isRecLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <ProductCardLoading key={index} className=" w-full" />
                  ))
                ) : products ? (
                  products.map((product, index) => {
                    const item = items.find(
                      item => item.productId == product.productId
                    );
                    const isAddedInWishlist = wishlistItems.find(
                      item => item.productId == product.productId
                    );

                    return (
                      <Link
                        href={`/homepage/products/${product.productId}`}
                        key={index}
                      >
                        <div className="p-4 bg-gray-100 rounded-lg  group hover:bg-[#0037c8]/15 ">
                          <div
                            className="relative"
                            onClick={() => {
                              router.push(
                                `/homepage/products/${product.productId}`
                              );
                            }}
                          >
                            <div className="cursor-pointer">
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
                              <div className="relative w-full h-48">
                                <Image
                                  src={product.imageUrls[0] || "/product.png"}
                                  alt={product.name || "Product image"}
                                  className="object-cover w-full h-full rounded-md"
                                  fill
                                />
                              </div>
                            </div>
                            <div className="absolute top-1 right-1 sm:-top-1 sm:-right-1 z-10">
                              {user ? (
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
                            <h2 className="mt-2 font-semibold text-primary-btn truncate">
                              {product.name}
                            </h2>
                            <div className="mt-1">
                              <span className=" font-semibold text-primary-btn price">
                                Rs.
                                {(
                                  product?.price -
                                  (product.discountPercentage
                                    ? (product?.price *
                                        (product?.discountPercentage ?? 0)) /
                                      100
                                    : product?.discountedPrice)
                                ).toFixed(0)}
                              </span>
                              {(product.discountedPrice ||
                                product.discountPercentage > 0) && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                  Rs.
                                  {(product?.price).toFixed(0)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* stock nad the rating */}
                          <div className=" flex items-center justify-end">
                            {/* Stock Section */}
                            {/* <div className="border border-gray-300 rounded-sm py-0.5 px-1.5 flex items-center gap-1">
                            <p
                              className={`text-sm font-medium ${
                                product?.stock || 0 > 0
                                  ? "text-blue-600 font-semibold"
                                  : "text-gray-400 font-semibold"
                              }`}
                            >
                              {product?.stock || 0}
                            </p>
                          <p className="text-gray-500">stocks</p>
                        </div> */}
                            {/* Rating Section */}
                            <div className="flex gap-0.5 items-center   px-1.5">
                              {product?.rating && product.rating > 0 ? (
                                <span className="ml-1 text-sm text-gray-700 font-medium">
                                  {product?.rating?.toFixed(1) || 0}
                                </span>
                              ) : (
                                <div className="flex items-center">
                                  <BsDash className="text-gray-400 text-xl" />{" "}
                                </div>
                              )}

                              <MdOutlineStar className="text-yellow-500 text-xl" />
                            </div>
                          </div>

                          {/* add to cart section */}
                          <div className="flex items-center sm:mt-1 pb-1 sm:pb-2">
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
                                      item?.quantities >= (product?.stock || 1)
                                    }
                                  >
                                    <IoMdAdd />
                                  </Button>
                                </div>
                              ) : product?.stock ?? 0 > 0 ? (
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
                      </Link>
                    );
                  })
                ) : (
                  <p>No related Products</p>
                )}
              </div>

              {/* <div
              className="mb-4 cursor-pointer flex items-center"
              onClick={() => addToWishlist(product)}
            >
              <i className="fa-regular fa-heart"></i>
              <span className="ml-2">Add to Wishlist</span>
            </div> */}

              {/* <div className="flex items-center mb-4">
              <button
                className="bg-gray-200 text-gray-800 py-1 px-3 rounded-l hover:bg-gray-300"
                onClick={handleDecreaseQuantity}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                min="1"
                className="mx-2 text-center w-16 p-2 border border-gray-300 rounded"
              />
              <button
                className="bg-gray-200 text-gray-800 py-1 px-3 rounded-r hover:bg-gray-300"
                onClick={handleIncreaseQuantity}
              >
                +
              </button>
            </div> */}
            </div>
          </div>

          {/* <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Related Products</h3>
          <RelatedProducts />
        </div> */}
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default ProductDetails;
