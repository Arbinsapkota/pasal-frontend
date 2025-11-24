import Image from "next/image";
import { useEffect, useState } from "react";
import { axiosInstance } from "../axiosInstance";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";

interface Feature {
  featureId: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  activeStatus: "ACTIVE" | "INACTIVE";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  mediaFile: string | null;
}
function SaleBanner() {
  const [img, setImg] = useState<Feature | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    axiosInstance()
      .get("/api/media/")
      .then((response) => {
        const [img] = response.data.filter(
          (item: any) => item.mediaType == "BANNER"
        );
        setImg(img);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feature image", err);
        setIsLoading(false);
      });
  }, []);
  return (
    <div className="relative sm:mt-0 -mt-4 w-full sm:h-full h-[200px] px-3 sm:px-4 sm:p-3 ">
      {isLoading ? null : (
        <Image
          src={`${NEXT_PUBLIC_CLOUDINARY_URL}${img?.mediaUrl}` || ""}
          alt="sale banner image"
          height={500}
          width={500}
          className=" w-full h-80 rounded-2xl object-cover "
          
        />
      )}
    </div>
  );
}

export default SaleBanner;
