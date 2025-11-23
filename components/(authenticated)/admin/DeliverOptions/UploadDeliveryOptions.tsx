import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import React, { SetStateAction, useState } from "react";
import { IoIosTimer } from "react-icons/io";
import { toast } from "react-toastify";
const token = getTokenFromCookies();

interface UploadDeliveryOptionsProps {
  fetchDeliveryOptions: () => void;
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
}

function UploadDeliveryOptions({
  fetchDeliveryOptions,
  setIsUpdated,
}: UploadDeliveryOptionsProps) {
  const [deliveryOption, setDeliveryOption] = useState({
    option: "",
    description: "",
    charge: "",
    deliveryDays: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [loading, setLoading] = useState(false);
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryOption(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryOption.deliveryDays <= 0) {
      toast.dismiss();
      toast.error(
        "Delivery days must be at least 0. Please provide a valid value."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/`,
        {
          option: deliveryOption?.option,
          description: deliveryOption?.description,
          charge: parseFloat(deliveryOption?.charge),
          deliveryDays: deliveryOption?.deliveryDays,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        fetchDeliveryOptions();
        toast.success("Delivery option added successfully");
        setIsModalOpen(false); // Close the modal after successful submission
        setIsUpdated(prev => !prev);
        setDeliveryOption({
          option: "",
          description: "",
          charge: "",
          deliveryDays: 1,
        });
      } else {
        toast.dismiss();
        toast.error("Error adding delivery options");
      }
    } catch (error) {
      console.error("Error occurred while submitting delivery option:", error);
      toast.dismiss();
      toast.error("An error occurred while submitting the delivery option");
    } finally {
      setLoading(false);
    }
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="relative flex justify-end items-center">
      {/* Button to open the modal */}
      <button
        onClick={toggleModal}
        className="py-3 px-6 bg-primaryBlue/80 text-white font-semibold rounded-md hover:bg-primaryBlue/90 focus:outline-none focus:ring-2 focus:ring-primary/80 "
      >
        <i className="fa-solid fa-upload mr-2"></i> {/* Upload Icon */}
        Upload Delivery Option
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
          <div className=" p-6 rounded-lg shadow-lg max-w-lg w-full bg-white transform transition-all duration-300 ease-in-out ">
            <h2 className="text-2xl font-semibold text-center mb-4">
              <i className="fa-solid fa-truck mr-2"></i> Delivery Options
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Option Field */}
              <div className="mb-4">
                <label
                  htmlFor="option"
                  className=" text-sm font-medium text-gray-700 flex items-center"
                >
                  <i className="fa-solid fa-cogs mr-2"></i> Option
                </label>
                <input
                  type="text"
                  id="option"
                  name="option"
                  value={deliveryOption.option}
                  onChange={handleInputChange}
                  placeholder="Enter delivery option (e.g., SAME_DAY)"
                  className="w-full p-3 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="deliveryDays"
                  className=" text-sm font-medium text-gray-700 flex items-center"
                >
                  <IoIosTimer className="mr-2 size-4" />
                  Delivery Time (Days)
                </label>
                <input
                  type="number"
                  id="deliveryDays"
                  name="deliveryDays"
                  value={deliveryOption?.deliveryDays}
                  onChange={handleInputChange}
                  placeholder="Enter days"
                  className="w-full p-3 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className=" text-sm font-medium text-gray-700 flex items-center"
                >
                  <i className="fa-solid fa-info-circle mr-2"></i> Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={deliveryOption.description}
                  onChange={handleInputChange}
                  placeholder="Describe the delivery option"
                  className="w-full p-3 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Charge Field */}
              <div className="mb-4">
                <label
                  htmlFor="charge"
                  className=" text-sm font-medium text-gray-700 flex items-center"
                >
                  <span className="font-semibold mr-2">Rs.</span> Charge
                </label>
                <input
                  type="number"
                  id="charge"
                  name="charge"
                  value={deliveryOption.charge}
                  onChange={handleInputChange}
                  placeholder="Enter charge (e.g., 13.99)"
                  className="w-full p-3 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Submit and Close Buttons */}
              <div className="flex justify-between items-center">
                <button
                  disabled={loading}
                  type="submit"
                  className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <i className="fa-solid fa-check mr-2"></i>{" "}
                  {loading ? "submiting.." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="py-3 px-6 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                >
                  <i className="fa-solid fa-times mr-2"></i> Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadDeliveryOptions;
