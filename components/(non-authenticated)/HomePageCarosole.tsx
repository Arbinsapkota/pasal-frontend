"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

interface Images {
  mediaType: string;
  mediaUrl: string;
}

export default function HomePageCarousel() {
  const [slides, setSlides] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/`,
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          const urls = response.data
            .filter((item: Images) => item.mediaType === "FEATURE")
            .map((item: Images) => item.mediaUrl);

          setSlides(urls);
        }
      } catch (error) {
        console.error("Error fetching background images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackgroundImages();
  }, []);

  return (
    <div className="w-full px-4 relative">
      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
        >
          {slides.map((url, index) => (
            <SwiperSlide key={index}>
              <div className="relative aspect-[16/9] md:aspect-[3/1] rounded-lg">
                <Image
                  src={url}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </SwiperSlide>
          ))}

          {/* Navigation Buttons */}
          <div className="swiper-button-prev !text-white !bg-black/50 !rounded-full !p-3 hover:!bg-black/70"></div>
          <div className="swiper-button-next !text-white !bg-black/50 !rounded-full !p-3 hover:!bg-black/70"></div>
        </Swiper>
      )}

      {/* Pagination Styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 10px !important;
        }
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 5px;
          background-color: #facc15;
        }
      `}</style>
    </div>
  );
}
