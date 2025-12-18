"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { setUserCookie } from "@/components/cookie/cookie";
import Image from "next/image";
import { GoEye } from "react-icons/go";
import { LuEyeClosed } from "react-icons/lu";

interface ErrorResponse {
  message: string;
  [key: string]: string | number | boolean | undefined;
}

function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/admin/login`,
        { email, password }
      );

      if (response.status === 200) {
        setUserCookie(response.data.jwtToken);
        toast({ title: "Login successful!" });
        router.push(
          `${process.env.NEXT_PUBLIC_FRONTEND_URL}/ETECH-Admin/dashboard`
        );
        window.location.reload();
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white px-4 relative overflow-hidden">
      {/* Glowing Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => {
          const size = 4 + Math.random() * 6;
          return (
            <div
              key={i}
              className={`absolute rounded-full bg-blue-200 opacity-50 animate-glow${
                i % 3
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${6 + Math.random() * 6}s`,
                animationDelay: `${Math.random() * 5}s`,
                filter: `blur(${1 + Math.random() * 2}px)`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/newlogo.png"
            alt="ETECH"
            width={260}
            height={260}
            className="rounded-xl"
          />
        </div>

        {/* Shimmer Card without shadow */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-60 animate-shimmer" />
          <div className="relative z-10 bg-white/95 backdrop-blur-sm px-10 pt-10 pb-6 border-b border-gray-100">
            <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
              Admin Portal
            </h2>
            <p className="text-center text-sm text-gray-500 mt-1">
              Secure access for administrators
            </p>
          </div>

          <div className="relative z-10 px-10 py-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  placeholder="admin@etech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white px-4 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-1 transition appearance-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full h-12 rounded-xl bg-white px-4 pr-12 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-1 transition appearance-none"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 transition"
                  >
                    {showPassword ? <GoEye size={20} /> : <LuEyeClosed size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-xl text-lg font-semibold text-white transition-all duration-500 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-500 hover:to-blue-600 animate-gradient"
                }`}
              >
                {loading ? "Authenticating..." : "Secure Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} ETECH • Restricted Access
        </p>
      </div>

      <style jsx>{`
        /* Remove default browser password eye */
        input[type="password"]::-ms-reveal {
          display: none;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-inner-spin-button,
        input[type="password"]::-webkit-clear-button {
          display: none;
          -webkit-appearance: none;
        }

        /* Shimmer */
        @keyframes shimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
          background-size: 1000px 100%;
        }

        /* Gradient button */
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        /* Floating glowing particles */
        @keyframes glow1 {
          0% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-20px) translateX(15px); opacity: 0.6; }
          100% { transform: translateY(0) translateX(0); opacity: 0.4; }
        }
        @keyframes glow2 {
          0% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-15px) translateX(-10px); opacity: 0.5; }
          100% { transform: translateY(0) translateX(0); opacity: 0.3; }
        }
        @keyframes glow3 {
          0% { transform: translateY(0) translateX(0); opacity: 0.5; }
          50% { transform: translateY(-25px) translateX(5px); opacity: 0.7; }
          100% { transform: translateY(0) translateX(0); opacity: 0.5; }
        }
        .animate-glow0 { animation: glow1 7s ease-in-out infinite alternate; }
        .animate-glow1 { animation: glow2 8s ease-in-out infinite alternate; }
        .animate-glow2 { animation: glow3 6s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}

export default AdminLogin;
