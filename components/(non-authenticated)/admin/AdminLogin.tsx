"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { setUserCookie } from "@/components/cookie/cookie";
import Image from "next/image";
import { GoEye } from "react-icons/go";
import { LuEyeClosed } from "react-icons/lu";

// Define the structure of the error response
interface ErrorResponse {
  message: string;
  [key: string]: string | number | boolean | undefined; // Better than 'any'
}

function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassowrd] = useState<boolean>(false);

  const tooglePassword = () => {
    return setShowPassowrd((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/admin/login`,
        { email, password }
      );

      if (response.status === 200) {
        setUserCookie(response.data.jwtToken); // Expires in 6 hrs
        toast({ title: "Login successful!", description: "" });
        router.push(
          `${process.env.NEXT_PUBLIC_FRONTEND_URL}/ETECH-Admin/dashboard`
        );
        window.location.reload();

        setEmail(""); // Clear email and password fields
        setPassword("");
      }
    } catch (error) {
      // Explicitly type the error
      const axiosError = error as AxiosError<ErrorResponse>;

      console.error("Login failed:", axiosError);

      // Safely access the message property
      const errorMessage =
        axiosError.response?.data.message || "Something went wrong";

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/newlogo.png"
          alt="ETECH"
          width={540}
          height={540}
          className="mx-auto sm:w-64 w-44  rounded-sm"
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl sm:px-0 px-2">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 ">
          <h2 className=" mb-8 text-center sm:text-3xl text-xl leading-9 font-extrabold ">
            Admin Login
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block sm:text-xl text-lg font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  placeholder="Enter your email address."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block sm:text-xl text-lg font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative ">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password."
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md"
                />
                <button
                  type="button"
                  onClick={tooglePassword}
                  className="absolute top-3 right-2 ml-2 bg-white  "
                >
                  {showPassword ? <GoEye /> : <LuEyeClosed />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center sm:py-2 py-1 px-4 border border-transparent rounded-md shadow-sm sm:text-xl text-lg text-white sm:h-12 h-10 font-semibold ${
                  loading
                    ? "bg-primaryBlue/80"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
