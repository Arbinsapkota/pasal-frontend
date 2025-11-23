import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { axiosAuthInstance } from "../axiosInstance";
import { setUserCookie } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import ResetPasswordModal from "./reset-password/ResetPasswordModal";
import { LuEyeClosed } from "react-icons/lu";
import { GoEye } from "react-icons/go";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import ResendOtpModal from "../ResendOtpModal";
import GoogleLoginButton from "./GoogleLogin";
import GoogleLoginWrapper from "./GoogleLogin";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    openSignupModal,
    closeLoginModal,
    isLoginModalOpen,
    setIsLoginModalOpen,
    // resendOtp,
    setResendOtp,
    setOtpMail,
  } = useModal();
  const [loading, setLoading] = useState(false);
  const items = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [showPassword, setShowPassowrd] = useState<boolean>(false);
  const togglePassword = () => {
    return setShowPassowrd(prev => !prev);
  };
  // const user = getUserFromCookies();

  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const toggleResetModal = () => setIsResetModalOpen(!isResetModalOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        formData
      );
      if (response.status === 200) {
        toast({
          title: "Login Successful",
          description: "Friday, February 10, 2024 at 5:57 PM",
        });
        setUserCookie(response.data.jwtToken); // Expires in 7 days
        // await syncLocalData();
        window.location.reload();
        onClose(); // Close modal after successful submission
      }
    } catch (error: any) {
      console.log("err----", JSON.parse(error?.request?.responseText).message);
      4;

      if (
        JSON.parse(error?.request?.responseText).message ==
        "Invalid argument: Please verify your email for login...!"
      ) {
        setOtpMail(formData.email);
        setResendOtp(true);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: JSON.parse(error?.request?.responseText)?.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const syncLocalData = async () => {
    const cartSyncPromises = items.map(item => {
      axiosAuthInstance().post("/api/cart/add", {
        products: {
          productId: item.productId,
        },
        quantity: item.quantities,
      });
    });

    const wishlistSyncPromises = wishlistItems.map(item =>
      axiosAuthInstance().post("/api/wishlist/", {
        product: { productId: item.productId },
      })
    );
    try {
      await Promise.all([...cartSyncPromises, ...wishlistSyncPromises]);
    } catch (err) {
      console.error("Sync error", err);
    }
  };

  if (!isOpen) return null; // Do not render modal if it's not open

  return (
    <>
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogTrigger>
          <VisuallyHidden>
            <DialogTitle>Login</DialogTitle>
          </VisuallyHidden>
        </DialogTrigger>
        <DialogContent className="max-w-lg w-full ">
          {/* <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-auto p-6 space-y-4 overflow-y-auto"> */}
          {/* Logo */}
          <div>
            {/* <Image
              src="/etech-logo.jpg"
              alt="ETECH"
              width={540}
              height={540}
              className="mx-auto w-48  rounded-sm"
            /> */}
            <p className="sm:text-3xl text-xl text-primaryBlue text-center font-extrabold ">
              Log In
            </p>
          </div>

          {/* Heading */}
          {/* <h2 className="text-xl font-semibold text-center  hover:bg-gray-300">
              Log In
            </h2> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <label className="block font-medium text-gray-700 mb-1 text-lg">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  disabled={loading}
                  type="email"
                  name="email"
                  placeholder="Enter email address."
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-lg font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute top-4 right-2 pl-2 bg-white"
                >
                  {showPassword ? <GoEye /> : <LuEyeClosed />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input
                  disabled={loading}
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="accent-primaryBlue cursor-pointer"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={toggleResetModal}
                className="text-primaryBlue hover:underline "
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div>
              {loading ? (
                <button
                  disabled
                  type="submit"
                  className="w-full py-1.5 flex justify-center items-center bg-primaryBlue text-white rounded-lg cursor-not-allowed h-11"
                >
                  <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                  Logging In
                </button>
              ) : (
                <Button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xl font-semibold h-11"
                >
                  Log In
                </Button>
              )}
            </div>
          </form>

          <GoogleLoginWrapper />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?
            <button
              onClick={() => {
                closeLoginModal();
                openSignupModal();
              }}
              className="text-primaryBlue font-medium ml-1 hover:underline"
            >
              Sign up
            </button>
          </div>
          {/* </div> */}

          {isResetModalOpen && (
            <ResetPasswordModal
              isOpen={isResetModalOpen}
              toggleModal={toggleResetModal}
            />
          )}
        </DialogContent>
      </Dialog>
      <ResendOtpModal />
    </>
  );
};

export default LoginModal;
