"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { getUserFromCookies } from "@/components/cookie/cookie";
import { toast } from "react-toastify";
import useUserData from "@/components/providers/UserProvider";
import { ClipLoader } from "react-spinners";

const cookieuser = getUserFromCookies();

const ImageDetails: React.FC = () => {
  const { user, fetchData, setFieldValues } = useUserData();

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileImage =
    previewUrl || user?.profileImageUrl || "/default-img.png";

  const handleSavePicture = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/updateUser/${cookieuser?.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookieuser?.token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Profile picture updated successfully");
        fetchData();
        setFieldValues((prev) => ({
          ...prev,
          profilePicture: previewUrl || "",
        }));
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditingImage(false);
      } else {
        toast.dismiss();
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.dismiss();
      toast.error("Something went wrong while updating");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/image/${cookieuser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${cookieuser?.token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Profile picture deleted");
        fetchData();
        setFieldValues((prev) => ({ ...prev, profilePicture: undefined }));
        setShowConfirmDelete(false);
        setIsEditingImage(false);
      } else {
        toast.dismiss();
        toast.error("Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.dismiss();
      toast.error("Something went wrong while deleting");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6  mt-10 ">
      <div className="flex flex-col items-center">
        <Image
          src={profileImage}
          alt="Profile"
          width={500}
          height={500}
          className="rounded-full object-cover border-2 border-gray-300  h-32 w-36"
        />

        <button
          onClick={() => setIsEditingImage(true)}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition-all"
        >
          <i className="fas fa-camera mr-2"></i> Edit Picture
        </button>

        {isEditingImage && (
          <div className="mt-6 w-full flex flex-col items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-lg text-gray-700">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSavePicture}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Save"}
              </button>

              <button
                onClick={() => setShowConfirmDelete(true)}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-transform hover:scale-105"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Delete"}
              </button>

              {/* <button
                onClick={() => {
                  setIsEditingImage(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400 transition-transform hover:scale-105"
              >
                Cancel
              </button> */}
            </div>
          </div>
        )}
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <p className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to delete your profile picture?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeletePicture}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Yes"}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDetails;
