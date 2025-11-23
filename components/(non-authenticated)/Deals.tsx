"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCalendar } from "react-icons/fa";
import { axiosInstance } from "../axiosInstance";
import { Button } from "../ui/button";

// Types
type OfferFormat = {
  offer: {
    title: string;
    discountValue: number;
    description: string;
    endDate: string;
  };
  products: {
    productId: string;
  };
};

type ProductDetails = {
  productId: string;
  imageUrls: string[];
  title: string;
};

const Deals = () => {
  const [offers, setOffers] = useState<OfferFormat[]>([]);
  const [products, setProducts] = useState<Record<string, ProductDetails>>({});

  useEffect(() => {
    axiosInstance()
      .get("/api/offers/active")
      .then(async res => {
        const fetchedOffers: OfferFormat[] = res.data;
        setOffers(fetchedOffers);

        const productFetches = await Promise.all(
          fetchedOffers.map(offer =>
            axiosInstance().get(
              `/api/product/?productId=${offer.products?.productId}`
            )
          )
        );

        const productMap: Record<string, ProductDetails> = {};
        productFetches.forEach(res => {
          const product = res.data;
          const id = product?.productId;
          if (id) productMap[id] = product;
        });

        setProducts(productMap);
      })
      .catch(err => console.error("Error fetching offers", err));
  }, []);

  const DealCard = ({
    product,
    offerData,
  }: {
    product: ProductDetails;
    offerData: OfferFormat;
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white rounded-xl shadow-md p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg max-w-60 sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto flex-shrink-0 sm:h-60 h-[320px]">
        {/* Product image */}
        <div className="relative w-[130px] h-[130px] flex-shrink-0">
          <Image
            src={product?.imageUrls?.[0] || "/product.png"}
            alt={product?.title || "Product Image"}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, 100px"
            className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>

        {/* Offer details */}
        <div className="flex-1 sm:space-y-1.5  space-y-1 text-start sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-xs font-medium text-gray-600">
              DISCOUNT:
            </span>
            <span className="text-base md:text-sm font-bold text-blue-600">
              Rs.{offerData?.offer?.discountValue || "0"}
            </span>
          </div>

          <h2 className="text-base md:text-lg font-semibold text-blue-700 line-clamp-1">
            {offerData?.offer?.title || "Latest Offer"}
          </h2>

          <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
            {offerData?.offer?.description || "Dedicated by the founder"}
          </p>

          <div className="flex items-center text-xs md:text-sm text-gray-500">
            <FaCalendar className="mr-2" />
            <span>{offerData?.offer?.endDate || "N/A"}</span>
          </div>

          <Button
            asChild
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs md:text-sm px-4 py-2"
          >
            <Link href={`/homepage/products/${product?.productId}`}>
              Shop Now!
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`py-6 px-4 sm:px-4 lg:px-6 ${
        offers.length === 0 && "hidden"
      } bg-white min-h-[300px] `}
    >
      <div className="max-w- mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6  sm:text-left">
          {offers[0]?.offer?.title || "Exclusive Deals"}
        </h2>

        {/* Grid Layout for All Screens */}
        <div className="flex  overflow-x-scroll scrollbar-thin sm:gap-6 gap-2 pb-2">
          {offers.map((offerData, index) => {
            const product = products[offerData?.products?.productId || ""];
            return (
              <div key={index} className="w-full">
                <DealCard product={product} offerData={offerData} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Deals;
