"use client";
import React, { useState } from "react";
import axios from "axios";
import { getUserFromCookies } from "@/components/cookie/cookie"; // Adjust the path as necessary
import ChangePasswordDialog from "./ChangePasswordDialog";
import useUserData from "@/components/providers/UserProvider";
import ImageDetails from "./ImageDetails";
import { UserData } from "@/components/types/user";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

// Default user object if getUserFromCookies returns null
const cookieuser = getUserFromCookies();

const UserDetails: React.FC = () => {
  const { fieldValues, setFieldValues, fetchData } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserData
  ) => {
    const { value } = e.target;
    setFieldValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Create FormData instance
    const formData = new FormData();
    formData.append("firstName", fieldValues.firstName || "");
    formData.append("lastName", fieldValues.lastName || "");
    // formData.append("phone", fieldValues.contact || "");
    formData.append("address", fieldValues.address || "");

    try {
      // Send PUT request with FormData
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/updateUser/${cookieuser?.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${cookieuser?.token}`,
            "Content-Type": "multipart/form-data", // Set header for FormData
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchData();
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Error updating profile:", error);
    }
  };

  const handleOpenPasswordDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl mb-4">Personal Information</h2>

      <ImageDetails />
      <div className="flex justify-end">
        <Button
          onClick={handleOpenPasswordDialog}
          variant={"ghost"}
          className="hover:bg-white"
        >
          Change Password
        </Button>
      </div>
      <form noValidate autoComplete="off">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="text"
            value={fieldValues.email || ""}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-navy-blue"
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">First Name</label>
          <input
            type="text"
            value={fieldValues.firstName}
            onChange={(e) => handleFieldChange(e, "firstName")}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-navy-blue"
            disabled={!isEditing}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Last Name</label>
          <input
            type="text"
            value={fieldValues.lastName}
            onChange={(e) => handleFieldChange(e, "lastName")}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-navy-blue"
            disabled={!isEditing}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            value={fieldValues.address}
            onChange={(e) => handleFieldChange(e, "address")}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-navy-blue"
            disabled={!isEditing}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contact</label>
          <input
            type="text"
            value={fieldValues.contact}
            onChange={(e) => handleFieldChange(e, "contact")}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-navy-blue"
            disabled={!isEditing}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex justify-center flex-1">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="primary-btn px-4 py-2 rounded-lg text-white bg-primary-navy-blue transition-transform duration-300 ease-in-out hover:bg-gray-800 hover:scale-105"
              >
                Edit Profile
              </button>
            ) : (
              <div>
                <button
                  onClick={handleSaveAll}
                  className="my-4 sm:my-0 primary-btn px-4 py-2 rounded-lg text-white bg-primary-navy-blue transition-transform duration-300 ease-in-out hover:bg-gray-800 hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="ml-2 bg-red-500 px-4 py-2 rounded-lg text-white transition-transform duration-300 ease-in-out hover:bg-red-800 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Change Password Dialog */}
      {openPasswordDialog && (
        <ChangePasswordDialog onClose={handleClosePasswordDialog} />
      )}
    </div>
  );
};

export default UserDetails;