"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";
import { useRouter } from "next/navigation";

type Category = {
  categoryId?: string | number;
  name: string;
  categoryImageUrl?: string;
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const router = useRouter();

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
      );
      setCategories(response.data as Category[]);
    } catch (err) {
      console.log("Error fetching categories:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (fetching) {
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse">
        Loading categories...
      </div>
    );
  }

  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1800,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

  const firstSix = categories.slice(0, 6);

  // Redirect function
const handleCategoryClick = (category: Category) => {
  router.push(`/homepage/products?categoryId=${category.categoryId}`);
};


  return (
    <section className="py-14">
      <div className="text-center mb-10">
        <p className="text-sm text-gray-500 tracking-wide">Shop by Category</p>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Featured Categories
        </h2>
      </div>

      <div className="mt-8">
        {categories.length > 6 ? (
          <Slider {...carouselSettings}>
            {categories.map((cat, index) => {
                  console.log("---------------------------",cat.categoryId)
            return(
              <div
                key={cat.categoryId || index}
                className="px-3 cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="p-4 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-24 h-24 mx-auto bg-gray-50 shadow-inner flex items-center justify-center overflow-hidden rounded-full">
                    <Image
                      src={
                        `${NEXT_PUBLIC_CLOUDINARY_URL}${cat.categoryImageUrl}` ||
                        "/placeholder.png"
                      }
                      alt={cat.name}
                      width={500}
                      height={500}
                      className="object-contain transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <p className="mt-3 text-center font-semibold text-gray-700">
                    {cat.name}
                  </p>
                </div>
              </div>
            )})}
          </Slider>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {firstSix.map((cat, index) => (
              <div
                key={cat.categoryId || index}
                className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="w-24 h-24 mx-auto rounded-xl bg-gray-50 shadow-inner flex items-center justify-center overflow-hidden">
                  <Image
                    src={
                      `${NEXT_PUBLIC_CLOUDINARY_URL}${cat.categoryImageUrl}` ||
                      "/placeholder.png"
                    }
                    alt={cat.name}
                    width={80}
                    height={80}
                    className="object-contain transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <p className="mt-3 text-center font-semibold text-gray-700">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
