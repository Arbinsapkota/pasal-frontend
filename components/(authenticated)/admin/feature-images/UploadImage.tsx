"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { getCookie } from "@/components/cookie/cookie";

function UploadImage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedimageType, setSelectedimageType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setSelectedImage(null);
      setPreview(null);
    }
  };

  const handleimageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedimageType(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTitle(e.target.value);
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !selectedimageType) {
      toast.error("No image or imageType selected");
      return;
    }

    const formData = new FormData();
    formData.append("mediaFile", selectedImage);
    formData.append("mediaType", selectedimageType);
    formData.append("title", title);

    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            "Content-Type": "multipart/form-data",
            Accept: "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success("Upload successful");
      setSelectedImage(null);
      setPreview(null);
      setSelectedimageType("");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Update Featured Images
      </h2>

      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {preview && (
          <div className="mt-4">
            <Image
              src={preview || "/product.png"}
              width={160}
              height={90}
              alt="Selected Preview"
              className="w-48 h-48 object-cover rounded-md"
            />
          </div>
        )}
        <select
          value={selectedimageType}
          onChange={handleimageTypeChange}
          className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select imageType</option>
          <option value="POPUP">Popup Image</option>
          <option value="FEATURE">Featured Image</option>
        </select>

        {selectedimageType === "FEATURE" && (
          <select
            value={title}
            onChange={handleTitleChange}
            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Featured Image Type</option>
            <option value="top-banner">Top Banner</option>
            <option value="productBanner">Product Banner Image</option>
            <option value="mid-banner">Mid Banner</option>
          </select>
        )}

        <button
          disabled={loading}
          onClick={handleImageUpload}
          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </div>
  );
}

export default UploadImage;
