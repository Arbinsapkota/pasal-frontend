"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Category = {
  id?: string | number;
  name: string;
  imageUrl?: string;
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/`
      );
      setCategories(response.data as Category[]); // store categories
    } catch (err) {
      console.log("Error fetching categories: ", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (fetching) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  // Settings for react-slick carousel
  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,          // ✅ enable autoplay
    autoplaySpeed: 2000,     // ✅ 2 seconds per slide
    arrows: false,           // optional: hide arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <section className="py-10">
      <div className="text-center">
        <p className="text-gray-500 text-sm">Categories</p>
        <h2 className="text-2xl font-semibold">
          Featured <span className="text-green-600">Categories</span>
        </h2>
      </div>

      <div className="mt-10">
        {categories.length > 7 ? (
          // Carousel for more than 7 categories
          <Slider {...carouselSettings}>
            {categories.map((cat, index) => (
              <div
                key={cat.id || index}
                className="text-center cursor-pointer px-2"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 shadow flex items-center justify-center">
                  <Image
                    src={cat.imageUrl || "/placeholder.png"}
                    alt={cat.name}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 font-medium text-gray-700">{cat.name}</p>
              </div>
            ))}
          </Slider>
        ) : (
          // Grid for 7 or fewer categories
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <div
                key={cat.id || index}
                className="text-center cursor-pointer hover:scale-105 transition"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 shadow flex items-center justify-center">
                  <Image
                    src={cat.imageUrl || "/placeholder.png"}
                    alt={cat.name}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 font-medium text-gray-700">{cat.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
