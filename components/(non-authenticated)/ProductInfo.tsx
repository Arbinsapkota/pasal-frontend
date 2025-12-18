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
import { Badge, Rating } from "@mui/material";
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
import { CiShop } from "react-icons/ci";
import { Star } from "lucide-react";
import { FiShare2 } from "react-icons/fi";
import { Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaViber } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BiSolidCategoryAlt } from "react-icons/bi";
const TextEditorReadOnly = dynamic(
  () => import("./textEditor/TextEditorReadOnly"),
  {
    ssr: false,
  }
);

interface ModalProps {
  productId: string;
}

interface ProductAttribute {
  [key: string]: string;
}

interface ProductVariable {
  attribute: string | ProductAttribute;
  price: number;
  discountedPrice?: number;
  stock: number;
  variableNo?: string;
  imgUrl?: string[];
}

interface ExtendedProduct extends Product {
  productImages?: { [key: string]: string };
  variables?: ProductVariable[];
  averageRating?: number;
  ratingUserCount?: number;
  shortDescription?: string;
  shopName?: string;
  vendorId?: string;
  status?: number;
  stock: number;
  productName?: string;
  categoryName?: string;
  labelImgUrl?: string;
  subcategory?: string;
}

const ProductDetails: React.FC<ModalProps> = ({ productId }) => {
  const [product, setProduct] = useState<ExtendedProduct>();
  const [products, setProducts] = useState<Product[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecLoading, setIsRecLoading] = useState<boolean>(true);
  const { setIsLoginModalOpen } = useModal();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] =
    useState<ProductAttribute>({});
  const [matchedVariants, setMatchedVariants] =
    useState<ProductVariable | null>(null);
  const [firstAttribute, setFirstAttribute] = useState<ProductAttribute | null>(
    null
  );
  const [attributeMapped, setAttributeMapped] = useState<
    Record<string, ProductVariable>
  >({});
  const [vendorDetails, setVendorDetails] = useState<any>(null);
  const [quantity, setQuantity] = useState(0);

  // Share functionality
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=Check out this product: ${window?.location?.href}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${window?.location?.href}`,
    twitter: `https://twitter.com/intent/tweet?url=${window?.location?.href}&text=Check out this product`,
    viber: `viber://forward?text=${window?.location?.href}`,
  };

  const handleShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
    setIsSharePopoverOpen(false);
  };

  // Check screen size for zoom
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Mouse move handler for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const normalizeAttribute = (attr: ProductAttribute) => {
    return JSON.stringify(
      Object.keys(attr)
        .sort()
        .reduce((obj: ProductAttribute, key) => {
          obj[key] = attr[key];
          return obj;
        }, {})
    );
  };

  // Get cart items from Redux
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = getUserFromCookies();
  const router = useRouter();

  // Fetch product data
  useEffect(() => {
    axiosInstance()
      .get("/api/product/", {
        params: {
          productId,
        },
      })
      .then((res) => {
        const productData: ExtendedProduct = res.data;
        setProduct(productData);

        // Set default selected image
        if (
          productData.productImages &&
          Object.keys(productData.productImages).length > 0
        ) {
          setSelectedImage(
            Object.values(productData.productImages)[0] as string
          );
        }

        // Parse variables and create attribute mapping
        if (productData.variables?.length) {
          const attrMap: Record<string, ProductVariable> = {};
          productData.variables.forEach((variant) => {
            const attrObj: ProductAttribute =
              typeof variant.attribute === "string"
                ? JSON.parse(variant.attribute)
                : variant.attribute || {};
            const normalized = normalizeAttribute(attrObj);
            attrMap[normalized] = variant;

            // Set first attribute structure
            if (!firstAttribute) {
              setFirstAttribute(attrObj);
            }
          });
          setAttributeMapped(attrMap);
        }

        setIsLoading(false);

        // Fetch vendor details
        if (productData.vendorId) {
          axiosInstance()
            .get(`/api/vendor/${productData.vendorId}`)
            .then((vendorRes) => {
              setVendorDetails(vendorRes.data);
            })
            .catch((err) => {
              console.error("Error fetching vendor details", err);
            });
        }
      })
      .catch((err) => {
        console.error("Error fetching product", err);
        setIsLoading(false);
      });
  }, [productId]);

  // Fetch related products
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

  // Update quantity from cart items
  useEffect(() => {
    if (product) {
      const item = items.find((item) => item.productId === product.productId);
      setQuantity(item?.quantities || 0);
    }
  }, [items, product]);

  // Simplified cart handler
  const handleAddToCart = useCallback(async (
    product: ExtendedProduct,
    action: 'add' | 'increment' | 'decrement'
  ) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Find existing item in cart
    const cartItem = items.find(item => item.productId === product.productId);
    
    // Calculate price
    const itemPrice = product.price;
    const discountAmount = product.discountedPrice || 0;
    const finalPrice = itemPrice - discountAmount;

    try {
      let newQuantity = 1;
      
      if (action === 'increment' && cartItem) {
        newQuantity = cartItem.quantities + 1;
        // Update via API
        await axiosAuthInstance().post("/api/cart/update", {
          itemId: cartItem.itemId,
          quantity: newQuantity
        });
      } 
      else if (action === 'decrement' && cartItem) {
        newQuantity = cartItem.quantities - 1;
        if (newQuantity === 0) {
          // Remove item
          await axiosAuthInstance().delete(
            `/api/cart/remove?productId=${cartItem.productId}`
          );
        } else {
          // Update quantity
          await axiosAuthInstance().post("/api/cart/update", {
            itemId: cartItem.itemId,
            quantity: newQuantity
          });
        }
      }
      else if (action === 'add') {
        // Add new item
        await axiosAuthInstance().post("/api/cart/add", {
          products: { productId: product.productId },
          quantity: 1
        });
        newQuantity = 1;
      }

      // Update Redux state
      const productToUpdate = {
        ...product,
        itemId: cartItem?.itemId,
        price: finalPrice,
        discountedPrice: discountAmount,
        discountPercentage: product.discountPercentage || 0,
        name: product.productName || product.name || '',
        imageUrls: product.productImages ? 
          Object.values(product.productImages) : 
          (product.imageUrls || [])
      };

      if (action === 'decrement' && newQuantity === 0) {
        dispatch(removeFromCart(product.productId));
      } else if (action === 'increment' || action === 'decrement') {
        dispatch({
          type: 'cart/setQuantity',
          payload: { 
            productId: product.productId, 
            quantity: newQuantity 
          }
        });
      } else {
        dispatch(addToCart(productToUpdate));
      }

      if (action === 'add') {
        toast.success("Added to cart!");
      }

    } catch (error) {
      console.error("Cart operation failed:", error);
      toast.error("Failed to update cart");
    }
  }, [user, items, dispatch, setIsLoginModalOpen]);

  // Wishlist function
  const wishlistApi = useDebouncedCallback(
    (product: ExtendedProduct, action: "add" | "remove") => {
      const endpoint = action === "add" ? "/api/wishlist/" : "/api/wishlist/";

      if (action === "add") {
        axiosAuthInstance()
          .post(endpoint, { product: { productId: product.productId } })
          .catch(() => {
            toast.error(`Error adding to favorite.`);
          });
      } else {
        axiosAuthInstance()
          .delete(endpoint, { params: { productId: product.productId } })
          .catch(() => {
            // Handle error
          });
      }
    }
  );

  const toggleWishlist = (product: ExtendedProduct, isAdded: boolean) => {
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

  const handleBuyNow = (product: ExtendedProduct) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const itemPrice = product.price;
    const discountAmount = product.discountedPrice || 0;
    const finalPrice = itemPrice - discountAmount;

    // Prepare product details for checkout
    const checkoutItem = {
      discountPercentage: product.discountPercentage,
      productId: product.productId,
      name: product.name,
      quantity: 1,
      price: finalPrice,
      imageUrl:
        selectedImage ||
        (Object.values(product.imageUrls || {})[0] as string) ||
        "/product.png",
    };

    // Navigate to checkout with product details
    router.push(
      `/checkout?items=${encodeURIComponent(JSON.stringify([checkoutItem]))}`
    );
  };

  if (isLoading || !product) {
    return <LoadingContent />;
  }

  const fallbackImage = "/product.png";
  const cleaned = product?.description?.replace(/^,/, "");

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Breadcrumb */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={"/homepage/products"}
            className="text-gray-600 hover:text-gray-900"
          >
            Products
          </Link>
          <FaChevronRight className="text-gray-400 text-xs" />
          <span className="text-gray-900">
            {product?.productName || product?.name}
          </span>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 mt-12 mb-10">
        {/* Product Images Section */}
        <div className="">
          {/* Main Product Image */}
          <Card className="relative sm:h-[26rem] w-auto bg-muted overflow-hidden">
            <Image
              src={
                `${NEXT_PUBLIC_CLOUDINARY_URL}${selectedImage ||
                (product?.imageUrls
                  ? typeof Object.values(product.imageUrls)[0] === "string"
                    ? Object.values(product.imageUrls)[0]
                    : fallbackImage
                  : fallbackImage)}`
              }
              alt={product?.productName || "Product Image"}
              height={800}
              width={800}
              className="sm:h-full w-full h-[40vh] object-contain cursor-zoom-in"
              onMouseEnter={() => !isSmallScreen && setIsZoomVisible(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => !isSmallScreen && setIsZoomVisible(false)}
            />
          </Card>

          {/* Thumbnails */}
          <div
            className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 w-full"
            style={{ scrollbarWidth: "thin" }}
          >
            {(() => {
              const allImages = new Set<string>();

              // Add base product images
              Object.values(product?.imageUrls || {}).forEach((imgUrl) => {
                if (typeof imgUrl === "string") allImages.add(imgUrl);
              });

              // Add variation images
              product?.variables?.forEach((variation) => {
                if (variation.imgUrl && Array.isArray(variation.imgUrl)) {
                  variation.imgUrl.forEach((img) => allImages.add(img));
                }
              });

              let imagesArray = Array.from(allImages);

              if (
                matchedVariants?.imgUrl &&
                Array.isArray(matchedVariants.imgUrl) &&
                matchedVariants.imgUrl.length > 0
              ) {
                imagesArray = matchedVariants.imgUrl;
              }

              return imagesArray.length > 0 ? (
                imagesArray.map((imageUrl, index) => (
                  <Card
                    key={index}
                    className={`min-w-24 h-24 flex items-center justify-center cursor-pointer border p-2 transition-colors duration-200 ${
                      selectedImage === imageUrl
                        ? "border-green-500"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <Image
                      src={`${NEXT_PUBLIC_CLOUDINARY_URL}${imageUrl}`}
                      alt={`${product?.productName || "Product"} - ${
                        index + 1
                      }`}
                      height={96}
                      width={96}
                      className="w-full h-full object-contain"
                    />
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-4">
                  No images available
                </p>
              );
            })()}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="relative">
          {isZoomVisible && !isSmallScreen ? (
            <div className="absolute w-full h-full rounded overflow-hidden bg-white pointer-events-none z-10">
              <div
                className="w-full h-full bg-no-repeat bg-cover transition-all duration-100"
                style={{
                  backgroundImage: `url(${NEXT_PUBLIC_CLOUDINARY_URL}${
                    selectedImage ||
                    Object.values(product?.imageUrls || {})[0] ||
                    fallbackImage
                  })`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: "200%",
                }}
              ></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex justify-between">
                <div className="flex flex-col gap-4">
                  <Link
                    href={`/store/${vendorDetails?.username}`}
                    className="flex gap-0.5 text-primary"
                  >
                    <BiSolidCategoryAlt size={22} />
                    {product?.categoryName || ""}
                  </Link>
                  <h1 className="text-2xl font-semibold">
                    {product?.name || "Product Name"}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-1 py-0.5 rounded-lg">
                      <Star
                        size={12}
                        className="fill-yellow-500 text-yellow-500"
                      />
                      <span className="font-semibold text-sm text-black dark:text-yellow-100">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product?.ratingUserCount || 0} Ratings
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-primary text-xl">
                      Rs{" "}
                      {selectedAttributes && matchedVariants?.price
                        ? (
                            matchedVariants.price -
                            (matchedVariants.discountedPrice || 0)
                          ).toLocaleString("en-IN")
                        : Math.round(
                            product?.price -
                              (product?.price *
                                (product.discountPercentage || 0)) /
                                100
                          ).toLocaleString("en-IN")}
                    </p>

                    {/* Original Price */}
                    <p className="text-lg text-muted-foreground line-through">
                      Rs{" "}
                      {selectedAttributes && matchedVariants?.price
                        ? (matchedVariants?.price).toLocaleString("en-IN")
                        : product?.price
                        ? (product?.price).toLocaleString("en-IN")
                        : null}
                    </p>
                    <Badge>
                      <span>
                        {Math.round(product.discountPercentage || 20)}%{" "}
                      </span>{" "}
                      <span> OFF</span>
                    </Badge>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-start">
                  {product?.stock > 5 ? (
                    <Button
                      variant="outline"
                      className="font-semibold cursor-default lg:w-32 w-20 bg-primary/10 text-primary border-primary hover:bg-primary/20 hover:text-primary"
                    >
                      In Stock
                    </Button>
                  ) : product?.stock > 0 ? (
                    <Button
                      variant="outline"
                      className="font-semibold cursor-default lg:w-32 w-20 bg-red-500/10 text-red-500 border-red-500 hover:bg-red-500/20 hover:text-red-500"
                    >
                      Low in Stock
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="font-semibold cursor-default lg:w-32 w-20 text-gray-500"
                    >
                      Out of Stock
                    </Button>
                  )}
                </div>
              </div>

              {/* Variations */}
              <div className="">
                {!!product.variables?.length
                  ? (() => {
                      const attributeMap: Record<string, string[]> = {};

                      product.variables.forEach((variation) => {
                        const attrObj: ProductAttribute =
                          typeof variation.attribute === "string"
                            ? JSON.parse(variation.attribute)
                            : variation.attribute || {};

                        Object.entries(attrObj).forEach(([key, value]) => {
                          if (!attributeMap[key]) {
                            attributeMap[key] = [];
                          }
                          if (!attributeMap[key].includes(value)) {
                            attributeMap[key].push(value);
                          }
                        });
                      });

                      const handleSelect = (key: string, value: string) => {
                        let updatedAttributes = {
                          ...selectedAttributes,
                          [key]: value,
                        };

                        // Find possible variants
                        const possibleVariants =
                          product.variables?.filter((variant) => {
                            const attrObj =
                              typeof variant.attribute === "string"
                                ? JSON.parse(variant.attribute)
                                : variant.attribute;

                            return Object.entries(updatedAttributes).every(
                              ([k, v]) => attrObj[k] === v
                            );
                          }) || [];

                        // Collect all attribute keys
                        const allAttrKeys = new Set<string>();
                        possibleVariants.forEach((variant) => {
                          const attrObj =
                            typeof variant.attribute === "string"
                              ? JSON.parse(variant.attribute)
                              : variant.attribute;
                          Object.keys(attrObj).forEach((k) =>
                            allAttrKeys.add(k)
                          );
                        });

                        // Filter attributes
                        updatedAttributes = Object.fromEntries(
                          Object.entries(updatedAttributes).filter(([k]) =>
                            allAttrKeys.has(k)
                          )
                        );

                        // Auto-select single possible values
                        const requiredKeys = Object.keys(firstAttribute || {});
                        requiredKeys.forEach((attrKey) => {
                          if (!updatedAttributes[attrKey]) {
                            const possibleValues = [
                              ...new Set(
                                possibleVariants.map((variant) => {
                                  const attrObj =
                                    typeof variant.attribute === "string"
                                      ? JSON.parse(variant.attribute)
                                      : variant.attribute;
                                  return attrObj[attrKey];
                                })
                              ),
                            ];

                            if (possibleValues.length === 1) {
                              updatedAttributes[attrKey] = possibleValues[0];
                            }
                          }
                        });

                        setSelectedAttributes(updatedAttributes);

                        // Find matched variant
                        const matched =
                          attributeMapped[
                            normalizeAttribute(updatedAttributes)
                          ];
                        setMatchedVariants(matched || null);
                      };

                      return (
                        <div className="flex flex-col mb-6 gap-4">
                          {Object.entries(attributeMap).map(
                            ([key, values]) =>
                              key.toLowerCase() !== "color_hex" && (
                                <div
                                  key={key}
                                  className={`${key === "size" && "order-10"}`}
                                >
                                  <p className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">
                                    {key}
                                    {selectedAttributes?.[key] && (
                                      <span className="ml-2 font-normal text-orange-bg-orange-500">
                                        {selectedAttributes?.[key]}
                                      </span>
                                    )}
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {[...values].map((value, i) => {
                                      const isSelected =
                                        selectedAttributes?.[key] === value;
                                      const isColorAttribute =
                                        key.toLowerCase() === "color";

                                      return (
                                        <button
                                          key={i}
                                          onClick={() =>
                                            handleSelect(key, value)
                                          }
                                          className={`flex items-center justify-center border rounded-sm min-w-10 min-h-8 ${
                                            isSelected
                                              ? "border-orange-bg-orange-500 ring-1 ring-orange-bg-orange-500"
                                              : ""
                                          } ${
                                            isColorAttribute
                                              ? ""
                                              : "bg-muted px-1.5 "
                                          }`}
                                          title={value}
                                        >
                                          {isColorAttribute ? (
                                            <div
                                              style={{
                                                backgroundColor:
                                                  attributeMap?.["color_hex"]?.[
                                                    i
                                                  ].toLowerCase(),
                                              }}
                                              className="rounded-full size-6 border-black border-[0.5px]"
                                              title={value}
                                            ></div>
                                          ) : (
                                            value
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      );
                    })()
                  : null}
              </div>

              {/* Quantity and Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 flex-wrap">
                  {product?.stock > 0 ? (
                    quantity && quantity > 0 ? (
                      <div className="flex items-center border rounded-full overflow-hidden w-36">
                        <Button
                          variant="ghost"
                          className="rounded-none h-10 w-10 hover:bg-gray-100"
                          onClick={() => handleAddToCart(product, 'decrement')}
                          disabled={quantity <= 1}
                        >
                          <RiSubtractFill />
                        </Button>
                        <div className="flex-1 text-center font-medium">
                          {quantity}
                        </div>
                        <Button
                          variant="ghost"
                          className="rounded-none h-10 w-10 hover:bg-gray-100"
                          onClick={() => handleAddToCart(product, 'increment')}
                          disabled={quantity >= product.stock}
                        >
                          <IoMdAdd />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="flex items-center gap-1 w-36 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleAddToCart(product, 'add')}
                      >
                        <IoMdAdd />
                        Add to Cart
                      </Button>
                    )
                  ) : (
                    <Button
                      disabled
                      className="w-36 bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      Out of Stock
                    </Button>
                  )}

                  {/* Wishlist Button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-orange-500/5 text-orange-bg-orange-500 hover:bg-orange-500/10 border-orange-bg-orange-500 dark:bg-orange-500/15"
                    onClick={() => {
                      if (user) {
                        toggleWishlist(
                          product,
                          wishlistItems.some(item => item.productId == product.productId)
                        );
                      } else {
                        setIsLoginModalOpen(true);
                      }
                    }}
                  >
                    {wishlistItems.some(item => item.productId == product.productId) ? (
                      <>
                        <FaHeart
                          size={16}
                          className="text-orange-bg-orange-500 w-6 fill-orange-bg-orange-500"
                        />
                      </>
                    ) : (
                      <>
                        <CiHeart
                          size={20}
                          className="w-6 text-orange-bg-orange-500"
                        />
                      </>
                    )}
                  </Button>

                  {/* Share Button */}
                  <Popover
                    open={isSharePopoverOpen}
                    onOpenChange={setIsSharePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <FiShare2 className="sm:mr-2" />
                        <span className="sm:block hidden"> Share</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-auto sm:gap-0 gap-0 sm:p-1 p-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Whatsapp"
                        onClick={() => handleShare(shareLinks.whatsapp)}
                      >
                        <FaWhatsapp className="text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Facebook"
                        onClick={() => handleShare(shareLinks.facebook)}
                      >
                        <FaFacebookF className="text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Twitter"
                        onClick={() => handleShare(shareLinks.twitter)}
                      >
                        <FaTwitter className="text-sky-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Viber"
                        onClick={() => handleShare(shareLinks.viber)}
                      >
                        <FaViber className="text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyLink}
                        title="Copy Link"
                        className="text-gray-400"
                      >
                        <Copy size={20} />
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  className="w-[330px] h-10 bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() =>
                    user ? handleBuyNow(product) : setIsLoginModalOpen(true)
                  }
                >
                  Buy Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Tabs defaultValue="Product" className="w-full mx-auto my-6 p-0">
        <TabsList className="flex justify-center bg-white dark:bg-black rounded-none p-1 mb-4 overflow-hidden border-b dark:border-gray-700">
          <TabsTrigger
            value="Product"
            className="px-6 py-2 rounded-none data-[state=active]:text-blue-400  transition-colors data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-400 "
          >
            Product Description
          </TabsTrigger>
          <TabsTrigger
            value="Reviews"
            className="px-6 py-2 rounded-none data-[state=active]:text-blue-400  transition-colors data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-400 "
          >
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="Product"
          className="bg-white dark:bg-black rounded-none shadow-none w-full"
        >
          <div className="">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <div className="prose max-w-none">
              {product?.description?.includes(",[{") ? (
                <TextEditorReadOnly value={cleaned} />
              ) : (
                <p className="text-gray-600">{product.description}</p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="Reviews"
          className="bg-white dark:bg-black rounded-none shadow-none w-full"
        >
          {" "}
          <div className="border-t p-6">
            <ShowReview productId={product.productId} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Nutritional Facts */}
      {product?.labelImgUrl && (
        <div className="border-t p-6">
          <h3 className="text-lg font-semibold mb-4">Nutritional Facts</h3>
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer w-fit">
                <Image
                  src={`${NEXT_PUBLIC_CLOUDINARY_URL}${product?.labelImgUrl}`}
                  alt="Label"
                  width={120}
                  height={120}
                  className="rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <IoEye className="text-white text-xl" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nutritional Facts</DialogTitle>
              </DialogHeader>
              <Image
                src={`${NEXT_PUBLIC_CLOUDINARY_URL}${product?.labelImgUrl}`}
                alt="Label"
                width={600}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Related Products */}
      <div className="border-t p-6">
        <h2 className="text-lg font-semibold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isRecLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ProductCardLoading key={index} />
            ))
          ) : products ? (
            products.slice(0, 5).map((relatedProduct, index) => {
              const relatedItem = items.find(
                (item) => item.productId == relatedProduct.productId
              );
              const isWishlisted = wishlistItems.find(
                (item) => item.productId == relatedProduct.productId
              );

              return (
                <Link
                  key={index}
                  href={`/homepage/products/${relatedProduct.productId}`}
                  className="group"
                >
                  <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-gray-50 rounded-lg mb-3">
                      {((relatedProduct.discountedPrice > 0 &&
                        relatedProduct.price >
                          relatedProduct.discountedPrice) ||
                        relatedProduct.discountPercentage > 0) && (
                        <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-1 rounded z-10">
                          {relatedProduct.discountPercentage ||
                            Math.round(
                              ((relatedProduct.price -
                                (relatedProduct.discountedPrice || 0)) /
                                relatedProduct.price) *
                                100
                            )}
                          % OFF
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-2 right-2 h-7 w-7 p-0 rounded-full z-10 ${
                          isWishlisted
                            ? "bg-red-500 text-white"
                            : "bg-white/80 text-gray-600"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          user
                            ? toggleWishlist(
                                relatedProduct as ExtendedProduct,
                                isWishlisted != undefined
                              )
                            : setIsLoginModalOpen(true);
                        }}
                      >
                        <GoHeartFill className="text-xs" />
                      </Button>

                      <Image
                        src={
                          `${NEXT_PUBLIC_CLOUDINARY_URL}${relatedProduct.imageUrls?.[0]}` ||
                          "/product.png"
                        }
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain p-2"
                        fill
                      />
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-gray-900">
                          Rs.{" "}
                          {(
                            relatedProduct.price -
                            (relatedProduct.discountPercentage
                              ? (relatedProduct.price *
                                  (relatedProduct.discountPercentage ?? 0)) /
                                100
                              : relatedProduct.discountedPrice || 0)
                          ).toFixed(0)}
                        </span>
                        {(relatedProduct.discountedPrice ||
                          relatedProduct.discountPercentage > 0) && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            Rs. {relatedProduct.price.toFixed(0)}
                          </span>
                        )}
                      </div>

                      {(relatedProduct.stock ?? 0) > 0 ? (
                        relatedItem?.quantities &&
                        relatedItem.quantities > 0 ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(relatedProduct as ExtendedProduct, 'decrement');
                              }}
                            >
                              <BsDash className="text-xs" />
                            </Button>
                            <span className="text-xs w-4 text-center">
                              {relatedItem?.quantities}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(relatedProduct as ExtendedProduct, 'increment');
                              }}
                            >
                              <IoMdAdd className="text-xs" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-gray-900 text-white hover:bg-gray-800 rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              user
                                ? handleAddToCart(relatedProduct as ExtendedProduct, 'add')
                                : setIsLoginModalOpen(true);
                            }}
                          >
                            <IoMdAdd className="text-xs" />
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-red-500">
                          Out of Stock
                        </span>
                      )}
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
  );
};

export default ProductDetails;