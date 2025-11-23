"use client";
import React, { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/components/axiosInstance";
import toast from "react-hot-toast";
import MaxWidthWrapper from "@/components/(authenticated)/admin/maxWidthWrapper";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | undefined | null>();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenParams = url?.searchParams?.get("token");

    if (tokenParams) {
      setToken(tokenParams); // Set the page state with the value from the URL
    }
  }, [searchParams]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    axiosInstance()
      .post(
        `/api/auth/reset-password?token=${token}&newPassword=${newPassword}&confirmPassword=${confirmPassword}`
      )
      .then(() => {
        toast.dismiss();
        toast.success("Password updated successfully!");
        router.push("/homepage");
        setIsSubmitting(false);
      })
      .catch(err => {
        toast.dismiss();
        toast.error("Something went wrong");
        setIsSubmitting(false);
        // window.location.reload();
      });
  };

  return (
    <>
      <MaxWidthWrapper>
        <div className=" bg-white mx-auto mt-10  rounded-lg  w-full max-w-lg overflow-y-auto">
          {/* Close Button */}

          <h2 className="text-3xl font-bold  text-center mb-3">
            Reset Password
          </h2>
          <hr className="mb-3" style={{ borderColor: "black" }} />

          <div className=" ">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className=" relative my-2">
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="text"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e?.target?.value)}
                  className="w-full border p-1 rounded-lg pl-2"
                  required
                />
              </div>
              <div className=" relative mb-2">
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e?.target?.value)}
                  className="w-full border p-1 rounded-lg pl-2"
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  className="w-full"
                  // className="primary-btn text-white py-1 px-4 rounded w-full"
                >
                  Submit{" "}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default ResetPassword;
