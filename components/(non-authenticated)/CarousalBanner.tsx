"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

interface Images {
  mediaType: string;
  fileUrl: string;
}

const CarousalBanner: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    // Show the popup when the component loads
    setShowPopup(true);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  // Fetch background images from API
  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/`,
          {
            withCredentials: true,
          }
        );
        if (response.data) {
          // Extract only fileUrls with imageType "FEATURE"
          const urls = response.data
            .filter((item: Images) => item.mediaType === "FEATURE") // Optional filter
            .map((item: Images) => item.fileUrl);

          setBackgroundImages(urls);
        }
      } catch (error) {
        console.error("Error fetching background images:", error);
      }
    };

    fetchBackgroundImages();
  }, []);

  // Automatically update the current image index for sliding effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(
        prevIndex => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Slides every 5 seconds

    return () => clearInterval(intervalId);
  }, [backgroundImages.length]);

  // Handle navigation dots click
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div>
      {/* Main Banner */}
      <div className="relative w-full h-[70vh] sm:h-screen">
        <div className="relative overflow-hidden h-full">
          {/* Carousel Slider */}
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(-${currentImageIndex * 100}vw)`,
            }}
          >
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className="w-screen h-screen flex-shrink-0"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-5">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-orange-500" : "bg-gray-400"
                }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Banner Content */}
          <div className="absolute inset-0 px-2 flex flex-col justify-center items-start lg:p-2 lg:pl-4">
            <div className="text-3xl text-white lg:w-1/2 pt-10">
              this is ETECH
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-4 rounded shadow-lg">
            <Image
              src="/bannerbg.jpg" // Replace with the path to your popup image
              alt="Popup Image"
              width={400}
              height={300}
              className="rounded"
            />
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 hover:bg-red-600"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarousalBanner;
