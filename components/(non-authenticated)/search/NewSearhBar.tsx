// "use client";
// import SearchModal from "@/components/searchModal";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Product } from "@/redux/slices/cartSlice";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { IoSearchSharp } from "react-icons/io5";
// import { toast } from "react-toastify";

// const NewSearchBar: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortOption, setSortOption] = useState("priceLowToHigh");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const handleSearch = () => {
//     setIsDialogOpen(true);
//   };

//   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search?productName=${searchQuery}`
//       );

//       setProducts(response.data);
//       setFilteredProducts(response.data);
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       toast.error("Failed to fetch products. Please try again later.");
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [searchQuery]);

//   useEffect(() => {
//     let updatedProducts = [...products];

//     if (searchQuery) {
//       updatedProducts = updatedProducts.filter(product =>
//         product.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // const sortProducts = (updatedProducts: Product[], sortOption: string) => {
//     //   // Create a shallow copy of the updatedProducts array
//     //   const sortedProducts = [...updatedProducts];

//     //   switch (sortOption) {
//     //     case "priceLowToHigh":
//     //       return sortedProducts.sort(
//     //         (a, b) => a.discountedPrice - b.discountedPrice
//     //       );
//     //     case "priceHighToLow":
//     //       return sortedProducts.sort(
//     //         (a, b) => b.discountedPrice - a.discountedPrice
//     //       );
//     //     case "nameAsc":
//     //       return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
//     //     case "nameDesc":
//     //       return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
//     //     default:
//     //       return sortedProducts;
//     //   }
//     // };

//     setFilteredProducts(updatedProducts);
//   }, [searchQuery, sortOption, products]);

//   return (
//     <div className="flex items-center justify-center w-full h-full relative">
//       {/* Search Input and Button */}
//       <div className="items-center justify-between hidden xl:flex  rounded-full  focus-within:ring-offset-2   focus-within:ring-2 w-full">
//         <div className="flex items-center bg-white rounded-full py-1 px-2 w-full">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             placeholder="What are you looking for?"
//             className="text-base px-3 outline-none  bg-white text-gray-700 w-full"
//             onKeyDown={e => {
//               if (e.key === "Enter") {
//                 handleSearch();
//               }
//             }}
//           />
//          {/* <div className="absolute top-8 w-auto bg-gray-400 py-0">
//            <SearchModal
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 products={products}
//                 isLoading={isLoading}
//               />
//          </div> */}
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger onClick={handleSearch}>
//               <div className=" bg-blue-300 hover:bg-[#0037c8] hover:text-white text-black p-1.5 rounded-full w-full sm:w-auto transition-colors  cursor-pointer">
//                 <IoSearchSharp className="text-xl" />
//               </div>
//             </DialogTrigger>
//             <DialogContent className="max-w-[40rem]">
//               <DialogHeader>
//                 <DialogTitle>Search</DialogTitle>
//               </DialogHeader>
//               <SearchModal
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 products={products}
//                 isLoading={isLoading}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewSearchBar;
