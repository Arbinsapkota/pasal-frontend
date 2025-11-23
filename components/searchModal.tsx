// import { Button } from "@/components/ui/button";
// import {
//   addToCart,
//   CartItem,
//   Product,
//   removeFromCart,
// } from "@/redux/slices/cartSlice";
// import {
//   addToWishlist,
//   removeFromWishlist,
// } from "@/redux/slices/wishlistSlice";
// import { RootState } from "@/redux/store";
// import Image from "next/image";
// import React, { useCallback, useEffect, useState } from "react";
// import { GoHeartFill } from "react-icons/go";
// import { IoMdAdd } from "react-icons/io";
// import { RiSubtractFill } from "react-icons/ri";
// import { useDispatch, useSelector } from "react-redux";

// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { useDebouncedCallback } from "use-debounce";
// import LoadingContent from "./(non-authenticated)/LoadingContent";
// import { axiosAuthInstance } from "./axiosInstance";
// import { getUserFromCookies } from "./cookie/cookie";
// import { useModal } from "./providers/ModalStateProvider";

// const SearchModal = ({
//   searchQuery,
//   setSearchQuery,
//   products,
//   isLoading,
// }: {
//   searchQuery: string;
//   setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
//   products: Product[];
//   isLoading: boolean;
// }) => {
//   const dispatch = useDispatch();
//   const items = useSelector((state: RootState) => state.cart.items);
//   const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
//   const router = useRouter();
//   const user = getUserFromCookies();
//   // const { setIsLoginModalOpen } = useModal();
//   const [allItems, setAllItems] = useState<CartItem[]>(items);

//   useEffect(() => {
//     setAllItems(items); // Update local state when Redux state changes
//   }, [items]);

//   // const countApi = useCallback(
//   //   useDebouncedCallback((product: any, quantity: Number) => {
//   //     axiosAuthInstance()
//   //       .post("/api/cart/add", {
//   //         products: {
//   //           productId: product.productId,
//   //         },
//   //         quantity,
//   //       })
//   //       .catch(err => {
//   //         toast.dismiss();
//   //         toast.error("Failed to Add to Cart");
//   //       });
//   //   }, 400),
//   //   []
//   // );

//   // const wishlistApi = useDebouncedCallback(
//   //   (product: Product, action: "add" | "remove") => {
//   //     const endpoint = action === "add" ? "/api/wishlist/" : "/api/wishlist/";

//   //     const payload =
//   //       action === "add"
//   //         ? { product: { productId: product.productId } }
//   //         : { productId: product.productId };
//   //     if (action === "add") {
//   //       axiosAuthInstance()
//   //         .post(endpoint, { product: { productId: product.productId } })
//   //         .catch(err => {
//   //           toast.dismiss();
//   //           toast.error(`Error adding in favorite.`);
//   //         });
//   //     } else {
//   //       axiosAuthInstance()
//   //         .delete(endpoint, { params: { productId: product.productId } })
//   //         .catch(err => {
//   //           // toast.error(`Server has to be updated.`);
//   //         });
//   //     }
//   //   }
//   // );

//   // const increaseCount = (product: Product) => {
//   //   // Check if the product already exists in allItems
//   //   const existingItem = allItems.find(
//   //     item => item.productId === product.productId
//   //   );

//   //   const itemPrice = product.discountedPrice || product.price;

//   //   let updatedItems;
//   //   if (existingItem) {
//   //     // If the product exists, increase quantity and update the total price
//   //     updatedItems = allItems.map(item =>
//   //       item.productId === product.productId
//   //         ? {
//   //             ...item,
//   //             quantities: item.quantities + 1,
//   //             totalPrice: item.totalPrice + itemPrice,
//   //           }
//   //         : item
//   //     );
//   //   } else {
//   //     // If the product does not exist, add it to allItems
//   //     updatedItems = [
//   //       ...allItems,
//   //       {
//   //         productId: product.productId,
//   //         names: product.name,
//   //         quantities: 1,
//   //         prices: itemPrice,
//   //         totalPrice: itemPrice,
//   //         imageUrls: product.imageUrls,
//   //         rating: product.rating,
//   //       },
//   //     ];
//   //   }
//   //   // Update local state
//   //   setAllItems(updatedItems);

