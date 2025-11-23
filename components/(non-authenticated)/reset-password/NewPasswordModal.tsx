import React, { useState } from "react";

interface NewPasswordModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  handlePasswordReset: (newPassword: string, confirmPassword: string) => void;
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({
  isOpen,
  toggleModal,
  handlePasswordReset,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    handlePasswordReset(password, confirmPassword);
  };

  return (
    <div
      id="new-password-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-md"
    >
      <div className="relative p-4 w-full max-w-lg md:max-w-md mx-4 sm:mx-auto">
        <div className="relative bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6">
          <div className="flex justify-end">
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full w-8 h-8 flex justify-center items-center"
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

          <div className="text-center mb-6">
            <div className="text-xl font-semibold text-gray-800">Set New Password</div>
          </div>

          <form className="space-y-6">
            <div className="relative">
              <input
                type="password"
                name="new-password"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-3 placeholder-gray-400"
                placeholder="New password"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-lock text-gray-400"></i>
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-3 placeholder-gray-400"
                placeholder="Confirm password"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-lock text-gray-400"></i>
              </span>
            </div>

            <button
              type="button"
              className="w-full bg-green-600 text-white rounded-md py-3 font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-green-700 focus:outline-none"
              onClick={handleSubmit}
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordModal;
