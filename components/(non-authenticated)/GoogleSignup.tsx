"use client";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import React from "react";
import toast from "react-hot-toast";

import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import axios from "axios";
import { setUserCookie } from "../cookie/cookie";

const GoogleLoginButton: React.FC = () => {
  const handleSuccess = async (tokenResponse: any) => {
    // const formData = new FormData();
    // formData.append("googleAccessToken", tokenResponse.access_token);
    // formData.append("userType", "USER");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google/signup`,
        {},
        {
          params: {
            googleAccessToken: tokenResponse.access_token,
          },
        }
      )
      .then(async response => {
        await setUserCookie(response.data);
        window.location.reload();
        toast.dismiss();
        toast.success("Google signup Successfully!");
      })
      .catch(err => {
        if (err.response.data) {
          toast.dismiss();
          toast.error(err.response.data.message || "Google signup failed.");
        } else {
          toast.dismiss();
          toast.error("Google signup failed.");
        }
      });
  };

  const login = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: () => console.error("Login failed."),
  });

  return (
    <Button
      type="button"
      className="w-full flex items-center gap-1.5"
      variant={"outline"}
      onClick={() => login()}
    >
      <FcGoogle className="size-6" />

      <span>Sign up with Google</span>
    </Button>
  );
};

const GoogleSignUpWrapper: React.FC = () => (
  <GoogleOAuthProvider
    clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
  >
    <GoogleLoginButton />
  </GoogleOAuthProvider>
);

export default GoogleSignUpWrapper;
