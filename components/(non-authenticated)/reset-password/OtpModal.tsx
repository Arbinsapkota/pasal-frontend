import React, { useState } from "react";

interface OtpModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  handleVerifyOtp: (code: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  toggleModal,
  handleVerifyOtp,
}) => {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    handleVerifyOtp(code);
  };

  return (
    <div
      id="otp-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
    >
      <div className="relative p-6 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6">
          <div className="flex justify-end px-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
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
          <div className="flex flex-col justify-center items-center mb-6">
            <div className="text-2xl font-semibold">Enter OTP</div>
            <p className="text-sm text-gray-500">Please check your email or phone for the OTP.</p>
          </div>
          <div className="p-4">
            <form className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  id="otp-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                  placeholder="Enter OTP"
                  maxLength={6} // Assuming OTP is 6 digits
                  required
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="fa-regular fa-key text-gray-400"></i>
                </span>
              </div>
              <button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg focus:outline-none transition-all duration-300 ease-in-out"
                onClick={handleSubmit}
              >
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
