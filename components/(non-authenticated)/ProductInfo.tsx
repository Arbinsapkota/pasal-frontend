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
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";
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

// Mock Weight options for the grocery layout
const MOCK_WEIGHTS = ["500 g", "1 Kg", "2 Kg", "5 Kg"];

const ProductDetails: React.FC<ModalProps> = ({ productId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(MOCK_WEIGHTS[0]);
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
      .then((res) => {
        setProduct(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
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
    (item) => item.productId == product?.productId
  );

  const item = items.find((item) => item.productId === product?.productId);

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
        .then((res) => {
          setProducts(res.data);
          setIsRecLoading(false);
        })
        .catch((err) => {
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
            // fetchCartData(); // Refresh cart after update
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

  if (!product) return null;

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  // it is used for removing the  unwanted first comma
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
    // MaxWidthWrapper is kept, but we use a narrower internal container
    <MaxWidthWrapper className="sm:p-6 px-4 py-4">
      {/* --------------------- Breadcrumb (Simplified) ------------------------- */}
      <div className="mb-4">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <Link
              href={"/homepage/products"}
              className=" text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200"
            >
              All Products
            </Link>{" "}
            <FaChevronRight className="shrink-0 text-gray-400 size-2.5" />{" "}
            <p className="text-gray-700 font-semibold text-wrap">
              {" "}
              {isLoading ? (
                <LoadingContent className="w-20 h-3" />
              ) : (
                product?.name
              )}
            </p>
          </div>
      </div>
      <div className="w-full flex justify-center">
        {/* Main Content Area - Narrower to match the image layout */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-5xl w-full"> 
          
          <div className="grid md:grid-cols-2 gap-8"> {/* Increased gap */}
            {/* Left Column: Image Section */}
            <div className="w-full flex flex-col-reverse gap-4"> 
              
              {/* Image Thumbnails */}
              <div className="flex gap-2 overflow-x-auto justify-start"> 
                {Array.isArray(product.imageUrls) &&
                product?.imageUrls?.length > 0 ? (
                  product.imageUrls.map((url: string, index: number) => (
                    <Card
                      key={index}
                      className={` p-0.5 rounded-md cursor-pointer border-2 transition-all duration-300 ${
                        index === currentImageIndex
                          ? "border-green-500 shadow-md scale-[1.01]" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onMouseEnter={() => handleImageChange(index)}
                      onClick={() => handleImageChange(index)}
                    >
                      <Image
                        src={url || "/product.png"}
                        alt={`Thumbnail-${index}`}
                        width={80}
                        height={80}
                        style={{ objectFit: "cover" }}
                        className="rounded w-16 h-16 object-cover" 
                      />
                    </Card>
                  ))
                ) : (
                  <Card className="p-0.5 rounded-md cursor-pointer border-green-500 border-2 shadow-md">
                    <Image
                      src={"/product.png"}
                      alt={`Thumbnail`}
                      width={80}
                      height={80}
                      style={{ objectFit: "cover" }}
                      className="rounded w-16 h-16 object-cover"
                    />
                  </Card>
                )}
              </div>

              {/* Main Product Image */}
              <Card className="relative inline-flex h-auto rounded-xl p-3 w-full items-center justify-center bg-gray-50 shadow-inner"> 
                {/* Image Navigation Arrows (match the image style) */}
                <Button 
                  onClick={() => handleImageChange((currentImageIndex - 1 + product.imageUrls.length) % product.imageUrls.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-white/80 text-gray-700 hover:bg-white/90 rounded-full shadow-md z-10"
                >
                  <FaChevronRight className="rotate-180" />
                </Button>
                <Button 
                  onClick={() => handleImageChange((currentImageIndex + 1) % product.imageUrls.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-white/80 text-gray-700 hover:bg-white/90 rounded-full shadow-md z-10"
                >
                  <FaChevronRight />
                </Button>

                <Image
                  src={
                    `${NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[currentImageIndex]}` ||
                    "/product.png"
                  }
                  alt={`${product.name}-${currentImageIndex}` || "pic"}
                  className="h-72 md:h-[400px] w-full object-cover rounded-xl"
                  height={700}
                  width={700}
                  style={{ objectFit: "contain" }}
                />
                
                {/* Wishlist Button (Heart icon in the top right) */}
                <div className="absolute top-4 right-4 z-10">
                      {user ? (
                        <Button
                          variant={"ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(
                              product,
                              isAddedInWishlist != undefined ? true : false
                            );
                            handleClick(product.productId);
                          }}
                          className={`text-lg w-10 h-10 p-0 flex items-center justify-center bg-white rounded-full transition-all shadow-md ${
                            isAddedInWishlist
                              ? "text-red-500 hover:bg-red-50/80"
                              : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                          } `}
                        >
                          <GoHeartFill className="size-4" /> 
                        </Button>
                      ) : (
                        <Button
                          variant={"ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLoginModalOpen(true);
                          }}
                          className={`text-lg text-gray-400 w-10 h-10 p-0 flex items-center justify-center bg-white rounded-full transition-all shadow-md hover:text-red-500 hover:bg-gray-100`}
                        >
                          <GoHeartFill className="size-4" />
                        </Button>
                      )}
                    </div>
              </Card>
            </div>

            {/* Right Column: Details and Actions */}
            <div className="w-full pt-4">
              <div className="flex flex-col space-y-3"> 
                
                {/* Category and Stock */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Fruits</span> {/* Mock Category */}
                  {product?.stock ?? 0 > 0 ? (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Name */}
                <h2 className="font-bold text-2xl text-gray-800"> 
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 pb-1"> 
                  <Rating
                    name="read-only"
                    value={product?.rating}
                    precision={0.5}
                    readOnly
                    sx={{
                      color: "#FFD700", // Gold color
                      fontSize: "1.25rem" // md:text-xl
                    }}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {product?.rating?.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                      (0 Review)
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl text-gray-900 font-bold"> 
                    Rs.
                    {(
                      product?.price -
                      (product.discountPercentage
                        ? (product?.price * (product?.discountPercentage ?? 0)) / 100
                        : product?.discountedPrice)
                    ).toFixed(0)}
                  </span>
                  {(product.discountedPrice || product.discountPercentage > 0) && (
                    <span className="text-gray-400 text-lg line-through"> 
                      Rs.{(product?.price).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Description (Short Mocked version) */}
                <p className="text-gray-600 text-sm leading-relaxed pt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
                </p>

                {/* Weight/Size Selection */}
                <div className="pt-2">
                  <p className="font-medium text-sm text-gray-700 mb-2">Weight</p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_WEIGHTS.map((weight) => (
                      <Button
                        key={weight}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500",
                          selectedWeight === weight && "bg-green-50 border-green-500 text-green-700 font-semibold"
                        )}
                        onClick={() => setSelectedWeight(weight)}
                      >
                        {weight}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Group: Quantity, Add/Buy Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-gray-300 rounded-md h-10 w-28 shrink-0">
                    <Button
                      variant="ghost"
                      className="text-lg h-full rounded-none rounded-l-md text-gray-600 hover:bg-gray-100"
                      onClick={() => decreaseCount(product?.productId)}
                    >
                      <RiSubtractFill />
                    </Button>
                    <p className="text-gray-900 font-medium w-full text-center">
                      {item?.quantities || 1} {/* Display 1 if not in cart */}
                    </p>
                    <Button
                      variant="ghost"
                      className="text-lg h-full rounded-none rounded-r-md text-gray-600 hover:bg-gray-100"
                      onClick={() => {
                        increaseCount(product);
                      }}
                      disabled={(item?.quantities ?? 0) >= (item?.stock || 1)}
                    >
                      <IoMdAdd />
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  {product?.stock ?? 0 > 0 ? (
                    <Button
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 w-full h-10 text-base font-semibold transition-all rounded-md max-w-[150px]"
                      onClick={() => {
                        user ? addtoCartByown(product) : setIsLoginModalOpen(true);
                      }}
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <Button
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 cursor-not-allowed w-full h-10 rounded-md max-w-[150px]"
                      disabled
                    >
                      Out of Stock
                    </Button>
                  )}
                  
                  {/* Buy Now Button */}
                  <Button
                      className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full h-10 text-base font-semibold transition-all rounded-md max-w-[150px]"
                      onClick={() => {
                        user ? handleBuyNow(product) : setIsLoginModalOpen(true);
                      }}
                  >
                      Buy Now
                  </Button>
                </div>
                
                {/* SKU and Tags */}
                <div className="pt-6 border-t border-gray-200 mt-6 space-y-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">SKU:</span> GRFR85648HGJ 
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">Tags:</span> Apple, Green, Fruits
                    </p>
                </div>
                
                {/* Share Icons (Mocked) */}
                <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-semibold text-gray-800 mr-1">Share:</span>
                    <div className="flex gap-1">
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">f</div>
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">t</div>
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">P</div>
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">in</div>
                    </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Detailed Description and Reviews (Moved below main details) */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-xl text-gray-800 mb-4">Product Details</h3>
            
            {/* Conditional Description/Text Editor */}
            {product?.description?.includes(",[{") ? (
                <TextEditorReadOnly value={cleaned} />
            ) : (
                <p className="text-gray-600 text-base leading-relaxed">
                    {product.description}
                </p>
            )}

            {product?.labelImgUrl && (
              <div className="mt-6">
                <p className="text-lg text-gray-700 font-bold mb-3">
                  Label/Nutritional Facts
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative group cursor-pointer w-max">
                      <Card className="p-3 w-max border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-green-500 rounded-lg"> 
                        <Image
                          src={`${NEXT_PUBLIC_CLOUDINARY_URL}${product?.labelImgUrl}`}
                          alt="Label"
                          width={600}
                          height={600}
                          style={{ objectFit: "fill" }}
                          className="aspect-square w-32 rounded-md" 
                        />
                      </Card>
                      <Button className="absolute rounded-full top-2 right-2 h-7 w-7 p-0 bg-gray-800/80 group-hover:bg-gray-900 shadow-md transition-colors"> 
                        <IoEye className="size-3 text-white" />
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[70%] max-h-[90vh] w-auto h-full overflow-auto scrollbar-thin">
                    <DialogHeader>
                      <DialogTitle>Product Label</DialogTitle>
                    </DialogHeader>
                    <Image
                      src={product?.labelImgUrl}
                      alt="Label"
                      width={1600}
                      height={1600}
                      style={{ objectFit: "fill" }}
                      className="w-auto h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <ShowReview productId={product.productId} />
            </div>
            
          </div>

          {/* You May Also Like Section (Unchanged) */}
          <div className="mt-8">
            <p className="font-bold text-xl mt-3 text-center mb-5 text-gray-800">
              You May Also Like
            </p>
            <div className="grid grid-cols-2 h-auto sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 gap-2">
              {isRecLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <ProductCardLoading key={index} className=" w-full" />
                ))
              ) : products ? (
                products.map((product, index) => {
                  const item = items.find(
                    (item) => item.productId == product.productId
                  );
                  const isAddedInWishlist = wishlistItems.find(
                    (item) => item.productId == product.productId
                  );

                  return (
                    <Link
                      href={`/homepage/products/${product.productId}`}
                      key={index}
                    >
                      <div className="p-3 bg-white border border-gray-200 rounded-lg group hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50">
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
                              <div className="absolute sm:-top-1 top-1 -left-1 sm:-left-2 z-10">
                                <h1 className="text-xs px-2 py-0.5 bg-red-600 text-white font-semibold rounded-r-full text-start shadow-md">
                                  {product.discountPercentage
                                    ? `${product.discountPercentage}% OFF`
                                    : `${calculateDiscountPercent(
                                        product.price,
                                        product.discountedPrice
                                      )}% OFF`}
                                </h1>
                              </div>
                            )}
                            <div className="relative w-full h-36 rounded-md overflow-hidden">
                              <Image
                                src={
                                  `${NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}` ||
                                  "/product.png"
                                }
                                alt={product.name || "Product image"}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                fill
                              />
                            </div>
                          </div>
                          <div className="absolute top-1 right-1 z-10">
                            {user ? (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(
                                    product,
                                    isAddedInWishlist != undefined
                                  );
                                  handleClick(product.productId);
                                }}
                                className={`text-lg z-10 bg-white pt-0 h-7 w-7 p-0 rounded-full border transition-all shadow-md ${
                                  isAddedInWishlist
                                    ? "text-red-500 border-red-300 hover:bg-red-50/80"
                                    : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                                }`}
                              >
                                <GoHeartFill className="size-3.5" />
                              </Button>
                            ) : (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsLoginModalOpen(true);
                                }}
                                className={`text-lg z-10 bg-white pt-0 h-7 w-7 p-0 rounded-full border transition-all shadow-md text-gray-400 hover:text-red-500 hover:bg-gray-100`}
                              >
                                <GoHeartFill className="size-3.5" />
                              </Button>
                            )}
                          </div>
                          <h2 className="mt-2 font-bold text-gray-800 truncate text-sm">
                            {product.name}
                          </h2>
                          <div className="flex items-baseline justify-between mt-0.5">
                              <div className="flex items-baseline gap-1">
                                  <span className="text-base font-bold text-gray-900">
                                      Rs.
                                      {(
                                          product.price -
                                          (product.discountPercentage
                                              ? (product.price * (product.discountPercentage ?? 0)) / 100
                                              : product.discountedPrice)
                                      ).toFixed(0)}
                                  </span>
                                  {(product.discountedPrice ||
                                      product.discountPercentage > 0) && (
                                      <span className="text-xs text-gray-400 line-through">
                                          Rs.{(product.price).toFixed(0)}
                                      </span>
                                  )}
                              </div>
                              {/* Condensed Cart Logic for small card */}
                              {product.stock ?? 0 > 0 ? (
                                  item && item?.quantities > 0 ? (
                                      <div className="flex items-center space-x-0.5">
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-sm p-0 text-green-600 hover:bg-green-100"
                                              onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  decreaseCount(product.productId);
                                              }}
                                          >
                                              <BsDash className="size-4" />
                                          </Button>
                                          <p className="text-xs font-medium text-gray-700">{item.quantities}</p>
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-sm p-0 text-green-600 hover:bg-green-100"
                                              onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  increaseCount(product);
                                              }}
                                              disabled={item.quantities >= (item.stock || 1)}
                                          >
                                              <IoMdAdd className="size-4" />
                                          </Button>
                                      </div>
                                  ) : (
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-lg p-0 bg-green-600 text-white hover:bg-green-700 rounded-full shadow-md"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              user ? addtoCartByown(product) : setIsLoginModalOpen(true);
                                          }}
                                      >
                                          <IoMdAdd className="size-4" />
                                      </Button>
                                  )
                              ) : (
                                  <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  No related products found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default ProductDetails;