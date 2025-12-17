"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Box, Slider, debounce } from "@mui/material";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { capitalizeFirstLetter } from "@/lib/capital";
import { Product } from "@/redux/slices/cartSlice";
import { Checkbox } from "../ui/checkbox";
import { MdOutlineMenuOpen } from "react-icons/md";
import { RiMenuFold2Fill } from "react-icons/ri";

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

interface CategoryStates {
  selectedSubCategory: string[];
  setSelectedSubCategory: React.Dispatch<React.SetStateAction<string[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categories: Category[];
  allProducts: Product[];
  setSelectedSubCategoryDetails: React.Dispatch<
    React.SetStateAction<Subcategory[]>
  >;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCategoryId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategoryId: string | undefined;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const 
ProductsSidebar = ({
  selectedSubCategory,
  setSelectedSubCategory,
  categories,
  setCategories,
  setLoading,
  allProducts,
  setSelectedSubCategoryDetails,
  isLoading,
  setIsLoading,
  setSelectedCategoryId,
  setProducts,
  setAllProducts,
  setIsUpdated,
  selectedCategoryId,
  setIsSidebarOpen,
  isSidebarOpen,
}: CategoryStates) => {
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<Subcategory[]>([]);
  const [openedCategory, setOpenedCategory] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]); // 🔥 min price changed to 0

  const toggleSubCategories = (categoryId: string) => {
    setOpenedCategory((prev) => (prev === categoryId ? undefined : categoryId));
  };

  const handleCheckboxChange = (subcategoryId: string) => {
    setSelectedSubCategory((prevSelected) => {
      const updatedSubCats = prevSelected.includes(subcategoryId)
        ? prevSelected.filter((id) => id !== subcategoryId)
        : [...prevSelected, subcategoryId];

      const updatedDetails = allSubCategories.filter((s) =>
        updatedSubCats.includes(s.subcategoryId)
      );

      setSelectedSubCategoryDetails(updatedDetails);
      return updatedSubCats;
    });
  };
console.log("-----------",selectedCategoryId)
  const fetchProducts = useCallback(
    debounce(
      (
        min: number,
        max: number,
        subcategoryIds?: string[] | null,
        categoryId?: string
      ) => {
        setLoading(true);

        const params: any = {
          minPrice: min,
          maxPrice: max,
        };

        axios
          .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, {
            params,
          })
          .then((res) => {
            let filtered = res.data;

            // ✅ FILTER BY CATEGORY
            if (categoryId) {
              filtered = filtered.filter(
                (product: any) => product.category?.category === categoryId
              );
            }

            // ✅ FILTER BY SUBCATEGORY
            if (subcategoryIds && subcategoryIds.length > 0) {
              filtered = filtered.filter((product: any) =>
                subcategoryIds.includes(product.subcategory)
              );
            }

            setProducts(filtered);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching products:", err);
            setLoading(false);
          });
      },
      500
    ),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const categoryRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        );
        setCategories(categoryRes.data);

        const productRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`
        );
        setAllProducts(productRes.data);
        setProducts(productRes.data);
        setIsUpdated(true);

        const subRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`
        );
        setAllSubCategories(subRes.data);
        setSubCategories(subRes.data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setSubCategories(
        allSubCategories.filter(
          (s) => s.category.categoryId === selectedCategoryId
        )
      );
    }
  }, [selectedCategoryId, allSubCategories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const subs = allSubCategories.filter(
      (s) => s.category.categoryId === categoryId
    );
    setSubCategories(subs);
  };

  useEffect(() => {
    fetchProducts(
      priceRange[0],
      priceRange[1],
      selectedSubCategory.length > 0 ? selectedSubCategory : null
    );
  }, [priceRange, selectedSubCategory]);

  const handleChange = (_e: any, val: number | number[]) => {
    setPriceRange(val as number[]);
  };

  return (
    <div
      className={`
        fixed h-[100vh] left-0 w-72 z-30
        p-6 flex flex-col justify-between
        border border-white/20
        backdrop-blur-xl bg-white/30
        shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        transition-all duration-500
        rounded-r-2xl
        ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Categories
        </h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-2xl sm:hidden block"
        >
          {isSidebarOpen ? <MdOutlineMenuOpen /> : <RiMenuFold2Fill />}
        </button>
      </div>

      {/* Category List */}
      <div className="flex-1 rounded-2xl p-5 bg-white/40 backdrop-blur-lg border border-gray-200 shadow-inner">
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin-sidebar">
          <Accordion
            type="single"
            collapsible
            value={openedCategory}
            onValueChange={toggleSubCategories}
            className="space-y-3"
          >
            {categories.map((category) => (
              <AccordionItem
                key={category.categoryId}
                value={category.categoryId}
                className="border-none rounded-xl bg-white/50 shadow-sm hover:shadow-md transition-all"
              >
                <AccordionTrigger
                  onClick={() => handleCategoryChange(category.categoryId)}
                  className="px-4 py-2 rounded-xl text-left font-medium text-gray-800 hover:text-blue-700 transition-all"
                >
                  {capitalizeFirstLetter(category.name)}
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-3 pt-1 space-y-2">
                  {subCategories
                    .filter(
                      (s) => s.category.categoryId === category.categoryId
                    )
                    .map((sub) => (
                      <div
                        key={sub.subcategoryId}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/60 hover:bg-blue-50/60 transition-all cursor-pointer"
                      >
                        <Checkbox
                          id={sub.subcategoryId}
                          checked={selectedSubCategory.includes(
                            sub.subcategoryId
                          )}
                          onCheckedChange={() =>
                            handleCheckboxChange(sub.subcategoryId)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label
                          htmlFor={sub.subcategoryId}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {capitalizeFirstLetter(sub.name)}
                        </label>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* 🔥 Premium Price Filter */}
        <div className="mt-6 bg-white/90 backdrop-blur-xl shadow-xl border border-gray-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Range</h3>

          {/* Inputs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Min Price</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-full px-3 py-2 mt-1 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs text-gray-500">Max Price</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full px-3 py-2 mt-1 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>
          </div>

          {/* Slider */}
          <Box sx={{ width: "100%" }}>
            <Slider
              value={priceRange}
              onChange={handleChange}
              min={0} // 🔥 changed to 0
              max={500000}
              valueLabelDisplay="auto"
              sx={{
                color: "#0037c8",
                height: 6,
                "& .MuiSlider-track": {
                  border: "none",
                  background: "linear-gradient(90deg, #0037C8, #00A2FF)",
                },
                "& .MuiSlider-rail": {
                  opacity: 0.3,
                  backgroundColor: "#d1d5db",
                },
                "& .MuiSlider-thumb": {
                  height: 20,
                  width: 20,
                  backgroundColor: "#ffffff",
                  border: "3px solid #0037c8",
                  "&:hover": {
                    boxShadow: "0 0 0 8px rgba(0, 55, 200, 0.15)",
                  },
                },
              }}
            />
          </Box>

          {/* Display */}
          <p className="text-sm text-gray-600 text-center">
            Rs {priceRange[0].toLocaleString()} — Rs{" "}
            {priceRange[1].toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsSidebar;
