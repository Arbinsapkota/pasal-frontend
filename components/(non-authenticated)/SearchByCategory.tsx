"use client";

import axios from "axios";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CartItem } from "../types/cartitems";

interface Category {
  categoryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  subcategoryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export default function CategoriesWithSubcategories({
  setProducts,
  setIsLoading,
}: {
  setProducts: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{
    [key: string]: Subcategory[];
  }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Category");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const router = useRouter();

  // Fetch categories and their subcategories
  const fetchCategoriesAndSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
      );
      const fetchedCategories = categoriesResponse.data;
      setCategories(fetchedCategories);

      // Fetch subcategories for each category
      const subcategoriesMap: { [key: string]: Subcategory[] } = {};
      await Promise.all(
        fetchedCategories?.map(async (category: Category) => {
          try {
            const formData = new FormData();
            formData.append("category", category.categoryId);
            const subcategoriesResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/by-category`,
              formData
            );
            subcategoriesMap[category.categoryId] =
              subcategoriesResponse.data || [];
          } catch {
            subcategoriesMap[category.categoryId] = [];
          }
        })
      );

      setSubcategories(subcategoriesMap);
      setLoading(false);
    } catch (err: unknown) {
      console.log(err);
      setError("Failed to fetch categories and subcategories.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, []);

  function categoryFetch(categoryId: string) {
    setIsLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/by-category`, {
        params: {
          categoryId,
        },
      })
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products based on Category", err);
        setIsLoading(false);
      });
  }

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-52">
          <div
            className={cn(
              buttonVariants({ variant: "outline" }),
              "cursor-pointer flex  items-center justify-between "
            )}
          >
            <p>{selectedCategory}</p>

            <ChevronDown
              className={cn(
                "h-4 w-4 transition-all text-muted-foreground mt-1",
                {
                  "-rotate-180": isDropdownOpen,
                }
              )}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuGroup>
            {categories &&
              categories?.length > 0 &&
              categories?.map((category) => (
                <div key={category.categoryId}>
                  {/* <i className="fa-solid fa-list mr-2" /> */}
                  <DropdownMenuGroup>
                    {subcategories[category.categoryId] &&
                    subcategories[category.categoryId].length > 0 ? (
                      <DropdownMenuSub>
                        <>
                          <DropdownMenuSubTrigger
                            onClick={() => {
                              setIsLoading(true);
                              categoryFetch(category.categoryId);
                              setIsDropdownOpen(false);
                              setSelectedCategory(category.name);
                            }}
                          >
                            {category.name}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="min-w-40">
                              {subcategories[category?.categoryId] &&
                                subcategories[category?.categoryId]?.length >
                                  0 &&
                                subcategories[category.categoryId]?.map(
                                  (subcategory) => (
                                    <DropdownMenuItem
                                      className=""
                                      key={subcategory.subcategoryId}
                                      onClick={() => {
                                        categoryFetch(
                                          subcategory.subcategoryId
                                        );
                                        setIsDropdownOpen(false);
                                        setSelectedCategory(subcategory.name);
                                      }}
                                    >
                                      {subcategory.name}
                                    </DropdownMenuItem>
                                  )
                                )}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          categoryFetch(category.categoryId);
                          setIsDropdownOpen(false);
                          setSelectedCategory(category.name);
                        }}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </div>
              ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>{" "}
      </DropdownMenu>
    </div>
  );
}
