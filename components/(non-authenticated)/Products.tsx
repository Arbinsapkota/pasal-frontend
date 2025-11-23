"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import axios from "axios";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
// import ProductModal from "./ProductInfo";
import CategoriesWithSubcategories from "./SearchByCategory";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { GoHeartFill } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { axiosAuthInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingContent from "./LoadingContent";

const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState("priceLowToHigh"); // Default sorting by price low to high
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [clickedId, setClickedId] = useState<string>("");

  const handleClick = (id: string) => {
    setClickedId(id);
    setTimeout(() => {
      setClickedId("");
    }, 100);
  };

  // Fetch products from the backend
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`
      );

      setProducts(response.data);
      setFilteredProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // setIsLoading(false);
  }, [filteredProducts]);
  // Update filtered products based on search and sorting

  useEffect(() => {
    // Fetch categories
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    let updatedProducts = [...products];

    // Sort products based on selected sort option
    switch (sortOption) {
      case "priceLowToHigh":
        updatedProducts.sort(
          (a, b) => (a.discountedPrice ?? 0) - (b.discountedPrice ?? 0)
        );
        break;
      case "priceHighToLow":
        updatedProducts.sort(
          (a, b) => (b.discountedPrice ?? 0) - (a.discountedPrice ?? 0)
        );
        break;
      case "nameAsc":
        updatedProducts.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "")
        );
        break;
      case "nameDesc":
        updatedProducts.sort((a, b) =>
          (b.name ?? "").localeCompare(a.name ?? "")
        );
        break;
      default:
        break;
    }

    setFilteredProducts(updatedProducts);
  }, [sortOption, products]);

  // Add product to favorites

  const user = getUserFromCookies();
  const [allItems, setAllItems] = useState<CartItem[]>(items);

  useEffect(() => {
    setAllItems(items); // Update local state when Redux state changes
  }, [items]);

  const countApi = useCallback(
    useDebouncedCallback((product: any, quantity: Number) => {
      axiosAuthInstance()
        .post("/api/cart/add", {
          products: {
            productId: product.productId,
          },
          quantity,
        })
        .catch(err => {
          toast.error("Failed to Add to Cart");
        });
    }, 400),
    []
  );

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

  return (
    <div className="p-1 md:p-6  rounded-sm">
      <h1 className="text-2xl font-bold mb-6">s</h1>

      {/* Search and Sort */}
      <div className="flex justify-center mb-6 gap-4">
        {/* Categories Sections */}
        <CategoriesWithSubcategories
          setProducts={setProducts}
          setIsLoading={setIsLoading}
        />
        {/* Sort by Various Orders */}
        <Select
          value={sortOption}
          onValueChange={value => setSortOption(value)}
        >
          <SelectTrigger className="w-[180px]">
            {" "}
            <SelectValue placeholder="Arrange" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="priceLowToHigh">Price: Low to High</SelectItem>
              <SelectItem value="priceHighToLow">Price: High to Low</SelectItem>
              <SelectItem value="nameAsc">Name: A to Z</SelectItem>
              <SelectItem value="nameDesc">Name: Z to A</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => {
            return <LoadingContent key={index} className="h-64" />;
          })
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => {
            const item = items.find(
              item => item.productId == product.productId
            );

            const isAddedInWishlist = wishlistItems.find(
              item => item.productId == product.productId
            );

            return (
              <div
                key={index}
                className="p-4 bg-gray-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <div
                    className="relative cursor-pointer"
                    // onClick={() => openModal(product)}
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={product.imageUrls[0] || "/product.png"}
                        alt={product.name || "pic"}
                        className="object-cover w-full h-full rounded"
                        fill
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex  ">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          // addToFavorite(product);
                          toggleWishlist(
                            product,
                            isAddedInWishlist != undefined ? true : false
                          );
                          handleClick(product.productId);
                        }}
                        className={`text-xl text-primary bg-white  transition-all hover:text-red-500 hover:bg-white   z-10 rounded-full py-[15px] px-2 ${
                          isAddedInWishlist
                            ? "bg-white hover:bg-white hover:text-red-600 text-red-500 "
                            : null
                        } 
                            ${
                              clickedId == product.productId
                                ? "bg-white hover:bg-white hover:text-red-500 text-white"
                                : ""
                            }`}
                      >
                        <GoHeartFill />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-lg font-bold text-primary-btn">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                    {product.discountedPrice && (
                      <span className="text-gray-500 text-sm line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h2 className=" font-medium text-lg  text-primary-btn">
                    {product.name}
                  </h2>
                  <Dialog>
                    <DialogTrigger className="absolute w-full h-full top-0 ">
                      <div></div>
                    </DialogTrigger>

                    <DialogContent className="">
                      <DialogHeader>
                        <VisuallyHidden>
                          <DialogTitle>Product</DialogTitle>
                        </VisuallyHidden>
                      </DialogHeader>
                      {/* <ProductModal product={product} /> */}
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex    w-full  mt-4">
                  <div className="flex items-center ml-auto  w-32 ">
                    {item && item?.quantities > 0 ? (
                      <div className="bg-primary flex items-center justify-between rounded-md w-full ">
                        <Button
                          className=" text-xl h-10 "
                          onClick={() => decreaseCount(product?.productId)}
                        >
                          <RiSubtractFill />
                        </Button>
                        <p className="text-white ">{item.quantities}</p>
                        <Button
                          className=" text-xl h-10 "
                          onClick={() => {
                            increaseCount(product);
                          }}
                          // disabled={
                          //   quantity >= product?.stock || product?.stock == 0
                          // }
                        >
                          <IoMdAdd />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className=" flex items-center px-4 gap-1.5  hover:bg-primary w-full h-10 "
                        onClick={() => {
                          increaseCount(product);
                        }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No Products Available</p>
        )}
      </div>
    </div>
  );
};

export default LatestProducts;
