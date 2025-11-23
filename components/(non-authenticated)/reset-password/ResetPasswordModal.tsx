import React, { useState } from "react";
import axios from "axios";
import OtpModal from "./OtpModal";
import NewPasswordModal from "./NewPasswordModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/providers/ModalStateProvider";

interface ResetPasswordModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  toggleModal,
}) => {
  const { isLoginModalOpen, setIsLoginModalOpen } = useModal();
  const [email, setEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isNewPasswordModalOpen, setIsNewPasswordModalOpen] = useState(false);
  const router = useRouter();
  if (!isOpen) return null;

  const formData = new FormData();
  formData.append("email", email);

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`,
        formData
      );

      if (response.status === 200) {
        toast.success("Password reset link has been sent to your email.");
        setIsLoginModalOpen(false);
        // toggleModal();
        // router.push("/reset-password");

        // setIsOtpModalOpen(true); // Open OTP modal
      }
    } catch (error) {
      console.error("Reset password failed", error);
      toast.error("Reset password failed");
    }
  };

  const handleVerifyOtp = async (code: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/verifyResetCode`,
        { email, code }
      );
      if (response.status === 200) {
        toast.success("OTP verified successfully");
        setIsOtpModalOpen(false);
        setIsNewPasswordModalOpen(true); // Open new password modal
      }
    } catch (error) {
      console.error("OTP verification failed", error);
      toast.error("OTP verification failed");
    }
  };

  const handlePasswordReset = async (
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/resetPassword`,
        { email, password }
      );
      if (response.status === 200) {
        toast.success("Password reset successfully.");
        setIsNewPasswordModalOpen(false);
        toggleModal(); // Close reset password modal
      }
    } catch (error) {
      console.error("Password reset failed", error);
      toast.error("Password reset failed");
    }
  };

  const toggleOtpModal = () => {
    setIsOtpModalOpen(!isOtpModalOpen);
  };

  const toggleNewPasswordModal = () => {
    setIsNewPasswordModalOpen(!isNewPasswordModalOpen);
  };

  return (
    <>
      <div
        id="reset-password-modal"
        tabIndex={-1}
        aria-hidden="true"
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm backdrop-brightness-75 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end px-4 md:px-5 rounded-t dark:border-gray-600">
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleModal}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="flex flex-col justify-center items-center py-4">
              <div className="text-2xl font-semibold">Reset Password</div>
            </div>
            <div className="p-4 md:p-5">
              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                    placeholder="Email address"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <i className="fa-regular fa-envelope text-gray-400"></i>
                  </span>
                </div>
                <button
                  type="button"
                  className="primary-btn rounded-sm px-3 py-2 text-white transition-transform duration-300 ease-in-out hover:scale-105 w-full"
                  onClick={handleResetPassword}
                >
                  Request Password Reset
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <OtpModal
        isOpen={isOtpModalOpen}
        toggleModal={toggleOtpModal}
        handleVerifyOtp={handleVerifyOtp}
      />
      <NewPasswordModal
        isOpen={isNewPasswordModalOpen}
        toggleModal={toggleNewPasswordModal}
        handlePasswordReset={handlePasswordReset}
      />
    </>
  );
};

export default ResetPasswordModal;
