import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import {
  axiosAuthInstance,
  axiosMultipartInstance,
} from "@/components/axiosInstance";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { toast } from "react-toastify";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";

const UploadPopup: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/media/`);
        const popupImages = response.data.filter(
          (item: any) => item.mediaType === "POPUP"
        );
        setImages(popupImages);
      } catch (err) {
        // setError("Failed to fetch images. Please try again.");
        console.error("Error fetching images:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [isUpdated]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (!uploadedFile.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (uploadedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }
      setImage(uploadedFile);
      setError(null);
    }
  };

  const handleUploadImage = async () => {
    if (!image) {
      setError("Please select an image to upload.");
      toast.error("No image selected.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("mediaFile", image);
    formData.append("title", "popup-image");
    formData.append("mediaType", "POPUP");

    try {
      await axiosMultipartInstance().post(`/api/media/`, formData);
      toast.success("Popup Image Uploaded Successfully!");
      setImage(null);
      setIsUpdated(prev => !prev);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await axiosAuthInstance().delete(
        `${API_BASE_URL}/api/media/?imageId=${id}`
      );
      setIsUpdated(prev => !prev);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="w-full my-3 mx-auto p-6 bg-white shadow-lg rounded-xl h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Manage Popup Image
      </h2>
      <p className="text-gray-400 mb-2">
        Note:- Please upload the image less then 10 MB
      </p>
      {/* Upload Section */}
      <div className="flex sm:flex-row flex-col items-center gap-6 mb-6">
        <div>
          {image ? (
            <Image
              src={URL.createObjectURL(image)}
              alt="Selected Preview"
              width={400}
              height={400}
              className="rounded-lg border-2 border-gray-300 object-contain"
              unoptimized
            />
          ) : (
            <Image
              src="/uploadImage.png"
              alt="Upload Image"
              width={400}
              height={400}
              className="rounded-lg sm:max-w-[400px] sm:h-auto w-full h-[200px] border-2 border-gray-300"
              unoptimized
            />
          )}
          {images.length > 0 && (
            <p className="pt-2 text-md text-red-500">
              Please delete the previous uploaded image to upload new popup
              image.
            </p>
          )}
          {image && (
            <Button
              onClick={handleUploadImage}
              disabled={isSubmitting}
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
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length > 0}
            className="bg-blue-600 text-white text-xl font-semibold py-6 px-10"
          >
            {image ? "Change Image" : "Add Image"}
          </Button>
        </div>
      </div>

      {/* Uploaded Images */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">
        Uploaded Images
      </h3>
      <div className="grid justify-center max-h-[600px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 1 }).map((_, index) => (
            <LoadingContent className="h-56" key={index} />
          ))
        ) : images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="relative group h-56 w-full">
              <Image
                height={800}
                width={800}
                src={`${NEXT_PUBLIC_CLOUDINARY_URL}${image?.mediaUrl}`}
                alt={`Popup Image ${image.id}`}
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
            No popup image available.
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
};

export default UploadPopup;
