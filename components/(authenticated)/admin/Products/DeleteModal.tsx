"use client";

import { SetStateAction, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie, getTokenFromCookies } from "@/components/cookie/cookie";
import { useProductContext } from "../context/ProductContext";
import { Trash } from "lucide-react";

interface DeleteModalProps {
  title: string;
  id: string;
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
}

export default function DeleteModal({
  title,
  id,
  setIsUpdated,
}: DeleteModalProps) {
  const { fetchAndSetProducts } = useProductContext();
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handelDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/?productId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.status == 200) {
        fetchAndSetProducts();
        toast.dismiss();
        toast.success("Product Deleted Successfully");
        setOpen(false);
      }
      setIsUpdated(prev => !prev);
    } catch (err) {
      toast.dismiss();
      toast.dismiss();
      toast.error("Failed to delete Product");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex  ">
      {/* Button to Open Modal */}
      <button
        className="px-3 py-0.5 text-white bg-red-500 rounded hover:bg-red-600"
        onClick={() => setOpen(true)}
      >
        <Trash />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold text-left">{title}</h2>
            <p className="mt-2 text-gray-600 text-left">Delete This Product</p>
            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                onClick={handelDelete}
              >
                {loading ? "Deleting.." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
