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
import { CartItem, Product } from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { BsDash } from "react-icons/bs";
import { FaAngleRight, FaChevronLeft } from "react-icons/fa";
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdOutlineMenuOpen, MdOutlineStar } from "react-icons/md";
import { RiMenuFold2Fill, RiSubtractFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { getUserFromCookies } from "../cookie/cookie";
import ProductCardLoading from "../loaidng/ProductLoading";
import { useModal } from "../providers/ModalStateProvider";
import { Button, buttonVariants } from "../ui/button";
import CategoriesBanner from "./CategoriesBanner";
import ProductsSidebar from "./ProductsSidebar";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";

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
        ? getDiscountPercent(product.price, product.discountedPrice)
        : 0;

    return (
      <Link
        href={`/homepage/products/${product.productId}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 block border border-gray-100 hover:border-orange-100"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-50">
          <Image
            src={
              `${NEXT_PUBLIC_CLOUDINARY_URL}${product?.imageUrls[0]}` ||
              "/placeholder.png"
            }
            alt={product.name || "Product image"}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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
        </div>

        {/* CONTENT */}
        <div className="p-4">
          {/* CATEGORY & RATING */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-orange-600 font-medium text-sm">
              {product.category?.name || "Category"}
            </span>
          </div>

          {/* PRODUCT NAME */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-700 transition-colors mb-2">
            {capitalizeFirstLetter(product.name || "")}
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
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M18 6h-2c0-2.206-1.794-4-4-4S8 3.794 8 6H6C3.794 6 2 7.794 2 10v10c0 2.206 1.794 4 4 4h12c2.206 0 4-1.794 4-4V10c0-2.206-1.794-4-4-4zM10 6c0-1.103.897-2 2-2s2 .897 2 2h-4zm10 14c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2V10c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2v10z" />
              </svg>
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full relative">
        {/* Sidebar */}
        <div>
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
        </div>

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
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8 mt-14">
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
                    return (
                      <ProductCard
                        key={product.productId}
                        product={product}
                        item={item}
                        isInWishlist={isInWishlist}
                      />
                    );
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
                    return (
                      <ProductCard
                        key={product.productId}
                        product={product}
                        item={item}
                        isInWishlist={isInWishlist}
                      />
                    );
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
