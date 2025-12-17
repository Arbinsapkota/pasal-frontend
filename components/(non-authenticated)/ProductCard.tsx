// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { GoHeartFill } from "react-icons/go";
// import { IoMdAdd } from "react-icons/io";
// import { RiSubtractFill } from "react-icons/ri";
// import { PiBagFill } from "react-icons/pi";
// import { IoStar, IoStarOutline } from "react-icons/io5";

// interface ProductCardProps {
//   product: {
//     productId: string;
//     name: string;
//     category: string;
//     categoryName?: string;
//     subcategoryName?: string;
//     price: number;
//     discountedPrice: number;
//     discountPercentage: number;
//     imageUrls: string[];
//     rating: number;
//     stock: number;
//     wishlistId?: string | null;
//   };
//   items: any[];
//   wishlistItems: any[];
//   calculateDiscount: (
//     originalPrice: number,
//     discountedPrice: number,
//     discountPercentage?: number
//   ) => number;
//   formatPrice: (price: number) => string;
//   toggleWishlist: (product: any, e: React.MouseEvent) => void;
//   handleUpdateCart: (
//     product: any,
//     action: "ADD" | "INCREASE" | "DECREASE"
//   ) => void;
//   user: any;
// }

// export const ProductsCard = ({
//   product,
//   items,
//   wishlistItems,
//   calculateDiscount,
//   formatPrice,
//   toggleWishlist,
//   handleUpdateCart,
//   user,
// }: ProductCardProps) => {
//   // Use discountPercentage if available, otherwise calculate from price difference
//   const discount = product.discountPercentage 
//     ? Math.round(product.discountPercentage)
//     : calculateDiscount(
//         product.price,
//         product.discountedPrice,
//         product.discountPercentage
//       );

//   // Determine final price (use discountedPrice if it exists and is > 0, otherwise use price)
//   const finalPrice = product.discountedPrice && product.discountedPrice > 0 
//     ? product.discountedPrice 
//     : product.price;

//   // Find cart item and quantity
//   const cartItem = items.find((c) => c.productId === product.productId);
//   const qty = cartItem ? cartItem.quantities : 0;

//   // Check if product is in wishlist
//   const isLiked = wishlistItems.some((i) => i.productId === product.productId);

//   // Calculate total price
//   const totalPrice = finalPrice * qty;

//   // Render stars based on rating
//   const renderStars = (rating: number) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
    
//     for (let i = 0; i < 5; i++) {
//       if (i < fullStars) {
//         stars.push(<IoStar key={i} className="w-4 h-4 text-orange-500 fill-current" />);
//       } else if (i === fullStars && hasHalfStar) {
//         stars.push(<IoStar key={i} className="w-4 h-4 text-orange-500 fill-current" />);
//       } else {
//         stars.push(<IoStarOutline key={i} className="w-4 h-4 text-gray-300" />);
//       }
//     }
//     return stars;
//   };

//   // Get category name - prioritize categoryName, fallback to subcategoryName, then default
//   const getCategoryName = () => {
//     if (product.categoryName) return product.categoryName;
//     if (product.subcategoryName) return product.subcategoryName;
//     return "Electronics";
//   };

//   // Handle wishlist click with auth check
//   const handleWishlistClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!user) {
//       // You might want to show a toast here
//       return;
//     }
//     toggleWishlist(product, e);
//   };

//   // Handle cart actions with auth check
//   const handleCartAction = (action: "ADD" | "INCREASE" | "DECREASE", e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!user) {
//       // You might want to show a toast here
//       return;
//     }
//     handleUpdateCart(product, action);
//   };

//   return (
//     <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
//       <Link 
//         href={`/homepage/products/${product.productId}`}
//         className="block"
//       >
//         {/* IMAGE CONTAINER */}
//         <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
//           {product.imageUrls && product.imageUrls[0] ? (
//             <Image
//               src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL || ''}${product.imageUrls[0]}`}
//               alt={product.name}
//               fill
//               className="object-cover group-hover:scale-105 transition-transform duration-500"
//               sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
//             />
//           ) : (
//             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//               <span className="text-gray-400">No Image</span>
//             </div>
//           )}

//           {/* SAVE BADGE */}
//           {discount > 0 && (
//             <div className="absolute top-3 left-3">
//               <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-md shadow-md">
//                 Save {discount}%
//               </span>
//             </div>
//           )}

