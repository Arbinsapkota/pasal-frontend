import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { AiOutlineDelete } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { axiosAuthInstance } from "@/components/axiosInstance";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import toast from "react-hot-toast";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";

const UploadCarousel: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChanged, setIsChanged] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setIsLoading(true);
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/media/`);
        const carouselImg = response.data.filter(
          (item: any) => item.mediaType === "FEATURE"
        );
        setImages(carouselImg);
      } catch (err) {
        console.error("Error fetching images:", err);
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [isChanged, API_BASE_URL]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 5) {
        setError("You cannot upload more than 5 images in total.");
        return;
      }

      setError(null);
      setFiles(newFiles);
    }
  };

  const handleUploadImages = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to upload.");
      return;
    }

    setError(null);

    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append("mediaFile", file);
        formData.append("mediaType", "FEATURE");
        formData.append("title", "top-banner");

        return axiosAuthInstance().post(
          `${API_BASE_URL}/api/media/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      });

      await Promise.all(uploadPromises);
      setFiles([]);
      toast.success("Carousel Uploaded successfully!");
      setIsChanged((prev) => !prev);
    } catch (err) {
      console.error("Error uploading images:", err);
      setError("Failed to upload one or more images. Please try again.");
      toast.error("Try again please.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await axiosAuthInstance().delete(
        `${API_BASE_URL}/api/media/?imageId=${id}`
      );
      setIsChanged((prev) => !prev);
      toast.success("Carousel deleted successfully!");
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Failed to delete Carousel!!");
      setError("Failed to delete the image. Please try again.");
    }
  };

  return (
    <div className="w-full my-3 mx-auto p-6 bg-white shadow-lg rounded-xl h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Manage Carousel Images
      </h2>
      <p className="text-gray-400 mb-2">
        Note:- Please upload the image less then 10 MB.
      </p>
      {/* Upload Image Section */}
      <div className="flex sm:flex-row flex-col items-center gap-6 mb-6">
        <div>
          {files.length === 0 ? (
            <Image
              src="/uploadImage.png"
              alt="Placeholder"
              width={400}
              height={400}
              className="rounded-lg sm:max-w-[400px] sm:h-auto w-full h-[200px] border-2 border-gray-300"
              unoptimized
            />
          ) : (
            <Image
              src={`${NEXT_PUBLIC_CLOUDINARY_URL}${URL.createObjectURL(
                files[0]
              )}`}
              alt="Selected Preview"
              width={400}
              height={400}
              className="rounded-lg border-2 sm:max-w-[400px] sm:h-auto w-full h-[200px] border-gray-300 object-contain"
              unoptimized
            />
          )}
          {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
          {files.length > 0 && (
            <Button
              onClick={handleUploadImages}
              disabled={loading || images.length + files.length > 5}
              className="mt-4 bg-green-600 text-white text-xl font-semibold py-6 px-10"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </Button>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white text-xl font-semibold py-6 px-10"
          >
            {files.length > 0 ? "Change Image" : "Add Image"}
          </Button>
        </div>
      </div>

      {/* Uploaded Images */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-3 ">
        Uploaded Images
      </h3>
      <div className="grid justify-center max-h-[600px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <LoadingContent className="h-56" key={index} />
          ))
        ) : images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="relative group h-56 w-full">
              <Image
                height={800}
                width={800}
                src={`${NEXT_PUBLIC_CLOUDINARY_URL}${image?.mediaUrl}`}
                alt={`Image ${image.id}`}
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
            No images available.
          </p>
        )}
      </div>

      {/* Error Message */}
    </div>
  );
};

export default UploadCarousel;
