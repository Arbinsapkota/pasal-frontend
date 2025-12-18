import TextEditorReadOnly from "@/components/(non-authenticated)/textEditor/TextEditorReadOnly";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";
import { Product } from "@/redux/slices/cartSlice";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onClose,
}) => {
  const cleaned = product?.description?.replace(/^,/, "");
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const originalPrice = product.price || 0;
  const discountPercent = product.discountPercentage || 0;
  const discountedPrice =
    discountPercent > 0
      ? originalPrice - (originalPrice * discountPercent) / 100
      : originalPrice;

  const [loadedImages, setLoadedImages] = useState<boolean[]>(
    Array(product.imageUrls.length).fill(false)
  );

  const handleImageLoad = (index: number) => {
    const newLoaded = [...loadedImages];
    newLoaded[index] = true;
    setLoadedImages(newLoaded);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 bg-white rounded-lg  space-y-6">
      {/* Title */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-2">
        Product Details
      </h2>

      {/* Image Carousel */}
      <div className="relative flex items-center">
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-110"
        >
          <FaChevronLeft className="text-gray-600 text-xl" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 py-2"
        >
          {product.imageUrls.map((url, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-60 h-60 rounded-3xl overflow-hidden border border-gray-200 bg-gradient-to-tr from-gray-100 via-white to-gray-50 relative"
            >
              <Image
                src={`${NEXT_PUBLIC_CLOUDINARY_URL}${url}`}
                height={500}
                width={500}
                alt={product.name}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWRlZWRlIi8+"
                className={`
          w-full h-full object-contain rounded-3xl
          transition-opacity duration-500 ease-in-out
          ${loadedImages[index] ? "opacity-100" : "opacity-0"}
        `}
                onLoadingComplete={() => handleImageLoad(index)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-110"
        >
          <FaChevronRight className="text-gray-600 text-xl" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>

        <p
          className={`text-lg font-medium ${
            product?.stock && product?.stock > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {product?.stock && product?.stock > 0
            ? `In Stock: ${product.stock}`
            : "Out of Stock"}
        </p>

        <div className="flex items-center gap-4">
          {discountPercent > 0 && (
            <p className="text-lg font-medium text-gray-400 line-through transition-transform transform hover:scale-105">
              Rs.{originalPrice.toFixed(2)}
            </p>
          )}
          <p className="text-2xl font-bold text-red-600 transition-transform transform hover:scale-105">
            Rs.{discountedPrice.toFixed(2)}
          </p>
          {discountPercent > 0 && (
            <span className="text-sm font-semibold text-white bg-red-500 rounded-full px-3 py-1 shadow-md animate-pulse">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Description:
          </p>
          {product?.description?.includes(",[{") ? (
            <TextEditorReadOnly value={cleaned} />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