//   //   // Update Redux
//   //   dispatch(addToCart(product));

//   //   // Trigger API call if user is logged in
//   //   if (user) {
//   //     countApi(product, existingItem ? existingItem.quantities + 1 : 1);
//   //   }
//   // };
//   // const decreaseCount = (productId: string) => {
//   //   const existingItem = allItems.find(item => item.productId === productId);

//   //   if (existingItem) {
//   //     if (existingItem.quantities === 1) {
//   //       // Remove the item completely if quantity is 1
//   //       setAllItems(allItems.filter(item => item.productId !== productId));
//   //       dispatch(removeFromCart(productId));

//   //       // Call API to completely remove item
//   //       if (user) {
//   //         axiosAuthInstance()
//   //           .delete(`/api/cart/remove?productId=${existingItem.productId}`)
//   //           .catch(err => {
//   //             // toast.error("Failed to Remove Item from Cart");
//   //           });
//   //       }
//   //     } else {
//   //       // Decrease quantity and update total price
//   //       const updatedItems = allItems.map(item =>
//   //         item.productId === productId
//   //           ? {
//   //               ...item,
//   //               quantities: item.quantities - 1,
//   //               totalPrice: item.totalPrice - item.prices,
//   //             }
//   //           : item
//   //       );

//   //       setAllItems(updatedItems);
//   //       dispatch(removeFromCart(productId));

//   //       // Update backend with new quantity
//   //       if (user) {
//   //         // Correctly pass the Product object
//   //         countApi(
//   //           {
//   //             productId: existingItem.productId,
//   //             name: existingItem.names,
//   //             description: "", // Add description if available
//   //             price: existingItem.prices,
//   //             discountedPrice: 0, // Add discounted price if applicable
//   //             imageUrls: existingItem.imageUrls || [],
//   //             rating: null, // Add rating if available
//   //             wishlistId: existingItem.wishlistId || null,
//   //             cartId: existingItem.cartId,
//   //           },
//   //           existingItem.quantities - 1 // Updated quantity
//   //         );
//   //       }
//   //     }
//   //   }
//   // };

//   // const toggleWishlist = (product: Product, isAdded: boolean) => {
//   //   if (isAdded) {
//   //     // Remove from Wishlist
//   //     dispatch(removeFromWishlist(product.productId));
//   //     if (user) {
//   //       wishlistApi(product, "remove");
//   //     }
//   //   } else {
//   //     // Add to Wishlist
//   //     dispatch(addToWishlist(product));
//   //     if (user) {
//   //       wishlistApi(product, "add");
//   //     }
//   //   }
//   // };
//   return (
//     <div className=" rounded-lg  w-full  overflow-y-auto h-96">
//       <div className="">
//         {/* Search and Sort */}
//         <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             className="border border-gray-300 rounded px-4 py-2 w-full"
//           />
//           {/* <select
//               value={sortOption}
//               onChange={(e) => setSortOption(e.target.value)}
//               className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto"
//             >
//               <option value="priceLowToHigh">Price: Low to High</option>
//               <option value="priceHighToLow">Price: High to Low</option>
//               <option value="nameAsc">Name: A to Z</option>
//               <option value="nameDesc">Name: Z to A</option>
//             </select> */}
//         </div>

//         <div className="flex flex-col  h-72 overflow-y-auto scrollbar-thin border   ">
//           {isLoading
//             ? Array.from({ length: 8 }).map((_, index) => {
//                 return <LoadingContent key={index} className="h-30 w-auto" />;
//               })
//             : products.map((product, index) => {
//                 const item = items.find(
//                   item => item.productId == product.productId
//                 );

//                 const isAddedInWishlist = wishlistItems.find(
//                   item => item.productId == product.productId
//                 );

