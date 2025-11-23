"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMedia } from "use-media";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
interface SuperCategory {
  superCategoryId: string;
  name: string;
  categoryImageUrl: string;
}
interface Category {
  superCategory: SuperCategory;
  name: string;
  categoryId: string;
}
interface SubCategory {
  category: Category;
  name: string;
  subcategoryId: string;
}
const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuperCategory, setActiveSuperCategory] = useState<string | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [superCategories, setSuperCategories] = useState<SuperCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const route = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveSuperCategory(null);
      setActiveCategory(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);
  //  this is used for mage to show the category list in the megamenu as responsive
  const isMd = useMedia({ maxWidth: 1024 });
  const isLg = useMedia({ maxWidth: 1200 });

  const visibleCategories = isMd
    ? superCategories.slice(0, 3)
    : isLg
    ? superCategories.slice(0, 5)
    : superCategories.slice(0, 6);

  // fetch category
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/`)
      .then(response => {
        setSuperCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching super categories:", error);
        // setIsLoading(false);
      });

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        // setIsLoading(false);
      });

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`)
      .then(response => {
        setSubCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        // setIsLoading(false);
      });
  }, []);

  return (
    <nav className="md:bg-blue-800 bg-white  sm:text-white text-gray-800">
      <div className="max-w-7xl hidden md:flex mx-auto sm:px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full h-8">
          {/* Visible categories */}
          <div className="flex items-center space-x-2">
            {visibleCategories.map(superCategory => (
              <div
                key={superCategory.superCategoryId}
                className="relative"
                onMouseEnter={() =>
                  setActiveSuperCategory(String(superCategory.superCategoryId))
                }
                onMouseLeave={() => setActiveSuperCategory(null)}
              >
                <button className="sm:px-0 md:px-3 py-1 text-sm font-medium flex items-center ">
                  {superCategory.name}
                  <span className="pt-1 pl-1">
                    {activeSuperCategory ===
                    String(superCategory.superCategoryId) ? (
                      <IoIosArrowUp size={15} />
                    ) : (
                      <IoIosArrowDown size={15} />
                    )}
                  </span>
                </button>

                {/* Dropdown */}
                {activeSuperCategory ===
                  String(superCategory.superCategoryId) && (
                  <div
                    className={cn(
                      "absolute left-0  w-screen bg-white text-gray-900 shadow-lg rounded-lg z-10 scrollbar-thin",
                      activeSuperCategory ===
                        String(superCategory.superCategoryId) &&
                        (Number(superCategory.superCategoryId) ===
                        visibleCategories.length - 1
                          ? "max-w-[200px] md:max-w-[250px] max-h-[400px] overflow-y-scroll scrollbar-thin overflow-x-hidden " // For last item
                          : "max-w-[200px]  md:max-w-md max-h-[400px] overflow-y-scroll overflow-x-hidden scrollbar-thin ") // Others
                    )}
                  >
                    <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 ">
                      {categories
                        .filter(
                          category =>
                            category.superCategory.superCategoryId ===
                            superCategory.superCategoryId
                        )
                        .map(category => (
                          <div key={category.categoryId}>
                            <p className="font-semibold">{category.name}</p>
                            <div className="mt-1 space-y-1">
                              {subCategories
                                .filter(
                                  sub =>
                                    sub.category.categoryId ===
                                    category.categoryId
                                )
                                .map(sub => (
                                  <Link
                                    key={sub.subcategoryId}
                                    href={`/homepage/products?subCat=${sub.subcategoryId}`}
                                    className="block px-2 py-1 text-sm  hover:bg-gray-100 rounded-md"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* See More Button */}
          <Link
            href="/homepage/products"
            className="px-3 py-1 text-sm font-medium hover:underline rounded-md"
          >
            See More
          </Link>
        </div>
      </div>

      <div className="md:hidden block">
        <div className=" pt-1 pb-8 space-y-1 max-h-[82vh] overflow-y-auto">
          {superCategories.map(superCategory => (
            <div key={superCategory.name}>
              <button
                onClick={() =>
                  setActiveSuperCategory(
                    activeSuperCategory === superCategory.name
                      ? null
                      : superCategory.name
                  )
                }
                className="w-full text-left px-3 py-1 text-base font-medium text-gray-950 hover:text-blue-600  rounded-md flex items-center gap-1"
              >
                {superCategory.name}
                <span className="flex items-center justify-center ">
                  {activeSuperCategory === superCategory.name ? (
                    <IoIosArrowUp size={15} />
                  ) : (
                    <IoIosArrowDown size={15} />
                  )}
                </span>
              </button>
              {activeSuperCategory === superCategory.name && (
                <div className="pl-4 space-y-1">
                  {categories
                    .filter(
                      category =>
                        category.superCategory.superCategoryId ===
                        superCategory.superCategoryId
                    )
                    .map(category => (
                      <div key={category.name}>
                        <button
                          onClick={() =>
                            setActiveCategory(
                              activeCategory === category.name
                                ? ""
                                : category.name
                            )
                          }
                          className="w-full text-left px-3 py-1 text-sm font-medium text-gray-800 hover:text-blue-600 rounded-md flex gap-1 justify items-center"
                        >
                          {category.name}
                          <span className="flex items-center justify-center ">
                            {activeCategory === category.name ? (
                              <IoIosArrowUp size={12} />
                            ) : (
                              <IoIosArrowDown size={12} />
                            )}
                          </span>
                        </button>
                        {activeCategory === category.name && (
                          <div className="pl-4 space-y-1">
                            {subCategories
                              .filter(
                                sub =>
                                  sub.category.categoryId ===
                                  category.categoryId
                              )
                              .map(subCategory => (
                                <Link
                                  key={subCategory.name}
                                  href={`/homepage/products?subCat=${subCategory.subcategoryId}`}
                                  className="block px-3 py-1 text-sm text-gray-600 hover:text-blue-600  "
                                  onClick={toggleMenu}
                                >
                                  {subCategory.name}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/homepage/products"
            className="block px-3 py-2 text-base font-medium hover:bg-blue-700 rounded-md"
            onClick={toggleMenu}
          >
            See More
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenu;
