import TextEditorReadOnly from "@/components/(non-authenticated)/textEditor/TextEditorReadOnly";
import { Product } from "@/redux/slices/cartSlice";
import Image from "next/image";
import React from "react";

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onClose,
}) => {

  const cleaned = product?.description?.replace(/^,/, "");
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 text-black  ">
      <div
        className="fixed inset-0 bg-black opacity-50 "
        onClick={onClose}
      ></div>
      <div className="relative bg-white max-w-2xl max-h-screen overflow-y-scroll p-6 border border-gray-200 rounded-2xl mx-auto shadow-xl z-50  w-full flex justify-between transition-all duration-300 ">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <div>
          <p className="text-2xl font-semibold text-gray-800 mb-3 text-wrap underline">
            Product Details
          </p>
          <div className="flex gap-3 mb-4 overflow-x-auto mt-6">
            {product.imageUrls.map((url, index) => (
              <Image
                key={index}
                src={url}
                height={500}
                width={500}
                alt={product.name}
                className="w-52 h-52 object-contain rounded-lg border border-gray-200"
              />
            ))}
          </div>

          <h1 className="text-xl font-semibold text-gray-800 mb-3 text-wrap">
            {product.name}
          </h1>

          <p
            className={`text-base font-medium mb-2 ${
              product?.stock && product?.stock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Stock: {product.stock}
          </p>

          <p className="text-lg font-semibold text-gray-800 mb-2">
            Price: <span className="text-black">Rs.{product.price}</span>
          </p>

          <p className="text-lg font-semibold text-red-600 mb-4 ">
            Discount Price: Rs.{product.discountedPrice}
          </p>

          <div className="sm:pb-8 pb-2">
            <p className="text-sm underline text-gray-600 font-semibold pb-1">Description:</p>
            {product?.description?.includes(",[{") ? (
              <TextEditorReadOnly value={cleaned} />
            ) : (
              <p className="text-gray-600 mb-4">{product.description}</p>
            )}
          </div>
        </div>

        {/* Optional Rating */}
        {/* <p className="text-yellow-500 text-sm">
    Rating: {product.rating ? product.rating : "No rating available"}
  </p> */}
      </div>
    </div>
  );
};

export default ProductDetails;
