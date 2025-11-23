import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { capitalizeFirstLetter } from "@/lib/capital";
import { Product } from "@/redux/slices/cartSlice";
import { Box, debounce, Slider } from "@mui/material";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../axiosInstance";
import { Checkbox } from "../ui/checkbox";
import { MdOutlineMenuOpen } from "react-icons/md";
import { RiMenuFold2Fill } from "react-icons/ri";
import LoadingContent from "../loaidng/LoaidngCotent";
import { AccordionHeader } from "@radix-ui/react-accordion";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
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
  // priceRange: number[];
  // handleChange: (key: Event, val: number | number[]) => void;
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

const ProductsSidebar = ({
  selectedSubCategory,
  // priceRange,
  // handleChange,
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
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<
    Category[]
  >([]);
  const [isSubCategoryDisplayed, setIsSubcategoryDisplayed] =
    useState<boolean>(false);
  const [showSubCategories, setShowSubCategories] = useState<string | null>(
    null
  );

  const [allSubCategories, setAllSubCategories] = useState<Subcategory[]>([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<
    Category[]
  >([]);
  const [openedCategory, setOpenedCategory] = useState<string | undefined>();
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState<boolean>(true);
  const [allProductsByCategory, setAllProductsByCategory] = useState<Product[]>(
    []
  );
  const [activeSuperCategory, setActiveSuperCategory] = useState<string | null>(
    null
  );
  const [superCategories, setSuperCategories] = useState<SuperCategory[]>([]);

  const [priceRange, setPriceRange] = useState<number[]>([25, 500000]);

  const toggleSubCategories = (categoryId: string) => {
    setShowSubCategories(prev => (prev === categoryId ? null : categoryId));
  };

  const handleCheckboxChange = (subcategoryId: string) => {
    setIsSubcategoryDisplayed(true);

    setSelectedSubCategory(prevSelected => {
      const updatedSubCats = prevSelected.includes(subcategoryId)
        ? prevSelected.filter(id => id !== subcategoryId)
        : [...prevSelected, subcategoryId];

      // Derive subcategory details from updated list
      const updatedSubCatDetails = allSubCategories.filter(sub =>
        updatedSubCats.includes(sub.subcategoryId)
      );
      setSelectedSubCategoryDetails(updatedSubCatDetails);

      // Derive unique categories from selected subcategories
      const updatedCategoryDetails = categories.filter(cat =>
        updatedSubCatDetails.some(
          sub => sub.category.categoryId === cat.categoryId
        )
      );
      setSelectedCategoryDetails(updatedCategoryDetails);

      return updatedSubCats;
    });
  };

  const fetchProductsBySubCategory = async (subCatIds: string[]) => {
    const selectedProducts = allProducts.filter(prod => {
      if (prod?.subcategory) {
        return subCatIds.includes(prod?.subcategory);
      }
    });
    setProducts([...selectedProducts]);
  };

  useEffect(() => {
    if (isLoading || !allSubCategories.length) return;

    const categoryParam = searchParams.get("category");
    const subCatParam = searchParams.get("subCat");

    if (subCatParam) {
      const subCatDetail = allSubCategories.find(
        subCat => subCat.subcategoryId === subCatParam
      );

      if (subCatDetail) {
        const categoryId = subCatDetail.category.categoryId;

        setSelectedCategoryId(categoryId);
        setSelectedSubCategory([subCatParam]);
        setSelectedSubCategoryDetails([subCatDetail]);
        setOpenedCategory(categoryId);
        setSubCategories(
          allSubCategories.filter(sub => sub.category.categoryId === categoryId)
        );
        handleCategoryChange(categoryId); // load products for this category
      }
    } else if (categoryParam) {
      setSelectedCategoryId(categoryParam);
      handleCategoryChange(categoryParam);
    }
  }, [isLoading, allSubCategories, searchParams]);

  useEffect(() => {
    setLoading(true);
    setIsLoading(true);
    setLoadingCategory(true);

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/`)
      .then(response => {
        setSuperCategories(response.data);
        setShowAllCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching super categories:", error);
        // setIsLoading(false);
      });

    try {
      setLoadingCategory(true);
      const fetchCategories = async () => {
        try {
          const categoryResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
          );
          setCategories(categoryResponse.data);
          axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, {
              // params: {
              //   minPrice: 100,
              //   maxPrice: 5000,
              // },
            })
            .then(response => {
              setAllProductsByCategory(response.data);
              setAllProducts(response.data);
              setIsUpdated(true);
              const allCategoriesWithProducts = categoryResponse.data.filter(
                (category: Category) =>
                  response.data?.some(
                    (prod: Product) => prod?.category == category?.categoryId
                  )
              );

              setCategoriesWithProducts(allCategoriesWithProducts);
              // setIsLoading(false);
            })
            .catch(error => {
              console.error("Error fetching products:", error);
              // setIsLoading(false);
            });
          // setIsLoading(false);
        } catch (error) {
          console.error("Error fetching categories:", error);
          // toast.error("Failed to load categories.");
          setIsLoading(false);
        } finally {
          setLoading(false);
          // setIsLoading(false);
          setLoadingCategory(false);
        }
      };

      fetchCategories();

      axiosInstance()
        .get("/api/subcategory/")
        .then(res => {
          setAllSubCategories(res.data);
          setSubCategories(res.data);
          // setIsLoading(false);
        })
        .catch(err => {
          console.error("error fetching subcategories", err);
          // setIsLoading(false);
        });
    } finally {
      setIsLoading(false);
      setLoadingCategory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setSubCategories(() =>
        allSubCategories.filter(
          sub => sub.category.categoryId == selectedCategoryId
        )
      );
    }
  }, [selectedCategoryId]);

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setLoading(false);
    // setProducts([]); // clear product list immediately
    setSelectedCategoryId(categoryId);

    // Filter subcategories belonging to the selected category
    const subCats = allSubCategories.filter(
      sub => sub.category?.categoryId === categoryId
    );

    setSubCategories(subCats);
  };

  const fetchProducts = useCallback(
    debounce(
      (
        min: number,
        max: number,
        // categoryId?: string | null,
        subcategoryIds?: string[] | null
      ) => {
        setLoading(true);
        const params: any = {
          minPrice: min,
          maxPrice: max,
        };

        // if (categoryId) {
        //   params.category = categoryId;
        // }

        axios
          .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, {
            params,
          })
          .then(res => {
            let filtered = res.data;

            // If subcategory is selected, filter by subcategory
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
      },
      500
    ),
    []
  );

  useEffect(() => {
    fetchProducts(
      priceRange[0],
      priceRange[1],
      // selectedCategoryId || null,
      selectedSubCategory.length > 0 ? selectedSubCategory : null
    );
  }, [priceRange, selectedSubCategory]);
  // Slider change handler
  const handleChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  return (
    <div
      className={` fixed   sm:h-[100vh]  h-[100vh] left-0  w-64 shadow-2xl p-5   flex flex-col justify-between border border-gray-100 bg-white z-20 ${
        isSidebarOpen ? "" : "-ml-96 opacity-0"
      } `}
    >
      {/* Scrollable Categories Section */}
      <div className="flex justify-between items-center mb-4  mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
        <button
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
          className="text-2xl sm:hidden block "
        >
          {isSidebarOpen ? (
            <MdOutlineMenuOpen className=" mt-2" />
          ) : (
            <RiMenuFold2Fill className="  mt-1" />
          )}
        </button>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden box-border border rounded-xl p-5 shadow-md">
        <div className="flex-1 overflow-y-auto scrollbar-thin-sidebar">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3"
            value={openedCategory}
            onValueChange={value => {
              setOpenedCategory(value);
              if (value) toggleSubCategories(value);
            }}
          >
            {loadingCategory ? (
              [...Array(10)].map((_, index) => (
                <p
                  className="h-[20px] w-full bg-gray-400 animate-pulse rounded-md"
                  key={index}
                />
              ))
            ) : (
              <div>
                {superCategories.map(supper => {
                  return (
                    <div key={supper.superCategoryId} className="space-y-2">
                      <div className=" mt-3">
                        <button
                          onClick={() =>
                            setActiveSuperCategory(
                              activeSuperCategory === supper.name
                                ? null
                                : supper.name
                            )
                          }
                          className="w-full text-left sm:text-sm text-xs   font-medium text-gray-950 hover:text-blue-600 rounded-md flex items-center gap-1"
                        >
                          {supper.name}
                          <span className="flex items-center justify-center ">
                            {activeSuperCategory === supper.name ? (
                              <IoIosArrowUp size={14} />
                            ) : (
                              <IoIosArrowDown size={14} />
                            )}
                          </span>
                        </button>
                      </div>
                      {activeSuperCategory === supper.name &&
                        categories
                          .filter(
                            category =>
                              category.superCategory.superCategoryId ===
                              supper.superCategoryId
                          )
                          .map(category => (
                            <AccordionItem
                              key={category.categoryId}
                              value={category.categoryId}
                            >
                              <div>
                                <AccordionTrigger
                                  onClick={() => {
                                    handleCategoryChange(category.categoryId);
                                  }}
                                  className="text-left hover:text-blue-600 px-4 py-1 my-0 rounded-lg transition-all font-medium hover:no-underline text-gray-700"
                                >
                                  {capitalizeFirstLetter(category.name)}
                                </AccordionTrigger>

                                <AccordionContent className="mt-1 px-3 py-2 space-y-1">
                                  {subCategories
                                    .filter(
                                      sub =>
                                        sub.category.categoryId ===
                                        category.categoryId
                                    )
                                    .map(subCat => (
                                      <div
                                        key={subCat.subcategoryId}
                                        className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition-all"
                                      >
                                        <Checkbox
                                          id={subCat.subcategoryId}
                                          checked={selectedSubCategory.includes(
                                            subCat.subcategoryId
                                          )}
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              subCat.subcategoryId
                                            )
                                          }
                                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <label
                                          htmlFor={subCat.subcategoryId}
                                          className="text-sm text-gray-700 font-medium cursor-pointer"
                                        >
                                          {capitalizeFirstLetter(subCat.name)}
                                        </label>
                                      </div>
                                    ))}
                                </AccordionContent>
                              </div>
                            </AccordionItem>
                          ))}
                    </div>
                  );
                })}
              </div>
            )}
          </Accordion>
        </div>

        {/* {categoriesWithProducts.length > 7 && (
          <div className="mt-4 text-start">
            <button
              onClick={() => setShowAllCategories(prev => !prev)}
              className="text-blue-600  text-sm font-medium transition-all"
            >
              {showAllCategories ? "View Less" : "View More"}
            </button>
          </div>
        )} */}
      </div>

      {/* Fixed Price Filter Section */}
      <div className="mt-6 bg-white shadow-md border border-gray-200 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Price</h3>
        <p className="text-sm text-gray-600 mb-3">
          Rs{priceRange[0]} - Rs{priceRange[1]}
        </p>

        <Box sx={{ width: "100%" }}>
          <Slider
            getAriaLabel={() => "Price range"}
            value={priceRange}
            onChange={handleChange}
            min={10}
            max={500000}
            valueLabelDisplay="auto"
            sx={{
              color: "#0037c8",
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default ProductsSidebar;
