import Image from "next/image";
import { useEffect, useState } from "react";
import { axiosInstance } from "../axiosInstance";
import LoadingContent from "../loaidng/LoaidngCotent";

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
      .then(response => {
        const [img] = response.data.filter(
          (item: any) => item.mediaType == "BANNER"
        );
        setImg(img);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching feature image", err);
        setIsLoading(false);
      });
  }, []);
  return (
    <div className=" w-[100%] h-auto  sm:mt-[60px] mt-[55px]">
      {isLoading ? (
        <div className="sm:h-[280px] h-[200px] w-full bg-gray-300 animate-pulse rounded-md"></div>
      ) : (
        <Image
          src={img?.mediaUrl || "/salebanner.png"}
          alt="sale banner image"
          height={1000}
          width={1000}
          className=" w-full h-[200px] sm:h-[300px] rounded-md  "
          style={{ objectFit: "cover" }}
        />
      )}
    </div>
  );
}

export default SaleBanner;
