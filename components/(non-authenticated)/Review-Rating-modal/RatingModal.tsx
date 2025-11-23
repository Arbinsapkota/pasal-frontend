import { axiosAuthInstance } from "@/components/axiosInstance";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";

interface RatingModalProps {
  // isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  setIdUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

const RatingModal: React.FC<RatingModalProps> = ({
  // isOpen,
  onClose,
  setIdUpdated,
  productId,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handleSave = async () => {
    if (rating === null) {
      toast.error("Please select a rating.");
      return;
    }
    setLoading(true);
    try {
      await axiosAuthInstance().post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-ratings/`,
        {
          products: { productId: productId },
          rating,
          review,
        }
        // {
        //   headers: {
        //     Authorization: `Bearer ${getCookie("token")}`,
        //   },
        // }
      );
      setIdUpdated(prev => !prev);
      onClose();
      toast.success("Review Posted successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center ">
      <div className="bg-white  sm:w-96 w-80 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Rate Product 
        </h2>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">Rate the Product</p>
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                disabled={loading}
                key={star}
                className={`text-2xl ${
                  star <= (rating || 0) ? "text-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            disabled={loading}
            placeholder="Write your review..."
            value={review}
            onChange={e => setReview(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            rows={4}
          ></textarea>
        </div>
        <div className="flex justify-end mt-4">
          <button
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 mr-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-2 text-sm primary-btn text-white rounded "
          >
            {loading ? (
              <span className="flex text-gray-500 items-center justify-center">
                {" "}
                <AiOutlineLoading3Quarters className="animate-spin" />
                saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
