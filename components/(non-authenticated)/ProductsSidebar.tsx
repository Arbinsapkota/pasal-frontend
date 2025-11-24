"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Box, Slider, debounce } from "@mui/material";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { capitalizeFirstLetter } from "@/lib/capital";
import { Product } from "@/redux/slices/cartSlice";
import { Checkbox } from "../ui/checkbox";
import { MdOutlineMenuOpen } from "react-icons/md";
import { RiMenuFold2Fill } from "react-icons/ri";
import toast from "react-hot-toast";

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
  setSelectedSubCategoryDetails: React.Dispatch<React.SetStateAction<Subcategory[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategoryId: string | undefined;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductsSidebar = ({
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
  const [priceRange, setPriceRange] = useState<number[]>([25, 500000]);

  const toggleSubCategories = (categoryId: string) => {
    setOpenedCategory(prev => (prev === categoryId ? undefined : categoryId));
  };

  const handleCheckboxChange = (subcategoryId: string) => {
    setSelectedSubCategory(prevSelected => {
      const updatedSubCats = prevSelected.includes(subcategoryId)
        ? prevSelected.filter(id => id !== subcategoryId)
        : [...prevSelected, subcategoryId];

      const updatedSubCatDetails = allSubCategories.filter(sub =>
        updatedSubCats.includes(sub.subcategoryId)
      );
      setSelectedSubCategoryDetails(updatedSubCatDetails);

      return updatedSubCats;
    });
  };

  const fetchProducts = useCallback(
    debounce((min: number, max: number, subcategoryIds?: string[] | null) => {
      setLoading(true);
      const params: any = { minPrice: min, maxPrice: max };

      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { params })
        .then(res => {
          let filtered = res.data;
          if (subcategoryIds && subcategoryIds.length > 0) {
            filtered = filtered.filter((product: any) =>
              subcategoryIds.includes(product.subcategory)
            );
          }
          setProducts(filtered);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching products:", err);
          setLoading(false);
        });
    }, 500),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const categoryResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`);
        setCategories(categoryResponse.data);

        const productResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`);
        setAllProducts(productResponse.data);
        setProducts(productResponse.data);
        setIsUpdated(true);

        const subCategoryResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`);
        setAllSubCategories(subCategoryResponse.data);
        setSubCategories(subCategoryResponse.data);
      } catch (error) {
        console.error("Error in API calls:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setSubCategories(allSubCategories.filter(sub => sub.category.categoryId === selectedCategoryId));
    }
  }, [selectedCategoryId, allSubCategories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const subCats = allSubCategories.filter(sub => sub.category.categoryId === categoryId);
    setSubCategories(subCats);
  };

  useEffect(() => {
    fetchProducts(priceRange[0], priceRange[1], selectedSubCategory.length > 0 ? selectedSubCategory : null);
  }, [priceRange, selectedSubCategory]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  return (
    <div
      className={`fixed sm:h-[100vh] h-[100vh] left-0 w-64 shadow-2xl p-5 flex flex-col justify-between border border-gray-100 bg-white z-20 ${
        isSidebarOpen ? "" : "-ml-96 opacity-0"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-2xl sm:hidden block"
        >
          {isSidebarOpen ? <MdOutlineMenuOpen className="mt-2" /> : <RiMenuFold2Fill className="mt-1" />}
        </button>
      </div>

      {/* Categories List */}
      <div className="flex-1 flex flex-col overflow-hidden box-border border rounded-xl p-5 shadow-md">
        <div className="flex-1 overflow-y-auto scrollbar-thin-sidebar">
          <Accordion type="single" collapsible className="w-full space-y-3" value={openedCategory} onValueChange={toggleSubCategories}>
            {categories.map(category => (
              <AccordionItem key={category.categoryId} value={category.categoryId}>
                <AccordionTrigger onClick={() => handleCategoryChange(category.categoryId)} className="text-left hover:text-blue-600 px-4 py-1 my-0 rounded-lg transition-all font-medium hover:no-underline text-gray-700">
                  {capitalizeFirstLetter(category.name)}
                </AccordionTrigger>
                <AccordionContent className="mt-1 px-3 py-2 space-y-1">
                  {subCategories
                    .filter(sub => sub.category.categoryId === category.categoryId)
                    .map(subCat => (
                      <div key={subCat.subcategoryId} className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition-all">
                        <Checkbox
                          id={subCat.subcategoryId}
                          checked={selectedSubCategory.includes(subCat.subcategoryId)}
                          onCheckedChange={() => handleCheckboxChange(subCat.subcategoryId)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label htmlFor={subCat.subcategoryId} className="text-sm text-gray-700 font-medium cursor-pointer">
                          {capitalizeFirstLetter(subCat.name)}
                        </label>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Price Filter */}
        <div className="mt-6 bg-white shadow-md border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Price</h3>
          <p className="text-sm text-gray-600 mb-3">Rs{priceRange[0]} - Rs{priceRange[1]}</p>
          <Box sx={{ width: "100%" }}>
            <Slider
              getAriaLabel={() => "Price range"}
              value={priceRange}
              onChange={handleChange}
              min={10}
              max={500000}
              valueLabelDisplay="auto"
              sx={{ color: "#0037c8" }}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ProductsSidebar;
