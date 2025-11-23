import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import { UserData } from "../types/user";

const useUserData = () => {
  const [user, setUser] = useState<UserData>({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contact: 0,
    userType: "",
    verified: false,
    createdAt: "",
    updatedAt: null,
    profileImageUrl: "",
    postalCode: 0,
    state: "",
    country: "",
    city: "",
  });

  const [fieldValues, setFieldValues] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const token = getTokenFromCookies();

      // console.log("Token from cookies:", token);
      if (token) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        const userData = response.data;
        setUser({
          userId: userData.userId || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          address: userData.address || "",
          contact: userData.contact || 0,
          userType: userData.userType || "",
          verified: userData.verified || false,
          createdAt: userData.createdAt || "",
          updatedAt: userData.updatedAt || null,
          profileImageUrl: userData.imageUrl || null,
          postalCode: userData.postalCode || 0,
          state: userData.state || "",
          country: userData.country || "",
          city: userData.city || "",
        });

        setFieldValues({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          address: userData.address || "",
          contact: userData.contact || 0,
          userType: userData.userType || "",
          verified: userData.verified || false,
          createdAt: userData.createdAt || "",
          updatedAt: userData.updatedAt || null,
          postalCode: userData.postalCode || 0,
          state: userData.state || "",
          country: userData.country || "",
          city: userData.city || "",
        });
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log("useEffect");
    fetchData();
  }, []);

  return { user, setUser, fieldValues, setFieldValues, fetchData, loading };
};

export default useUserData;
