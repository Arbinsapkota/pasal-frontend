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
import React, { useEffect, useState } from "react";
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

  // mahendra

  // mahendra

  const { setIsLoginModalOpen } = useModal();

  const calculateDiscountPercent = (
    price: number,
    discountedPrice: number
  ): number => {
    if (!discountedPrice || price <= 0) return 0;
    const discount = (discountedPrice / price) * 100;
    return Math.round(discount);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const removeSubCat = (subCategory: Subcategory) => {
    setSelectedSubCategoryDetails(prev =>
      prev.filter(subCat => subCat.subcategoryId != subCategory.subcategoryId)
    );
    setSelectedSubCategory(prev =>
      prev.filter(subCatId => subCatId != subCategory?.subcategoryId)
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
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setProducts(sortedProducts);
  };

  useEffect(() => {
    // console.log("0---", isSidebarOpen);
  }, [isSidebarOpen]);

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
        <div className={` flex-1 gap-2  px-2 md:px-6 pt-[15px]  w-full `}>
          <div className="relative w-full">
            <Button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={cn(
                ` mt-12  fixed  z-50  ${isSidebarOpen ? "-ml-24" : "-ml-4"} `
              )}
              variant={"outline"}
            >
              {isSidebarOpen ? (
                <MdOutlineMenuOpen className="  " />
              ) : (
                <RiMenuFold2Fill className="  " />
              )}
            </Button>
          </div>

          <CategoriesBanner />

          {/* Breadcrumb */}
          <div className="flex flex-col text-lg font-semibold text-gray-800 mt-2 mb-4">
            {selectedCategoryId && (
              <div className="sm:flex justify-end mt-2 gap-2">
                {/* Sort Dropdown */}
                {selectedCategoryId && products && products.length > 0 && (
                  <div className="flex text-black justify-end gap-2 mb-4">
                    <Select value={sortOption} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
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
                          <SelectItem value="nameDesc">Name: Z to A</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            {/* {selectedCategoryId ? (
            <h1 className="sm:text-lg text-sm font-semibold text-gray-800">
              Total Products:{" "}
              {products?.filter(
                product => product.category === selectedCategoryId
              ).length || 0}
            </h1>
          ) : null} */}
            {selectedCategoryId && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedSubCategoryDetails.map((cat, index) => (
                  <div
                    key={index}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "flex items-center gap-1 cursor-pointer bg-blue-600 text-white hover:bg-primaryBlue hover:text-white"
                    )}
                  >
                    <p>{cat?.name}</p>
                    <button onClick={() => removeSubCat(cat)}>
                      <IoMdClose />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          {!!loading || isLoading || !isUpdated ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
              {Array.from({ length: 10 }).map((_, index) => (
                <ProductCardLoading key={index} className=" w-full" />
              ))}
            </div>
          ) : selectedCategoryId || selectedSubCategory.length > 0 ? (
            products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 gap-2">
                {products.map((product, i) => {
                  const item = items.find(
                    (item: any) => item.productId === product.productId
                  );
                  const isInWishlist = wishlistItems.find(
                    (item: any) => item.productId === product.productId
                  );
                  return (
                    <Link
                      href={`/homepage/products/${product.productId}`}
                      key={i}
                      className="sm:p-3 p-2 bg-gray-100 rounded-lg border hover:bg-[#0037c8]/15 "
                    >
                      <div className="relative">
                        <div
                          className="cursor-pointer relative"
                          onClick={() => {
                            router.push(
                              `/homepage/products/${product.productId}`
                            );
                          }}
                        >
                          {((product.discountedPrice > 0 &&
                            product.price > product.discountedPrice) ||
                            product.discountPercentage > 0) && (
                            <div className="absolute sm:-top-1 top-1 -left-1 sm:-left-4 z-10">
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
                          <div className="absolute sm:top-2 top-0 sm:right-2 right-0 flex">
                            {user ? (
                              <Button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(
                                    product,
                                    isInWishlist != undefined ? true : false
                                  );
                                  handleClick(product.productId);
                                }}
                                className={`text-xl text-gray-300 bg-white transition-all hover:text-primaryBlue hover:bg-white z-10 rounded-full h-[32px] px-2 ${
                                  isInWishlist
                                    ? "bg-white hover:bg-white hover:text-primaryBlue text-primaryBlue"
                                    : null
                                } ${
                                  clickedId == product.productId
                                    ? "bg-white hover:bg-white hover:text-primaryBlue text-white"
                                    : ""
                                }`}
                              >
                                <GoHeartFill className="" />
                              </Button>
                            ) : (
                              <Button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsLoginModalOpen(true);
                                }}
                                className={`text-xl text-gray-300 bg-white transition-all hover:text-primaryBlue hover:bg-white z-10 rounded-full h-[32px] px-2 `}
                              >
                                <GoHeartFill className="" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-1 justify-between">
                          <h2 className="mt-1 font-semibold text-primary-btn truncate hover:text-primaryBlue">
                            {capitalizeFirstLetter(product.name)}
                          </h2>
                          <div className="flex items-baseline">
                            <span className="price">
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
                            <div>
                              {(product.discountedPrice ||
                                product.discountPercentage > 0) && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                                  Rs.{(product?.price).toFixed(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* stocks and reward */}
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
                        <div className="flex items-center   px-1.5 gap-0.5">
                          {product?.rating && product.rating > 0 ? (
                            <span className="ml-1 text-sm text-gray-700 font-medium">
                              {product?.rating?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <BsDash className="text-gray-400 text-xl" />
                          )}

                          <MdOutlineStar className="text-yellow-500 text-xl" />
                        </div>
                      </div>

                      {/* add and remove the cart */}
                      <div className="flex items-center  sm:mt-1 pb-1 sm:pb-2">
                        <div className="ml-auto w-full flex   justify-center h-8 sm:h-10 ">
                          {item && item?.quantities > 0 ? (
                            <div className="flex  rounded-lg">
                              <Button
                                className="p-1 text-xs sm:text-sm border-r  rounded-lg rounded-r-none pl-2 sm:pl-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  w-12 "
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
                                  "px-1 sm:px-2  w-12 text-xs sm:text-base rounded-none border-none h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  flex items-center justify-center "
                                )}
                              >
                                {item.quantities}
                              </span>
                              <Button
                                className="p-1 text-xs sm:text-sm  rounded-lg rounded-l-none border-l pr-2 sm:pr-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  w-12 "
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
                          ) : (product?.stock ?? 0) > 0 ? (
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
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-32 text-center">No products available.</p>
            )
          ) : (
            <>
              <h1 className="header font-semibold underline mb-2">
                All Products
              </h1>
              {/* {!selectedCategoryId && (
              <h1> Total Products: {allProducts.length}</h1>
            )} */}

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {currentProducts.map((filteredProduct: any) => {
                  const item = items.find(
                    (item: any) => item.productId === filteredProduct.productId
                  );
                  const isAddedInWishlist = wishlistItems.find(
                    (item: any) => item.productId === filteredProduct.productId
                  );

                  return (
                    <Link
                      href={`/homepage/products/${filteredProduct.productId}`}
                      key={filteredProduct.productId}
                      className="sm:p-4 p-2 bg-white border rounded-lg hover:bg-[#0037c8]/15 cursor-pointer"
                    >
                      <div className="relative w-36">
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/homepage/products/${filteredProduct.productId}`
                            )
                          }
                        >
                          {((filteredProduct.discountedPrice > 0 &&
                            filteredProduct.price >
                              filteredProduct.discountedPrice) ||
                            filteredProduct.discountPercentage > 0) && (
                            <div className="absolute sm:-top-1 top-1 -left-1 sm:-left-4 z-10">
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
                                filteredProduct.imageUrls[0] || "/product.png"
                              }
                              alt={filteredProduct.name || "Product image"}
                              className="object-cover h-full rounded-md"
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          </div>

                          <div className="absolute sm:-top-2 sm:-right-2 -top-1 right-1 z-10">
                            {user ? (
                              <Button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(
                                    filteredProduct,
                                    !!isAddedInWishlist
                                  );
                                }}
                                className={`text-xl text-gray-400 z-10 bg-white w-8 h-8 rounded-full transition-all hover:text-[#0037c8] hover:bg-gray-50 border ${
                                  isAddedInWishlist ? "text-[#0037c8]" : ""
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
                                className={`text-xl text-gray-400 z-10 bg-white w-8 h-8 rounded-full transition-all hover:text-[#0037c8] hover:bg-gray-50 border  ${
                                  isAddedInWishlist ? "text-[#0037c8]" : ""
                                }`}
                              >
                                <GoHeartFill />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-1 justify-between">
                          <h2 className="mt-1 font-serif text-primary-btn truncate">
                            {capitalizeFirstLetter(filteredProduct.name)}
                          </h2>
                          <div className="flex items-baseline">
                            <span className="price font-semibold text-primary-btn">
                              Rs.
                              {(
                                filteredProduct.price -
                                filteredProduct.discountedPrice
                              ).toFixed(0)}
                            </span>
                            {filteredProduct.discountedPrice > 0 && (
                              <span className="text-xs text-gray-500 line-through sm:ml-2 ml-1">
                                Rs.{filteredProduct.price.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* stocks and reward */}
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
                              {filteredProduct?.rating?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <BsDash className="text-gray-400 text-xl" />
                          )}

                          <MdOutlineStar className="text-yellow-500 text-xl" />
                        </div>
                      </div>
                      {/* add and remove the Cart */}
                      <div className="flex items-center justify-center sm:mt-1 w-full">
                        <div className="w-full flex justify-end h-10">
                          <div className="ml-auto w-full flex justify-center h-8 sm:h-10">
                            {item && item.quantities > 0 ? (
                              <div className="flex  border-muted-foreground rounded-full">
                                <Button
                                  className="p-1 text-xs sm:text-sm border-r rounded-lg rounded-r-none pl-2 sm:pl-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80 w-12"
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    decreaseCount(filteredProduct.productId);
                                  }}
                                >
                                  <RiSubtractFill className="text-lg" />
                                </Button>
                                <span
                                  className={cn(
                                    buttonVariants({ variant: "default" }),
                                    "px-3 sm:px-2  w-12 text-xs sm:text-base rounded-none border-none h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  flex items-center justify-center  "
                                  )}
                                >
                                  {item.quantities}
                                </span>
                                <Button
                                  className="p-1 text-xs sm:text-sm rounded-lg rounded-l-none border-l pr-2 sm:pr-3 h-8 sm:h-auto bg-[#0037c8] hover:bg-[#0037c8]/80  w-10 "
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    increaseCount(filteredProduct);
                                  }}
                                  disabled={
                                    item.quantities >=
                                    (filteredProduct.stock || 1)
                                  }
                                >
                                  <IoMdAdd className="text-lg" />
                                </Button>
                              </div>
                            ) : filteredProduct?.stock > 0 ? (
                              user ? (
                                <Button
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addtoCartByown(filteredProduct);
                                  }}
                                  className="border rounded-lg h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm md:text-base bg-[#0037c8] hover:bg-[#0037c8]/80  w-full"
                                >
                                  Add to Cart
                                </Button>
                              ) : (
                                <Button
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsLoginModalOpen(true);
                                  }}
                                  className="border rounded-lg h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm md:text-base bg-[#0037c8] hover:bg-[#0037c8]/80  w-full"
                                >
                                  Add to Cart
                                </Button>
                              )
                            ) : (
                              <Button
                                disabled
                                className="border border-muted-foreground rounded-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm w-full"
                              >
                                Out of Stock
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    setCurrentPage(prev =>
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
