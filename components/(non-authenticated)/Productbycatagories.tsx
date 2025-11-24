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

// Helper utility to calculate discount percentage (corrected logic)
const getDiscountPercent = (price: number, discountedPrice: number): number => {
  if (discountedPrice >= price || price <= 0) return 0;
  const discount = ((price - discountedPrice) / price) * 100;
  return Math.round(discount);
};

// ... Interface definitions remain the same
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

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    // Correct formula:
    const discount = ((price - discountedPrice) / price) * 100;
    return Math.round(discount);
  };

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

  // Mock Active Filter data for the header (based on image_e8f7a4.png)
  const MOCK_ACTIVE_FILTERS: { name: string; style: string }[] = [
    // { name: "Price : $25.00 - $125.00", style: "bg-yellow-500 text-gray-800" },
    // { name: "5 Star", style: "bg-yellow-500 text-gray-800" },
    // { name: "In Stock", style: "bg-green-700 text-white" },
  ];
  const [activeFilters, setActiveFilters] = useState(MOCK_ACTIVE_FILTERS);

  const handleClearAllFilters = () => {
    setSelectedSubCategory([]);
    setSelectedSubCategoryDetails([]);
    setActiveFilters([]);
    // You would also reset Price, Review, Brand states here
  };

  // New function to render the clean product card (UPDATED FOR SMALLER SIZE)
  const renderProductCard = (
    product: Product,
    item: CartItem | undefined,
    isInWishlist: boolean
  ) => {
    // Determine the final price and discount percent
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
        key={product.productId}
        // Reduced padding to p-2 for slightly smaller card
        className="p-2 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 group relative"
      >
        <div className="relative aspect-square w-full">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-0 left-0 z-50">
              {/* Smaller discount text */}
              <h1 className="text-xs px-2 py-0.5 bg-green-700 text-white font-semibold rounded-br-lg rounded-tl-xl">
                {discountPercent}% off
              </h1>
            </div>
          )}

          {/* Product Image */}
          <Image
            src={
              `${NEXT_PUBLIC_CLOUDINARY_URL}${product?.imageUrls[0]}` ||
              "/placeholder.png"
            }
            alt={product.name || "Product image"}
            className="object-contain w-full h-full p-2"
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
          />

          {/* Wishlist Button */}
          <div className="absolute top-1 right-1 flex">
            <Button
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
              // Smaller heart button
              className={cn(
                "text-base p-1.5 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 transition-colors hover:bg-gray-50",
                isInWishlist ? "text-red-500" : "text-gray-400"
              )}
            >
              <GoHeartFill />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-0.5">
          {/* Category & Rating (Smaller text) */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-green-700 font-medium">
              {product.category?.name || "Fruits"}
            </span>
            <div className="flex items-center gap-0.5">
              <MdOutlineStar className="text-yellow-500 text-sm" />
              <span className="font-medium text-gray-800">
                {product?.rating?.toFixed(1) || "4.8"}
              </span>
            </div>
          </div>

          {/* Name (Smaller text) */}
          <h2 className="font-semibold text-base text-gray-800 truncate hover:text-green-700 transition">
            {capitalizeFirstLetter(product.name || "")}
          </h2>

          {/* REMOVED: Weight/Gram text */}
          {/* <p className="text-sm text-gray-500 mb-2">{productSize}</p> */}

          {/* Price and Add Button (Smaller) */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col items-start gap-0.5">
              {/* Smaller price text */}
              <span className="text-lg font-semibold text-gray-800">
                Rs.{finalPrice.toFixed(0)}
              </span>
              {isDiscounted && (
                <span className="text-xs text-gray-400 line-through">
                  Rs.{product.price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Add/Quantity Control (Smaller) */}
            {item && item.quantities > 0 ? (
              <div className="flex items-center border border-green-700 rounded-lg">
                <Button
                  className="p-1 w-7 h-7 bg-white text-green-700 hover:bg-green-50 rounded-r-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    decreaseCount(product.productId);
                  }}
                >
                  <RiSubtractFill className="text-sm" />
                </Button>
                <span className="w-7 text-center text-xs font-semibold text-green-700">
                  {item.quantities}
                </span>
                <Button
                  className="p-1 w-7 h-7 bg-white text-green-700 hover:bg-green-50 rounded-l-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    increaseCount(product);
                  }}
                  disabled={item.quantities >= (product?.stock || 1)}
                >
                  <IoMdAdd className="text-sm" />
                </Button>
              </div>
            ) : (product?.stock ?? 0) > 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (user) {
                    addtoCartByown(product);
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                // Smaller "Add" button
                className="p-1.5 h-5 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-1 transition-colors"
              >
                {/* Smaller SVG icon */}
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6h-2c0-2.206-1.794-4-4-4S8 3.794 8 6H6C3.794 6 2 7.794 2 10v10c0 2.206 1.794 4 4 4h12c2.206 0 4-1.794 4-4V10c0-2.206-1.794-4-4-4zM10 6c0-1.103.897-2 2-2s2 .897 2 2h-4zm10 14c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2V10c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2v10z" />
                </svg>
                <span className="text-xs font-semibold">Add</span>
              </Button>
            ) : (
              <Button
                disabled
                className="p-1 h-8 text-xs bg-gray-200 text-gray-500 rounded-lg"
              >
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="sm:flex w-full relative mb-7">
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
      <div className={`${isSidebarOpen ? " sm:pl-64 " : ""} w-full `}>
        <div className={` flex-1 gap-2  px-2 md:px-6 pt-[15px]  w-full `}>
          {/* Sidebar Toggle Button (Only visible if sidebar is permanent, otherwise hide) */}
          <div className="relative w-full">
            <Button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={cn(
                ` mt-12  fixed  z-50  ${isSidebarOpen ? "-ml-24" : "-ml-4"} `
              )}
              variant={"outline"}
            >
              {isSidebarOpen ? (
                <MdOutlineMenuOpen className="  " />
              ) : (
                <RiMenuFold2Fill className="  " />
              )}
            </Button>
          </div>

          {/* Header & Sort Bar (Matching image_e8f7a4.png look) */}
          <div className="flex justify-between items-center mb-6 pt-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-sm">
                Showing 1-{products.length || 12} of{" "}
                {allProducts.length || 2560} results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by :
              </span>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px] border-gray-300">
                  <SelectValue placeholder="Default Sorting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="priceLowToHigh">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="priceHighToLow">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="nameAsc">Name: A to Z</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filter Chips (Matching image_e8f7a4.png look) */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-gray-700 font-medium">Active Filter</span>

            {/* Subcategory Chips (Dynamically added from sidebar selection) */}
            {selectedSubCategoryDetails.map((cat, index) => (
              <div
                key={index}
                className="flex items-center gap-1 cursor-pointer bg-yellow-500 text-gray-800 px-3 py-1 rounded-md text-sm font-semibold"
              >
                <p>{cat?.name}</p>
                <button onClick={() => removeSubCat(cat)} className="ml-1">
                  <IoMdClose className="text-lg" />
                </button>
              </div>
            ))}

            {/* Placeholder Chips (For Price, Rating, Stock, etc.) */}
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md text-sm font-semibold ${filter.style}`}
              >
                {filter.name}
                {/* Close button for non-subcategory filters */}
                <button
                  className="ml-1 text-white/80"
                  onClick={() =>
                    setActiveFilters((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  <IoMdClose className="text-lg" />
                </button>
              </div>
            ))}

            {/* Clear All Button */}
            {(selectedSubCategoryDetails.length > 0 ||
              activeFilters.length > 0) && (
              <Button
                variant="link"
                className="text-green-700 hover:text-green-800 text-sm font-semibold p-0 h-auto ml-2"
                onClick={handleClearAllFilters}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Products Grid: Set to 4 columns per row for md screens and up */}
          {!!loading || isLoading || !isUpdated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <ProductCardLoading key={index} className=" w-full" />
              ))}
            </div>
          ) : selectedCategoryId || selectedSubCategory.length > 0 ? (
            products.length > 0 ? (
              // Changed grid to show 4 products per row for md screens and up
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {products.map((product, i) => {
                  const item = items.find(
                    (item: any) => item.productId === product.productId
                  );
                  const isInWishlist = wishlistItems.some(
                    (item: any) => item.productId === product.productId
                  );
                  return renderProductCard(product, item, isInWishlist); // Use the new card renderer
                })}
              </div>
            ) : (
              <p className="mt-32 text-center">
                No products available in this category/filter combination.
              </p>
            )
          ) : (
            <>
              <h1 className="header font-semibold underline mb-2">
                All Products
              </h1>

              {/* Changed grid to show 4 products per row for md screens and up */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {currentProducts.map((filteredProduct: any) => {
                  const item = items.find(
                    (item: any) => item.productId === filteredProduct.productId
                  );
                  const isAddedInWishlist = wishlistItems.some(
                    (item: any) => item.productId === filteredProduct.productId
                  );

                  return renderProductCard(
                    filteredProduct,
                    item,
                    isAddedInWishlist
                  ); // Use the new card renderer
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </Button>
                <span className="text-sm px-4">
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
                >
                  <FaAngleRight />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductbyCategories;
