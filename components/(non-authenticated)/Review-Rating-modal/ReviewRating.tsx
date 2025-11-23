import React, { useState, useEffect } from "react";
import axios from "axios";
import RateProductModal from "./RatingModal";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
interface Review {
  ratingId: string;
  rating: number;
  review: string;
  // createdAt: string;
  // productId: string;
  // likesCount: number;
  // disLikesCount: number;
}

interface ReviewRatingProps {
  productId: string | null;
}

const ReviewRating: React.FC<ReviewRatingProps> = ({ productId }) => {
  // console.log("product id  in review raintg", productId);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rateModalOpen, setRateModalOpen] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [updated, setIdUpdated] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-ratings/?product=${productId}`
        );
        const fetchedReviews = response.data;
        setReviews(fetchedReviews);
        calculateRatingStats(fetchedReviews); // Assuming this is defined elsewhere
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Error fetching reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, updated]);

  const calculateRatingStats = (reviews: Review[]) => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = total > 0 ? sum / total : 0;
    setAverageRating(avg);
    setTotalRatings(total);
  };

  // const handleLike = async (reviewId: string) => {
  //   try {
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/review/likes`,
  //       {
  //         users: { id: user?.id },
  //         reviews: { id: reviewId },
  //         likes: "L",
  //       },
  //       { withCredentials: true }
  //     );
  //     const updatedReviews = reviews.map((review) =>
  //       review.review.id === reviewId
  //         ? { ...review, likesCount: review.likesCount + 1 }
  //         : review
  //     );
  //     setReviews(updatedReviews);
  //   } catch (error) {
  //     console.error("Error liking the review:", error);
  //   }
  // };

  // const handleDislike = async (reviewId: string) => {
  //   try {
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/review/likes`,
  //       {
  //         users: { id: user?.id },
  //         reviews: { id: reviewId },
  //         likes: "D",
  //       },
  //       { withCredentials: true }
  //     );
  //     const updatedReviews = reviews.map((review) =>
  //       review.review.id === reviewId
  //         ? { ...review, disLikesCount: review.disLikesCount + 1 }
  //         : review
  //     );
  //     setReviews(updatedReviews);
  //   } catch (error) {
  //     console.error("Error disliking the review:", error);
  //   }
  // };

  return (
    <section className="sm:w-full w-[230px] p-2 sm:px-4 mt-1.5 bg-white flex flex-col  items-center justify-between space-x-6 rounded-lg shadow-md">
      <div className=" flex justify-between items-center gap-3 w-full">
        {loading ? (
          <LoadingContent className="h-[100px] w-[200px]" />
        ) : reviews.length > 0 ? (
          ""
        ) : (
          <Dialog open={rateModalOpen} onOpenChange={setRateModalOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => setRateModalOpen(true)}
                className="bg-primaryBlue sm:text-sm text-xs text-white py-1 px-2 rounded-lg "
              >
                Rate Product
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="hidden">
                <DialogTitle className="hidden">Rating and Review</DialogTitle>
              </DialogHeader>
              <RateProductModal
                setIdUpdated={setIdUpdated}
                // isOpen={rateModalOpen}
                onClose={() => setRateModalOpen(false)}
                productId={productId}
              />
            </DialogContent>
          </Dialog>
        )}
        <div className="">
          {loading ? (
            ""
          ) : (
            <div className="flex sm:flex-row flex-col items-center">
              <span className="sm:text-xl text-sm font-bold text-yellow-500">
                {averageRating.toFixed(1)}
              </span>
              <span className="  sm:text-sm text-xs  text-gray-600">
                ({totalRatings} Ratings)
              </span>
            </div>
          )}
          {/* mahendra */}
          {/* <div className="mt-4">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center mb-2">
              <span className="text-sm text-gray-600">{star}</span>
              <div className="ml-2 flex text-yellow-500">
                {Array.from({ length: star }, (_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <div className="ml-4 w-full bg-gray-200 h-2 rounded-md overflow-hidden">
                <div
                  className="bg-green-500 h-2"
                  style={{
                    width: `${
                      (reviews.filter((review) => review.rating === star)
                        .length /
                        totalRatings) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="ml-4 text-sm text-gray-600">
                {reviews.filter((review) => review.rating === star).length}
              </span>
            </div>
          ))}
        </div> */}
        </div>
      </div>

      <div className="  divide-y w-full  max-h-40 overflow-y-scroll">
        {reviews.map(review => (
          <div key={review.ratingId} className="py-4">
            <div className="flex flex-col items-start w-full">
              <div className="flex text-yellow-500">
                {Array.from({ length: review.rating }, (_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <span className=" text-gray-800 text-wrap font-medium">
                {review.review} this is the product details of the
              </span>
            </div>
            {/* <div className="flex items-center mt-2 text-sm text-gray-500">
              <button
                // onClick={() => handleLike(review.review.id)}
                className="flex items-center mr-4"
              >
                <i className="fa-solid fa-thumbs-up"></i>
                <span className="ml-1">{review.likesCount}</span>
              </button>
              <button
                // onClick={() => handleDislike(review.review.id)}
                className="flex items-center"
              >
                <i className="fa-solid fa-thumbs-down"></i>
                <span className="ml-1">{review.disLikesCount}</span>
              </button>
            </div> */}
          </div>
        ))}
      </div>
      {/* <RateProductModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        productId={productId}
      /> */}
    </section>
  );
};

export default ReviewRating;
