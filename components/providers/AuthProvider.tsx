"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { getCookie, deleteCookie } from "../cookie/cookie";

interface AuthContextProps {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getCookie("token"));

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = () => {
    // Set token logic here (for example, after a successful login)
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Remove token on logout
    deleteCookie("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
