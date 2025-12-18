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

  <DialogContent className="max-w-md w-full rounded-2xl p-0 overflow-hidden shadow-2xl">
    {/* Header */}
    <div className="px-8 pt-8 pb-6 border-b bg-gradient-to-r from-primaryBlue/10 to-transparent">
      <h2 className="text-3xl font-extrabold text-center text-primaryBlue">
        Welcome Back
      </h2>
      <p className="text-sm text-gray-500 text-center mt-1">
        Log in to continue to your account
      </p>
    </div>

    {/* Body */}
    <div className="px-8 py-6 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <i className="fa-solid fa-envelope"></i>
            </span>
            <input
              disabled={loading}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-300 focus:border-primaryBlue focus:ring-2 focus:ring-primaryBlue/30 transition"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-300 focus:border-primaryBlue focus:ring-2 focus:ring-primaryBlue/30 transition"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-primaryBlue transition"
            >
              {showPassword ? <GoEye size={18} /> : <LuEyeClosed size={18} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input
              disabled={loading}
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="accent-primaryBlue w-4 h-4"
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={toggleResetModal}
            className="text-primaryBlue font-medium hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <div>
          {loading ? (
            <button
              disabled
              type="submit"
              className="w-full h-11 rounded-xl bg-primaryBlue/80 text-white flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <i className="fa-solid fa-spinner animate-spin"></i>
              Logging in...
            </button>
          ) : (
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition"
            >
              Log In
            </Button>
          )}
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Google Login */}
      <GoogleLoginWrapper />

      {/* Footer */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?
        <button
          onClick={() => {
            closeLoginModal();
            openSignupModal();
          }}
          className="ml-1 font-semibold text-primaryBlue hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>

    {/* Reset Password */}
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
