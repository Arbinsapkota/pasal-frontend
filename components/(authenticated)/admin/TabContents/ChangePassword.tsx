"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import { Card } from "@/components/ui/card";
import { GoEye } from "react-icons/go";
import { LuEyeClosed } from "react-icons/lu";
const token = getTokenFromCookies();

const ChangePasswordDialog: React.FC = ({}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("oldPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmNewPassword);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/password/change`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Include credentials with the request
        }
      );
      if (response.status === 200) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      toast.error("Error changing password");
      console.error("Error changing password:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Security</h1>
      <Card className="p-8">
        <div className=" max-w-md">
          <form noValidate autoComplete="off">
            <div className="mb-4 relative">
              <label className="block text-gray-700 ">Current Password</label>
              <input
                type={showPassword.oldPassword ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("oldPassword")}
                className="absolute top-7 right-2 bg-white p-2"
              >
                {showPassword.oldPassword ? <GoEye /> : <LuEyeClosed />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700">New Password</label>
              <input
                type={showPassword.newPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute top-7 right-2 bg-white p-2"
              >
                {showPassword.newPassword ? <GoEye /> : <LuEyeClosed />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700">
                Confirm New Password
              </label>
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute top-7 right-2 bg-white p-2"
              >
                {showPassword.confirmPassword ? <GoEye /> : <LuEyeClosed />}
              </button>
            </div>
            <div className="flex justify-start ">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2  bg-primaryBlue hover:bg-primaryBlue/80 text-white rounded mr-2"
              >
                Change Password
              </button>
              <button className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-red-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChangePasswordDialog;