//                 return (
//                   <div
//                     key={index}
//                     className="px-4  bg-gray-100  border-b border-white shadow-lg hover:shadow-xl transition-shadow "
//                   >
//                     <div className="relative flex gap-x-4  items-center">
//                       <div
//                         className="relative cursor-pointer flex"
//                         // onClick={() => openModal(product)}
//                       >
//                         <div
//                           className="relative w-auto "
//                           onClick={() => {
//                             router.push(
//                               `/homepage/products/${product.productId}`
//                             );
//                           }}
//                         >
//                           <Image
//                             src={product.imageUrls[0] || "/product.png"}
//                             alt={product.name || "pic"}
//                             className="h-14 w-14 rounded mx-auto"
//                             height={600}
//                             width={600}
//                             style={{ objectFit: "contain" }}
//                           />
//                         </div>
//                         {/* <div className="absolute top-1 right-1 flex  ">
//                           {user ? (
//                             <Button
//                               onClick={e => {
//                                 e.stopPropagation();
//                                 // addToFavorite(product);
//                                 toggleWishlist(
//                                   product,
//                                   isAddedInWishlist != undefined ? true : false
//                                 );
//                               }}
//                               className={`text-xl text-gray-300 bg-white  transition-all hover:text-primaryBlue hover:bg-white   z-10 rounded-full py-[15px] px-2 ${
//                                 isAddedInWishlist
//                                   ? "bg-white hover:bg-white  text-primaryBlue "
//                                   : null
//                               }
//                               `}
//                             >
//                               <GoHeartFill className="" size={20} />
//                             </Button>
//                           ) : (
//                             <Button
//                               onClick={e => {
//                                 e.stopPropagation();
//                                 // addToFavorite(product);
//                                 setIsLoginModalOpen(true);
//                               }}
//                               className={`text-xl text-gray-300 bg-white  transition-all hover:text-primaryBlue hover:bg-white   z-10 rounded-full py-[15px] px-2 ${
//                                 isAddedInWishlist
//                                   ? "bg-white hover:bg-white  text-primaryBlue "
//                                   : null
//                               }
//                               `}
//                             >
//                               <GoHeartFill className="" size={20} />
//                             </Button>
//                           )}
//                         </div> */}
//                       </div>

//                       {/* <div className="mt-2">
//                         <span className="font-medium text-primary-btn">
//                           Rs.
//                           {product?.price?.toFixed(0)}
//                         </span>
//                         {product.discountedPrice && (
//                           <span className="text-gray-500 text-xs line-through ml-2">
//                             $
//                             {(product.discountedPrice + product.price).toFixed(
//                               2
//                             )}
//                           </span>
//                         )}
//                       </div> */}
//                       <h2 className="  text-sm  text-primary-btn">
//                         {product.name}
//                       </h2>
//                     </div>
//                     {/* <div className="flex    w-full  mt-2">
//                       <div className="flex items-center   w-32 ">
//                         {item && item?.quantities > 0 ? (
//                           <div className="bg-primaryBlue flex items-center justify-between rounded-md w-full mt-1.5 h-9">
//                             <Button
//                               className=" text-xl h-9 p-1 px-2 border-r border-white"
//                               onClick={() => decreaseCount(item?.productId)}
//                             >
//                               <RiSubtractFill className="size-4" />
//                             </Button>
//                             <p className="text-white text-sm ">
//                               <span className="text-white ">
//                                 {item.quantities}
//                               </span>
//                             </p>
//                             <Button
//                               className=" text-xl h-9 p-1 px-2 border-l border-white "
//                               onClick={() => {
//                                 increaseCount(product);
//                               }}
//                               disabled={
//                                 item?.quantities >= (product?.stock || 1)
//                               }
//                             >
//                               <IoMdAdd className="size-4" />
//                             </Button>
//                           </div>
//                         ) : product && product?.stock && product?.stock > 0 ? (
//                           user ? (
//                             <Button
//                               variant={"default"}
//                               onClick={() => increaseCount(product)}
//                               className=" border border-muted-foreground rounded-full  h-10  px-4"
//                             >
//                               Add to cart
//                             </Button>
//                           ) : (
//                             <Button
//                               variant={"default"}
//                               onClick={() => setIsLoginModalOpen(true)}
//                               className=" border border-muted-foreground rounded-full  h-10  px-4"
//                             >
//                               Add to cart
//                             </Button>
//                           )
//                         ) : (
//                           <Button
//                             variant={"default"}
//                             disabled
//                             // onClick={() => increaseCount(product)}
//                             className=" border border-muted-foreground rounded-full  h-10  px-4"
//                           >
//                             Out of Stock
//                           </Button>
//                         )}
//                       </div>
//                     </div> */}
//                   </div>
//                 );
//               })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchModal;
