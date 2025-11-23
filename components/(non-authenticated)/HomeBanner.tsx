"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoadingContent from "../loaidng/LoaidngCotent";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";

interface Images {
  mediaType: string;
  mediaUrl: string;
}

const CarousalBanner: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [popupImage, setPopupImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [videoUrl, setVideoUrl] = useState<string>("");

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch background images from API
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
          // Extract only fileUrls with imageType "FEATURE"
          const urls = response.data
            .filter((item: Images) => item.mediaType === "FEATURE")
            .map((item: Images) => item?.mediaUrl);
          const mixed = [...urls, ...urls, urls[0]];
          setBackgroundImages(mixed);

          const popupItem = response.data.find(
            (item: Images) => item?.mediaType === "POPUP"
          );

          setPopupImage(popupItem?.mediaUrl);

          // const videoItem = response.data.find(
          //   (item: Images) => item?.mediaType === "VIDEO"
          // );

          // setVideoUrl(videoItem?.mediaUrl || "/simplestrength.mp4"); // Set video URL or default

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching background images:", error);
        setIsLoading(false);
      }
    };

    fetchBackgroundImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        return (prevIndex + 1) % backgroundImages.length;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("banner_shown");
    if (!hasShown) {
      setIsOpen(true); // show popup
      sessionStorage.setItem("banner_shown", "true");
    } else {
      setIsOpen(false);
    }
  }, []);

  const handlePrevious = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
  };

  return (
    <div>
      {/* Main Banner */}
      <div
        className="relative w-full flex flex-col sm:flex-row gap-0 aspect-[3/1]  px-1 sm:px-4 -mt-2 "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Custom Carousel */}
        <div className="w-full h-full overflow-hidden rounded-2xl ">
          <div
            className="flex transition-transform duration-500 h-full "
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transitionDuration: currentIndex === 0 ? "0ms" : "500ms",
            }}
          >
            {isLoading ? (
              <div className="sm:h-[400px] h-[25vh]  w-full bg-gray-300 animate-pulse"></div>
            ) : (
              backgroundImages.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="relative aspect-[3/1]  ">
                    <Image
                      src={`${NEXT_PUBLIC_CLOUDINARY_URL}${image}`}
                      alt={`Slide ${index + 1}`}
                      layout="fill"
                      className="object-cover rounded-xl sm:rounded-r-none aspect-[3/1] "
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className={`absolute top-1/2 text-white left-4 transform -translate-y-1/2 p-3 rounded-full transition-all ${
              isHovered ? "opacity-100" : "opacity-80"
            }`}
          >
            &#10094;
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className={`absolute top-1/2 text-white right-4 transform -translate-y-1/2 p-3 rounded-full transition-all ${
              isHovered ? "opacity-200" : "opacity-80"
            }`}
          >
            &#10095;
          </button>
        </div>

        {/* Optional Video Section (Responsive) */}
      </div>

      {/* Popup for Welcome Image */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px] max-w-[425px] p-0 ">
          <VisuallyHidden>
            <DialogTitle>Welcome!</DialogTitle>
          </VisuallyHidden>
          {isLoading ? (
            <LoadingContent className="sm:h-96 h-60 animate-pulse bg-gray-400 w-full my-0" />
          ) : (
            <>
              <div className="relative rounded shadow-lg ">
                <Image
                  src={popupImage || "/etech-logo.jpg"} // Default to logo if no popup image is available
                  alt="Popup Image"
                  width={600}
                  height={600}
                  className="rounded-lg sm:h-96  h-60  w-full object-fill"
                />
              </div>
              {/* <DialogClose className="h-0 absolute right-2 top-2 z-50">
                <div className="p-1 left-0 z-30 rounded-full  hover:bg-red-600 text- cursor-pointer">
                  <X className="h-5 w-5" />
                </div>
              </DialogClose> */}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarousalBanner;
