import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../axiosInstance";
import { setUserCookie } from "../cookie/cookie";
import { useModal } from "../providers/ModalStateProvider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import GoogleSignUpWrapper from "./GoogleSignup";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    closeSignupModal,
    openLoginModal,
    isOtpModalOpen,
    setIsOtpModalOpen,
    isSignupModalOpen,
    setIsSignupModalOpen,
  } = useModal();
  // const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  // Fixing ref type definition
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on next input after entering a digit or letter
  useEffect(() => {
    const nextIndex = otp.indexOf("");
    if (nextIndex !== -1) {
      inputsRef.current[nextIndex]?.focus();
    }
  }, [otp]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[A-Za-z0-9]*$/.test(value)) return; // Allow numbers and alphabets
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleBackspace = (index: number) => {
    const newOtp = [...otp];
    if (index > 0 && !otp[index]) {
      newOtp[index - 1] = ""; // Clear previous input when backspace is pressed
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus(); // Move to previous input
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== otp.length || otp.includes("")) {
      alert("Please fill all the OTP fields");
      return; // Prevent submission if OTP fields are empty
    }

    axiosInstance()
      .post(`/api/auth/verify-email?otp=${enteredOtp}`)
      .then(res => {
        setUserCookie(res.data.jwtToken);
        onClose();
        setIsOtpModalOpen(false);
        window.location.reload();
        toast.success("Sign Up Successful");
      })
      .catch(() => {
        toast.error("Verification Failed");
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and confirm password don't match");
      return;
    }

    const submitData = {
      users: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      },
      shippingInfo: {
        address: formData.address,
        phoneNumber: formData.contact,
        state: formData.state,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
      },
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        submitData
      );

      // const response = {
      //   status: 201, // Mock successful response
      //   data: { message: "Signup successful, check your email for the code" },
      // };

      if (response.status === 201) {
        toast.success("Sign Up Successful");
        // toast({
        //   title: "Signup Successful",
        //   description: "Check your email for code.",
        // });
        // onClose(); // Close modal after successful submission
      }
      setIsOtpModalOpen(true);
    } catch (error: any) {
      if (
        JSON.parse(error?.request?.responseText)?.message ==
        "Invalid argument: This email address is already in use. Please use a different email to proceed."
      ) {
        toast.error("Email already exists.");
      } else {
        toast.error(JSON.parse(error?.request?.responseText)?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="max-h-[90vh]  overflow-y-auto scrollbar-thin w-full max-w-md mx-auto p-6">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
        </DialogHeader>
        <div className=" ">
          {/* Close Button */}

          {/* <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2> */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Full Name"
                required
              />
              <i className="fa-solid fa-user absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Email Address"
                required
              />
              <i className="fa-solid fa-envelope absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Contact Number"
                required
              />
              <i className="fa-solid fa-phone absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Address"
                required
              />
              <i className="fa-solid fa-address-card absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Password"
                required
              />
              <i className="fa-solid fa-lock absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg pl-10 focus:ring-2 focus:ring-gray-500"
                placeholder="Confirm Password"
                required
              />
              <i className="fa-solid fa-lock absolute left-3 bottom-1  transform -translate-y-1/2 text-gray-500"></i>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                onChange={handleChange}
                className="h-4 w-4 text-gray-500 focus:ring-2 focus:ring-gray-500 cursor-pointer"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm">
                I agree to the{" "}
                <span
                  className="text-gray-500  hover:underline cursor-pointer"
                  onClick={() => {
                    router.push("/policies/terms-and-conditions");
                    setIsSignupModalOpen(false);
                  }}
                >
                  Terms and Conditions
                </span>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-lg text-white ${
                  loading ? "bg-primaryBlue" : "bg-primaryBlue"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                    Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>
          {isOtpModalOpen && (
            <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
              <DialogTrigger></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify </DialogTitle>
                  <DialogDescription>
                    Your code was sent to you via email.
                  </DialogDescription>{" "}
                </DialogHeader>

                <div className="flex gap-4">
                  {otp.map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={e => handleOtpChange(e.target.value, index)}
                      onKeyDown={e =>
                        e.key === "Backspace" && handleBackspace(index)
                      }
                      ref={el => {
                        if (el) {
                          inputsRef.current[index] = el;
                        }
                      }}
                      className="w-16 h-16 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                <Button
                  onClick={handleOtpSubmit}
                  // className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className="bg-primaryBlue"
                >
                  Submit OTP
                </Button>
              </DialogContent>
            </Dialog>
          )}
          <div className="mt-3">
            <GoogleSignUpWrapper />
          </div>
          <div className="text-center mt-4">
            Already have an account?{" "}
            <span
              className="text-primaryBlue underline cursor-pointer"
              onClick={() => {
                closeSignupModal();
                openLoginModal();
              }}
            >
              Sign In
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
