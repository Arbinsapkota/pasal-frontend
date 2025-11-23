"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserFromCookies } from "@/components/cookie/cookie";
import { TrashIcon } from "lucide-react";

interface Feedback {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  quality: string;
  message: string;
  createdAt: string;
}

const FeedbackForm: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const cookieuser = getUserFromCookies();

  useEffect(() => {
    fetchFeedbacks();
  });

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/`,
        {
          headers: {
            Authorization: `Bearer ${cookieuser?.token}`,
          },
          withCredentials: true,
        }
      );
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Error fetching feedbacks.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/${id}`,
          {
            headers: {
              Authorization: `Bearer ${cookieuser?.token}`,
            },
            withCredentials: true,
          }
        );
        toast.success("Feedback deleted successfully!");
        fetchFeedbacks();
      } catch (error) {
        console.error("Error deleting feedback:", error);
        toast.error("Error deleting feedback.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* <h3 className="text-xl font-semibold mb-4">Feedbacks</h3> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border rounded-lg p-4 space-y-2">
            <div>
              <h4 className="font-semibold">
                {feedback.firstName} {feedback.lastName}
              </h4>
              <p className="text-sm text-gray-600">{feedback.email}</p>
              <p className="text-sm text-gray-600">
                Rating: {feedback.quality}
              </p>
              <p className="text-gray-700 mt-2">{feedback.message}</p>
              <p className="text-xs text-gray-500">
                Posted on: {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleDelete(feedback.id)}
                className="text-red-600 hover:text-red-800"
                aria-label={`Delete ${feedback.firstName}'s feedback`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackForm;
