"use client";
import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { getUserFromCookies } from "@/components/cookie/cookie";
import { toast } from "react-toastify";
import useUserData from "@/components/providers/UserProvider";
const cookieuser = getUserFromCookies();

const AdminImageDetails: React.FC = () => {
  const { user, fetchData, setFieldValues } = useUserData();
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State for preview URL
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for showing confirmation dialog

  const handleSavePicture = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/${cookieuser?.id}`,
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
        setPreviewUrl(null); // Clear preview after successful upload
        setIsEditingImage(true);
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("Error updating profile picture");
    }
  };

  const handleDeletePicture = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/image/${cookieuser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${cookieuser?.token}`,
          },

          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.success("Profile picture deleted successfully");
        fetchData();
        setFieldValues((prev) => ({ ...prev, profilePicture: undefined }));
        setShowConfirmDelete(false); // Close the confirmation dialog
        setIsEditingImage(true);
      } else {
        console.error("Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.error("Error deleting profile picture");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a preview URL for the selected file
    }
  };

  return (
    <div className="container mx-auto  p-4 max-w-lg">
      <div className="flex items-center justify-center mb-4">
        <Image
          src={previewUrl || user.profileImageUrl || "/default-img.png"} // Show preview if available, else show the current image
          alt="Profile Picture"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full"
        />
        <div className="ml-4">
          <button
            onClick={() => setIsEditingImage(true)}
            className="primary-orange"
          >
            <i className="fas fa-camera"></i>
          </button>
          {isEditingImage && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              <button
                onClick={handleSavePicture}
                className="bg-orange-500 rounded-sm px-3 py-1 text-white transition-transform duration-300 ease-in-out hover:bg-orange-600 hover:scale-105"
              >
                Change Picture
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)} // Show confirmation dialog
                className="ml-2 bg-orange-500 rounded-sm px-3 py-1 text-white transition-transform duration-300 ease-in-out hover:bg-orange-600 hover:scale-105"
              >
                Delete Picture
              </button>
              <button
                onClick={() => {
                  setIsEditingImage(false);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 bg-gray-300 text-black rounded ml-2 mt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to delete your profile picture?
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleDeletePicture}
                className="ml-2 bg-orange-500 rounded-sm px-3 py-1 text-white transition-transform duration-300 ease-in-out hover:bg-orange-600 hover:scale-105"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
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

export default AdminImageDetails;
