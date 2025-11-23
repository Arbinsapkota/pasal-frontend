"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { getCookie } from "@/components/cookie/cookie";

interface ImageData {
  featureId: string;
  fileUrl: string;
  imageType: string;
  createdAt: string | null;
  updatedAt: string;
}

function ImageList() {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
          withCredentials: true,
        }
      );
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
      // toast.error("Failed to fetch images");
    }
  };

  const handleDeleteImage = async (featureId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/?imageId=${featureId}`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
          withCredentials: true,
        }
      );
      toast.success("Image deleted successfully");
      setImages(prevImages =>
        prevImages.filter(image => image.featureId !== featureId)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div>
        <h3 className="text-xl font-semibold mb-4">Featured Images</h3>
        {["FEATURE", "POPUP", "PRODUCTBANNER"].map(imageType => (
          <div key={imageType} className="mb-6">
            <h4 className="text-lg font-medium mb-2 capitalize">{imageType}</h4>
            <div className="grid grid-cols-3 gap-4">
              {images
                .filter(image => image.imageType === imageType)
                .map(image => (
                  <div key={image.featureId} className="relative">
                    <Image
                      src={image?.fileUrl || "/product.png"}
                      width={160}
                      height={90}
                      alt={`${imageType} image`}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Created:{" "}
                      {image.createdAt
                        ? new Date(image.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <button
                      onClick={() => handleDeleteImage(image.featureId)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageList;
