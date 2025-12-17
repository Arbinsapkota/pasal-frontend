import React, { useEffect, useState } from "react";
import Image from "next/image";
import EditProduct from "./EditProduct";
import DeleteModal from "./DeleteModal";
import { Eye } from "lucide-react";
import ProductDetails from "./ProductDetails";
import { Button, buttonVariants } from "@/components/ui/button";
import { Product } from "@/redux/slices/cartSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MdEdit } from "react-icons/md";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectContent } from "@radix-ui/react-select";
import axios from "axios";

interface Category {
  categoryId: string;
  name: string;
  superCategory: {
    superCategoryId: string;
    name: string;
  };
  createdAt: string;
}

const ProductList = ({ isAdded }: { isAdded?: boolean }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewing, setIsViewing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const [isUpdated, setIsUpdated] = useState<boolean>(true);

  // search by the category id
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchByCategory, setSearchByCategory] = useState<string | undefined>(
    undefined
  );
  // categoryId
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 15;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    const url =
      searchByCategory === "1"
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`
        : searchByCategory
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/by-category?categoryId=${searchByCategory}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`;

    const fetchProducts = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isUpdated, isAdded, searchByCategory]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
    setCurrentPage(1); // Reset to the first page when sorting
  };

  const filteredProducts = products.filter(
    product =>
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortOption === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (sortOption === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }
    if (sortOption === "price-asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortOption === "price-desc") {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  // for search by the filter

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="  py-4 h-full">
      {/* Search and Sort Section */}

      <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4 w-full">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 p-2 rounded w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortOption}
          onChange={handleSort}
          className="border border-gray-300 p-2 rounded w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sort by</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>

        <div className="w-64">
          <Select
            onValueChange={value => {
              setSearchByCategory(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter By Category" />
            </SelectTrigger>
            <SelectContent className="border-gray-400 border rounded-md bg-white w-64 h-64  overflow-y-scroll z-20">
              <SelectItem value={"1"}>All Products</SelectItem>
              {categories.map(category => (
                <SelectItem
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-scroll max-w-full  p-4 h-full border rounded-lg mt-2">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="text-center bg-gray-100">
              <th className="py-3 px-4 border-b ">S.N</th>
              <th className="py-3 px-4 border-b ">Image</th>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Category</th>
              <th className="py-3 px-4 border-b">Stock</th>
              <th className="py-3 px-4 border-b">Price</th>
              <th className="py-3 px-4 border-b">Discount </th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    // className="hover:bg-gray-50 transition-colors duration-200 border-b "
                  >
                    <td colSpan={11}>
                      <LoadingContent className="h-8 w-full px-2" />
                    </td>
                  </tr>
                ))
              : paginatedProducts.map((product, index) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-gray-50 transition-colors duration-200 border-b "
                  >
                    <td className="py-3 px-4 text-center">
                      {(currentPage - 1) * 15 + (index + 1)}
                    </td>

                    <td className="py-3 px-4 text-center ">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${product?.imageUrls[0]}` || "/placeholder.png"}
                        alt={product?.name}
                        width={200}
                        height={200}
                        className="object-cover rounded-md h-16 w-auto max-w-32"
                      />
                    </td>
                    <td className="py-3  text-center min-w-52 ">
                      {product?.name}
                    </td>
                    <td className="py-3 px-4 text-center   ">
                      {product?.categoryName}
                    </td>

                    <td className="py-3 px-4 text-center text-primary">
                      {product?.stock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      Rs.{product?.price?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-red-700">
                      {product.discountPercentage === null ? (
                        <span>
                          {" "}
                          Rs.
                          {product?.discountedPrice?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="">
                          {product?.discountPercentage?.toFixed(2)}%
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center flex gap-2 justify-center mt-3">
                      <Button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsViewing(true);
                        }}
                        // className="bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                      >
                        <Eye />
                      </Button>
                      {/* <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsViewing(false);
                  }}
                  className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  <Pen />
                </button> */}

                      <Dialog
                        open={product.productId == activeProductId}
                        onOpenChange={isOpen =>
                          setActiveProductId(isOpen ? product.productId : null)
                        }
                      >
                        <DialogTrigger
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "text-muted-foreground"
                          )}
                        >
                          <MdEdit size={22} />
                        </DialogTrigger>

                        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[90%] sm:max-w-[60%] scrollbar-thin  text-black">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <EditProduct
                            product={product}
                            setActiveProductId={setActiveProductId}
                            onClose={() => setSelectedProduct(null)}
                            setIsUpdated={setIsUpdated}
                          />
                        </DialogContent>
                      </Dialog>

                      <DeleteModal
                        id={product.productId}
                        title={product.name}
                        setIsUpdated={setIsUpdated}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <p className="py-3 px-4 text-left font-semibold text-gray-600">
        Total Products: {products.length}{" "}
      </p>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 rounded-md border py-1.5">
        <div className="flex space-x-2 overflow-x-auto max-w-2xl px-2 scrollbar-hide">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(index + 1)}
              className="min-w-[40px] px-3 py-1"
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>

      {selectedProduct && isViewing && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* {selectedProduct && !isViewing && (
        <EditProduct
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          setIsUpdated={setIsUpdated}
        />
      )} */}
    </div>
  );
};

export default ProductList;
