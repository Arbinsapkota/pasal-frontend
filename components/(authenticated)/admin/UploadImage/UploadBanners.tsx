import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosMultipartInstance } from "@/components/axiosInstance";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";

interface Feature {
  featureId: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  activeStatus: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  mediaFile: string | null;
}

const UploadBanner: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [bannerImages, setBannerImages] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isUploaded, setIsUploaded] = useState<boolean>(true);

  // Fetch all BANNER images
  useEffect(() => {
    const fetchBannerImages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/media/`);
        const data = await response.json();
        const banners = data.filter(
          (item: any) => item?.mediaType === "BANNER"
        );
        setBannerImages(banners);
      } catch (err) {
        setError("Failed to fetch banner images.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerImages();
  }, [isUploaded, API_BASE_URL]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (bannerImages.length > 0) {
      setError(
        "Only one banner image is allowed. Please delete the existing image before uploading a new one."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles([]);
      return;
    }

    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      if (selectedFiles.length > 1) {
        setError("Only one image can be uploaded at a time.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFiles([]);
        return;
      }

      setFiles(selectedFiles);
      setError(null);
    }
  };

  const handleUploadImages = async () => {
    if (bannerImages.length > 0) {
      setError(
        "Only one banner image is allowed. Please delete the existing image before uploading a new one."
      );
      return;
    }
    

    if (files.length === 0) {
      setError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("mediaFile", file);
      formData.append("title", "BANNER");
      formData.append("mediaType", "BANNER");

      await axiosMultipartInstance().post(`/api/media/`, formData);

      toast.success("Banner image uploaded successfully.");
      setFiles([]);
      setIsUploaded(prev => !prev);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await axiosMultipartInstance().delete(`/api/media/?imageId=${id}`);
      toast.success("Image deleted successfully.");
      setIsUploaded(prev => !prev);
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Failed to delete image.");
    }
  };

  return (
    <div className="w-full my-3 mx-auto p-6 bg-white shadow-lg rounded-xl h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Manage Banner Images
      </h2>
      <p className="text-gray-400 mb-2">
        Note:- Please upload the image less then 10 MB.
      </p>
      {/* Upload Section */}
      <div className="flex items-center sm:flex-row flex-col gap-6 mb-6">
        <div>
          {files.length === 0 ? (
            <Image
              src="/uploadImage.png"
              alt="Placeholder"
              width={400}
              height={400}
              className="rounded-lg border-2 sm:max-w-[400px] sm:h-auto w-full h-[200px] border-gray-300"
              unoptimized
            />
          ) : (
            <Image
              src={URL.createObjectURL(files[0])}
              alt="Selected Preview"
              width={400}
              height={400}
              className="rounded-lg border-2 border-gray-300 object-contain"
              unoptimized
            />
          )}
          {bannerImages.length > 0 && (
            <p className="pt-2 text-md text-red-500">
              Please delete the previous uploaded image to upload new banner
              image.
            </p>
          )}
          {files.length > 0 && (
            <Button
              onClick={handleUploadImages}
              disabled={isSubmitting || bannerImages.length > 0}
              className="mt-4 bg-green-600 text-white text-xl font-semibold py-6 px-10"
            >
              {isSubmitting ? "Uploading..." : "Upload Image"}
            </Button>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple={false}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={bannerImages.length > 0}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={bannerImages.length > 0}
            className="bg-blue-600 text-white text-xl font-semibold py-6 px-10"
          >
            {files.length > 0 ? "Change Image" : "Add Image"}
          </Button>
        </div>
      </div>

      {/* Banner Images */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">
        Uploaded Banner Images
      </h3>
      <div className="grid justify-center max-h-[600px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 1 }).map((_, index) => (
            <LoadingContent className="h-56" key={index} />
          ))
        ) : bannerImages.length > 0 ? (
          bannerImages.map(image => (
            <div key={image.featureId} className="relative group h-56 w-full">
              <Image
                height={800}
                width={800}
                src={`${NEXT_PUBLIC_CLOUDINARY_URL}${image?.mediaUrl}`}
                alt={`Banner ${image.featureId}`}
                unoptimized
                style={{ objectFit: "contain" }}
                className="w-full h-56 rounded-lg border-2 border-gray-200 shadow-md m-2"
              />
              <button
                onClick={() => handleDeleteImage(image.featureId)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100"
                aria-label="Delete image"
              >
                <AiOutlineDelete className="text-xl" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full h-[220px] w-[220px] bg-gray-100 text-gray-500 rounded-md flex items-center justify-center text-xl">
            No banner images available.
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
};

export default UploadBanner;
