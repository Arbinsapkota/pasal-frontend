"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";
import axios from "axios";
import { getCookie } from "../cookie/cookie";

// Define the structure of the shipping info
interface ShippingInfo {
  shippingId: string;
  address: string;
  phoneNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  createdAt: string;
  updatedAt: string;
}

interface ShippingInfoAPIResponse {
  shippingId: string;
  address: string;
  phoneNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  createdAt: string;
  updatedAt: string;
}

interface ShippingInfoContextType {
  shippingInfo: ShippingInfo[];
  loading: boolean;
  error: string | null;
  fetchShippingInfo: () => void;
}

// Create a context with default values
const ShippingInfoContext = createContext<ShippingInfoContextType | undefined>(
  undefined
);

interface ShippingInfoProviderProps {
  children: ReactNode;
}

export const ShippingInfoProvider: React.FC<ShippingInfoProviderProps> = ({
  children,
}) => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the shipping information from the API
  const fetchShippingInfo = async () => {
    try {
      const response = await axios.get<ShippingInfoAPIResponse[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping/info/by-user`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`, // Adjust for your token handling
          },
        }
      );
      // Filtering out the 'users' field as it is not used
      const cleanedData = response.data.map((item) => ({
        shippingId: item.shippingId,
        address: item.address,
        phoneNumber: item.phoneNumber,
        city: item.city,
        state: item.state,
        postalCode: item.postalCode,
        country: item.country,
        addressType: item.addressType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setShippingInfo(cleanedData); // Set the shipping data to state
    } catch (err) {
      setError("Error fetching shipping information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShippingInfoContext.Provider
      value={{ shippingInfo, loading, error, fetchShippingInfo }}
    >
      {children}
    </ShippingInfoContext.Provider>
  );
};

// Custom hook to use the shipping info context
export const useShippingInfo = (): ShippingInfoContextType => {
  const context = useContext(ShippingInfoContext);

  if (!context) {
    throw new Error(
      "useShippingInfo must be used within a ShippingInfoProvider"
    );
  }

  return context;
};
