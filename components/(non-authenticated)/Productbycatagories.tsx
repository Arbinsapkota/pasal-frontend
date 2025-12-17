"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { capitalizeFirstLetter } from "@/lib/capital";
import { cn } from "@/lib/utils";
import {
  addToCart,
  CartItem,
  deleteFromCart,
  Product,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { memo, use, useEffect, useState } from "react";
import { BsDash } from "react-icons/bs";
import { FaAngleRight, FaChevronLeft, FaTag } from "react-icons/fa";
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdOutlineMenuOpen, MdOutlineStar } from "react-icons/md";
import { RiMenuFold2Fill, RiSubtractFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { getUserFromCookies } from "../cookie/cookie";
import ProductCardLoading from "../loaidng/ProductLoading";
import { useModal } from "../providers/ModalStateProvider";
import { Button, buttonVariants } from "../ui/button";
import CategoriesBanner from "./CategoriesBanner";
import ProductsSidebar from "./ProductsSidebar";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";
import { toast } from "react-toastify";
import { axiosAuthInstance } from "../axiosInstance";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlistSlice";
import { IoStar } from "react-icons/io5";
import { PiBagFill } from "react-icons/pi";

// Helper utility to calculate discount percentage
const getDiscountPercent = (price: number, discountedPrice: number): number => {
  if (discountedPrice >= price || price <= 0) return 0;
  const discount = ((price - discountedPrice) / price) * 100;
  return Math.round(discount);
};

interface SuperCategory {
  superCategoryId: string;
  name: string;
  categoryImageUrl: string;
}
interface Category {
  superCategory: SuperCategory;
  categoryId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Subcategory {
  subcategoryId: string;
  category: Category;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}
interface CategorySession {
  categoryId: string;
  categoryName: string;
}

const ProductbyCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [user, setUser] = useState<any>();
  const [sessionId, setSessionId] = useState<string>();
  const [sessionName, setSessionName] = useState<string>();

  console.log("Id", sessionId, "Name", sessionName);
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserFromCookies();
      setUser(userDetails);
    };
    fetchUserDetails();
  }, []);

  const [clickedId, setClickedId] = useState<string>("");
  const handleClick = (id: string) => {
    setClickedId(id);
    setTimeout(() => {
      setClickedId("");
    }, 100);
  };
  const useCartWishlist = () => {
    const dispatch = useDispatch();
    const items = useSelector((state: RootState) => state.cart.items);
    const wishlistItems = useSelector(
      (state: RootState) => state.wishlist.items
    );
    const user = getUserFromCookies();

    // CART HANDLER
    const updateCart = async (
      product: any,
      type: "ADD" | "INCREASE" | "DECREASE"
    ) => {
      if (!user) return toast.info("Please log in to manage your cart.");
      if (product.stock === 0) return toast.error("Product is out of stock!");

      const existingItem = items.find((i) => i.productId === product.productId);
      const currentQty = existingItem?.quantities || 0;
      const newQty =
        type === "ADD"
          ? 1
          : type === "INCREASE"
          ? currentQty + 1
          : currentQty - 1;

      if (newQty > product.stock)
        return toast.error(`Only ${product.stock} items available!`);

      try {
        const productForCart = {
          productId: product.productId,
          name: product.name,
          description: product.description || "",
          price: product.price,
          discountedPrice: product.discountedPrice || product.price,
          discountPercentage: product.discountPercentage || 0,
          imageUrls: product.imageUrls || [],
          rating: product.rating || 4.0,
          stock: product.stock,
          quantities: 1,
          wishlistId: product.wishlistId || null,
          variableNo: product.variableNo,
        };

        // REDUX UPDATE
        if (type === "ADD" || type === "INCREASE")
          dispatch(addToCart(productForCart));
        if (type === "DECREASE") {
          if (newQty <= 0) dispatch(deleteFromCart(product.productId));
          else dispatch(removeFromCart(product.productId));
        }

        // BACKEND CALL
        if (type === "ADD" || type === "INCREASE") {
          await axiosAuthInstance().post("/api/cart/add", {
            products: { productId: product.productId },
            quantity: 1,
          });
        }
        if (type === "DECREASE" && existingItem?.itemId) {
          if (newQty > 0) {
            await axiosAuthInstance().post("/api/cart/update", {
              itemId: existingItem.itemId,
              quantity: newQty,
            });
          } else {
            await axiosAuthInstance().delete("/api/cart/remove", {
              params: { productId: product.productId },
            });
          }
        }
      } catch (error) {
        console.error("Cart update error:", error);
        toast.error("Failed to update cart. Please try again.");
      }
    };

    // WISHLIST HANDLER
    const toggleWishlist = async (product: any) => {
      if (!user) return toast.info("Please log in first.");
      const isLiked = wishlistItems.some(
        (i) => i.productId === product.productId
      );

      try {
        if (isLiked) {
          dispatch(removeFromWishlist(product.productId));
          await axiosAuthInstance().delete("/api/wishlist/", {
            params: { productId: product.productId },
          });
          toast.success("Removed from wishlist");
        } else {
          dispatch(addToWishlist(product));
          await axiosAuthInstance().post("/api/wishlist/", {
            product: { productId: product.productId },
          });
          toast.success("Added to wishlist");
        }
      } catch {
        toast.error("Failed to update wishlist.");
      }
    };

    return { items, wishlistItems, updateCart, toggleWishlist };
  };

  interface ProductCardProps {
    product: any;
  }
  // -----------------------------------------------
  const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
    const { items, wishlistItems, updateCart, toggleWishlist } =
      useCartWishlist();

    const cartItem = items.find((c) => c.productId === product.productId);
    const qty = cartItem ? cartItem.quantities : 0;

    // ---- FIXED DISCOUNT LOGIC ----
    const discountAmount =
      product.discountPercentage && product.discountPercentage > 0
        ? (product.price * product.discountPercentage) / 100
        : product.discountedPrice && product.discountedPrice < product.price
        ? product.price - product.discountedPrice
        : 0;

    const priceAfterDiscount = product.price - discountAmount;
    const totalPrice = qty * priceAfterDiscount;

    const discountPercentDisplay =
      product.discountPercentage && product.discountPercentage > 0
        ? product.discountPercentage
        : discountAmount > 0
        ? Math.round((discountAmount / product.price) * 100)
        : 0;

    const renderStars = (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      for (let i = 0; i < 5; i++) {
        stars.push(
          <IoStar
            key={i}
            className={`w-3 h-3 ${
              i < fullStars ? "text-orange-400 fill-current" : "text-gray-300"
            }`}
          />
        );
      }
      return stars;
    };

    const isLiked = wishlistItems.some(
      (i) => i.productId === product.productId
    );

    return (
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-100">
        <Link
          href={`/homepage/products/${product.productId}`}
          className="block"
        >
          <div className="relative w-full aspect-square overflow-hidden bg-gray-50 h-40">
            {product.imageUrls?.[0] ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product.imageUrls[0]}`}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {discountPercentDisplay > 0 && (
              <div className="absolute top-3 left-3">
                <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-md shadow-md">
                  Save {discountPercentDisplay}%
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-sm mb-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <FaTag className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 ml-1">
                  {product.subcategoryName || "General"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(product.rating || 4.0)}
                <span className="text-xs text-gray-500 ml-1">
                  ({(product.rating || 4.0).toFixed(1)})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                Rs {Math.round(priceAfterDiscount)}
              </span>
              {discountAmount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  Rs {Math.round(product.price)}
                </span>
              )}
            </div>
          </div>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-lg z-10 transition-all duration-200 ${
            isLiked
              ? "bg-red-500 text-white"
              : "bg-white text-gray-600 hover:text-red-500"
          }`}
        >
          <GoHeartFill className="text-lg" />
        </button>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 mb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateCart(product, "DECREASE")}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              >
                <RiSubtractFill className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => updateCart(product, "INCREASE")}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              >
                <IoMdAdd className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-base font-bold text-gray-900">
                Rs {Math.round(totalPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={() => updateCart(product, "ADD")}
            className="w-full py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-sm hover:shadow-md"
          >
            <PiBagFill className="text-lg" /> Add To Cart
          </button>
        </div>
      </div>
    );
  });
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string[]>([]);
  const [selectedSubCategoryDetails, setSelectedSubCategoryDetails] = useState<
    Subcategory[]
  >([]);

  // Cart and wishlist states
  const [storeItems, setStoreItems] = useState<CartItem[]>(items);
  const { increaseCount, decreaseCount, toggleWishlist, addtoCartByown } =
    useCart({
      storeItems,
      setStoreItems,
    });

  const { setIsLoginModalOpen } = useModal();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const removeSubCat = (subCategory: Subcategory) => {
    setSelectedSubCategoryDetails((prev) =>
      prev.filter((subCat) => subCat.subcategoryId != subCategory.subcategoryId)
    );
    setSelectedSubCategory((prev) =>
      prev.filter((subCatId) => subCatId != subCategory?.subcategoryId)
    );
  };

  // Handle sorting
  const handleSortChange = (sortOption: string) => {
    setSortOption(sortOption);
    const sortedProducts = [...products];

    switch (sortOption) {
      case "priceLowToHigh":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "nameAsc":
        sortedProducts.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;
      case "nameDesc":
        sortedProducts.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
        break;
      default:
        break;
    }

    setProducts(sortedProducts);
  };

  const [activeFilters, setActiveFilters] = useState<
    { name: string; style: string }[]
  >([]);

  const handleClearAllFilters = () => {
    setSelectedSubCategory([]);
    setSelectedSubCategoryDetails([]);
    setActiveFilters([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="flex w-full relative">
        {/* Sidebar */}
        
          <ProductsSidebar
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
            categories={categories}
            setCategories={setCategories}
            allProducts={allProducts}
            setSelectedSubCategoryDetails={setSelectedSubCategoryDetails}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setSelectedCategoryId={setSelectedCategoryId}
            setProducts={setProducts}
            setAllProducts={setAllProducts}
            setIsUpdated={setIsUpdated}
            selectedCategoryId={selectedCategoryId}
            loading={loading}
            setLoading={setLoading}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        
        {/* Main Content */}
        <div className={`flex-1 ${isSidebarOpen ? "sm:pl-64" : ""} w-full`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Floating Sidebar Toggle */}
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                `fixed z-50 top-24   transition-all duration-300`,
                isSidebarOpen ? "left-44 -mt-8" : "left-4"
              )}
              variant={"outline"}
            >
              {isSidebarOpen ? (
                <MdOutlineMenuOpen className="text-lg" />
              ) : (
                <RiMenuFold2Fill className="text-lg" />
              )}
            </Button>

            {/* HEADER SECTION */}

            {/* ACTIVE FILTERS SECTION */}
            {(selectedSubCategoryDetails.length > 0 ||
              activeFilters.length > 0) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-700 font-medium text-sm">
                    Active Filters:
                  </span>

                  {/* Subcategory Filters */}
                  {selectedSubCategoryDetails.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                    >
                      <span>{cat?.name}</span>
                      <button
                        onClick={() => removeSubCat(cat)}
                        className="ml-1 hover:text-orange-200 transition-colors"
                      >
                        <IoMdClose className="text-base" />
                      </button>
                    </div>
                  ))}

                  {/* Other Active Filters */}
                  {activeFilters.map((filter, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${filter.style}`}
                    >
                      {filter.name}
                      <button
                        className="ml-1 hover:opacity-80 transition-opacity"
                        onClick={() =>
                          setActiveFilters((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <IoMdClose className="text-base" />
                      </button>
                    </div>
                  ))}

                  {/* Clear All Button */}
                  <Button
                    variant="link"
                    className="text-orange-600 hover:text-orange-700 text-sm font-semibold p-0 h-auto ml-2"
                    onClick={handleClearAllFilters}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {loading || isLoading || !isUpdated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardLoading key={index} />
                ))}
              </div>
            ) : selectedCategoryId || selectedSubCategory.length > 0 ? (
              products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const item = items.find(
                      (item: any) => item.productId === product.productId
                    );
                    const isInWishlist = wishlistItems.some(
                      (item: any) => item.productId === product.productId
                    );
                    return <ProductCard product={product} />;
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or browse different categories.
                  </p>
                  <Button
                    onClick={handleClearAllFilters}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              )
            ) : (
              <>
                {/* ALL PRODUCTS SECTION */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-10">
                    All Products
                  </h2>
                  <p className="text-gray-600">
                    Browse our complete collection
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product: any) => {
                    const item = items.find(
                      (item: any) => item.productId === product.productId
                    );
                    const isInWishlist = wishlistItems.some(
                      (item: any) => item.productId === product.productId
                    );
                    return <ProductCard product={product} />;
                  })}
                </div>

                {/* PAGINATION */}
                {allProducts.length > productsPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaChevronLeft className="mr-2" />
                      Previous
                    </Button>

                    <span className="text-sm text-gray-600 px-4">
                      Page {currentPage} of{" "}
                      {Math.ceil(allProducts.length / productsPerPage)}
                    </span>

                    <Button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          prev < Math.ceil(allProducts.length / productsPerPage)
                            ? prev + 1
                            : prev
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(allProducts.length / productsPerPage)
                      }
                      className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                      <FaAngleRight className="ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductbyCategories;
