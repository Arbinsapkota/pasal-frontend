import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
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

const ShowReview: React.FC<ReviewRatingProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  // const [rateModalOpen, setRateModalOpen] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-ratings/?product=${productId}`
        );
        const fetchedReviews = response.data;
        setReviews(fetchedReviews);
        calculateRatingStats(fetchedReviews); // Assuming this is defined elsewhere
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Error fetching reviews");
      }
    };

    fetchReviews();
  }, [productId]);

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
    <section className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Ratings & Reviews</h2>
        {/* <button
          onClick={() => setRateModalOpen(true)}
          className="primary-btn text-white py-2 px-4 rounded-lg "
        >
          Rate Product
        </button> */}
      </div>
      <div className="mb-6">
        <div className="flex items-center">
          <span className="text-4xl font-bold text-yellow-500">
            {averageRating.toFixed(1)}
          </span>
          <span className="ml-2 text-lg text-gray-600">
            ({totalRatings} Ratings)
          </span>
        </div>
        <div className="mt-4">
          {[5, 4, 3, 2, 1].map(star => (
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
                      (reviews.filter(review => review.rating === star).length /
                        totalRatings) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="ml-4 text-sm text-gray-600">
                {reviews.filter(review => review.rating === star).length}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y max-h-60 overflow-scroll">
        {reviews.map(review => (
          <div key={review.ratingId} className="py-4">
            <div className="flex flex-col  items-start">
              <div className="flex  text-yellow-500">
                {Array.from({ length: review.rating }, (_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <span className="sm:ml-2 text-wrap text-gray-800 font-medium">
                {review.review}
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
      setIdUpdated={setIdUpdated}
        // isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        productId={productId}
      /> */}
    </section>
  );
};

export default ShowReview;
