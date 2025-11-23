"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { getTokenFromCookies } from "@/components/cookie/cookie";

const token = getTokenFromCookies();

const InfoCards: React.FC = () => {
  const [totalProduct, setTotalProduct] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        };

        const productResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/total`,
          config
        );
        setTotalProduct(productResponse.data);

        const customerResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/total-customers`,
          config
        );
        setTotalCustomers(customerResponse.data);

        const salesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/sales`,
          config
        );
        setTotalSales(salesResponse.data);

        const earningsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/earnings`,
          config
        );
        setTotalEarnings(earningsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  });

  const infoCardData = [
    {
      count: totalProduct ?? 0, // Fallback to 0 if null
      imageSrc: "https://i.ibb.co/Rb7fxdp/assignments-svgrepo-com.png",
      altText: "Total Products",
      label: "Total Products",
      bgColor: "bg-blue-100",
    },
    {
      count: totalCustomers ?? 0, // Fallback to 0 if null
      imageSrc: "https://i.ibb.co/Rb7fxdp/assignments-svgrepo-com.png",
      altText: "Total Customers",
      label: "Total Customers",
      bgColor: "bg-yellow-100",
    },
    {
      count: totalSales ?? 0, // Fallback to 0 if null
      imageSrc: "https://i.ibb.co/Rb7fxdp/assignments-svgrepo-com.png",
      altText: "Sales",
      label: "Sales",
      bgColor: "bg-green-100",
    },
    {
      count: totalEarnings ?? 0, // Fallback to 0 if null
      imageSrc: "https://i.ibb.co/Rb7fxdp/assignments-svgrepo-com.png",
      altText: "Rs",
      label: "Total Earnings",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {infoCardData.map((item, index) => (
        <div
          key={index}
          className={`${item.bgColor} shadow-lg rounded-lg p-6 flex flex-col items-start justify-between`}
        >
          <div className="w-full flex justify-between items-center">
            <h3 className="text-xl font-bold mb-2">{item.count}</h3>
            <Image
              src={item.imageSrc}
              alt={item.altText}
              width={24}
              height={24}
              className="mb-4"
            />
          </div>
          <p className="text-start text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default InfoCards;
