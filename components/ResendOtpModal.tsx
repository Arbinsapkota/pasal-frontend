"use client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "./axiosInstance";
import { setUserCookie } from "./cookie/cookie";
import { useModal } from "./providers/ModalStateProvider";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export interface Plan {
  planId: string;
  planName: string;
  description: string;
  discount: number;
  durationInDays: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

const ResendOtpModal = () => {
  const { resendOtp, setResendOtp, otpMail } = useModal();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const { toast } = useToast();

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendOtp) {
      axiosInstance()
        .post(`/api/auth/send/otp?email=${otpMail}`)
        .then(res => {
          // console.log("Otp sent!");
          toast({
            title: "Otp sent!",
          });
        })
        .catch(err => console.error("Error ", err));
    }
  }, [resendOtp]);

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
        // setUserCookie(res.data.jwtToken);
        //   onClose();
        setResendOtp(false);
        setUserCookie(res?.data?.jwtToken);
        window.location.reload();
        toast({
          variant: "default",
          title: "Sign Up Successful",
          // description: "Password and confirm password don't match",
        });
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Signup Failed.",
          description: "Please try again later",
        });
      });
  };

  return (
    <div className="h-0">
      <Dialog open={resendOtp} onOpenChange={setResendOtp}>
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
                onKeyDown={e => e.key === "Backspace" && handleBackspace(index)}
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
          >
            Submit OTP
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResendOtpModal;