//           {/* STOCK BADGE */}
//           {product.stock <= 10 && product.stock > 0 && (
//             <div className="absolute top-3 right-12">
//               <span className="bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded-md shadow-md">
//                 Only {product.stock} left
//               </span>
//             </div>
//           )}

//           {product.stock === 0 && (
//             <div className="absolute top-3 right-12">
//               <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow-md">
//                 Out of Stock
//               </span>
//             </div>
//           )}
//         </div>

//         {/* CONTENT */}
//         <div className="p-4">
//           {/* CATEGORY */}
//           <div className="mb-1">
//             <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//               {getCategoryName()} ({product.rating ? product.rating.toFixed(1) : '4.0'})
//             </span>
//           </div>

//           {/* PRODUCT NAME */}
//           <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-sm h-10 mb-2 group-hover:text-orange-600 transition-colors">
//             {product.name || "Product Name"}
//           </h3>

//           {/* RATING */}
//           <div className="flex items-center gap-1 mb-3">
//             <div className="flex">
//               {renderStars(product.rating || 4.0)}
//             </div>
//             <span className="text-xs text-gray-500 ml-1">
//               {product.rating ? product.rating.toFixed(1) : '4.0'}
//             </span>
//           </div>

//           {/* PRICE SECTION */}
//           <div className="space-y-2">
//             {/* Current and Original Price */}
//             <div className="flex items-center gap-2">
//               <span className="text-xl font-bold text-gray-900">
//                 Rs {formatPrice(finalPrice)}
//               </span>
//               {discount > 0 && (
//                 <span className="text-sm text-gray-500 line-through">
//                   Rs {formatPrice(product.price)}
//                 </span>
//               )}
//             </div>

//             {/* TOTAL PRICE WHEN ITEM IN CART */}
//             {qty > 0 && (
//               <div className="pt-2 border-t border-gray-100">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total:</span>
//                   <span className="text-base font-bold text-gray-900">
//                     Rs {formatPrice(totalPrice)}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </Link>

//       {/* WISHLIST BUTTON - Absolute positioned */}
//       <button
//         onClick={handleWishlistClick}
//         className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 z-10 ${
//           isLiked
//             ? "bg-red-500 text-white"
//             : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
//         }`}
//       >
//         <GoHeartFill className="text-lg" />
//       </button>

//       {/* CART CONTROLS - Outside the link */}
//       <div className="px-4 pb-4">
//         {qty > 0 ? (
//           <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2">
//             {/* DECREASE */}
//             <button
//               onClick={(e) => handleCartAction("DECREASE", e)}
//               disabled={!user || product.stock === 0}
//               className={`p-1 rounded-full transition-colors ${
//                 !user || product.stock === 0
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-600 hover:text-orange-600 hover:bg-gray-100"
//               }`}
//             >
//               <RiSubtractFill className="text-xl" />
//             </button>

//             <div className="flex flex-col items-center">
//               <span className="font-bold text-gray-900 text-lg">
//                 {qty}
//               </span>
//               <span className="text-xs text-gray-500">in cart</span>
//             </div>

//             {/* INCREASE */}
//             <button
//               onClick={(e) => handleCartAction("INCREASE", e)}
//               disabled={!user || product.stock === 0 || qty >= product.stock}
//               className={`p-1 rounded-full transition-colors ${
//                 !user || product.stock === 0 || qty >= product.stock
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-600 hover:text-orange-600 hover:bg-gray-100"
//               }`}
//             >
//               <IoMdAdd className="text-xl" />
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={(e) => handleCartAction("ADD", e)}
//             disabled={!user || product.stock === 0}
//             className={`w-full font-semibold py-3 rounded-lg flex justify-center items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${
//               !user || product.stock === 0
//                 ? "bg-gray-400 cursor-not-allowed text-white"
//                 : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
//             }`}
//           >
//             <PiBagFill className="text-lg" />
//             {product.stock === 0 ? "Out of Stock" : "Add To Cart"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// // Helper functions that should be in the parent component
// export const calculateDiscount = (
//   originalPrice: number,
//   discountedPrice: number,
//   discountPercentage?: number
// ): number => {
//   // If discountPercentage is provided, use it
//   if (discountPercentage && discountPercentage > 0) {
//     return Math.round(discountPercentage);
//   }
  
//   // Otherwise calculate from price difference
//   if (discountedPrice && discountedPrice > 0 && originalPrice > discountedPrice) {
//     const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
//     return Math.round(discount);
//   }
  
//   return 0;
// };

// export const formatPrice = (price: number): string => {
//   return Math.round(price).toString();
// };

// export default ProductsCard;